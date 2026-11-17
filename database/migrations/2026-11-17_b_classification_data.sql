-- Entity Classification restructuring — Part B: data move (IDs and public codes preserved; no DROP/TRUNCATE)
do $mig$
declare m record; n int; v_id uuid; code text; ed text := 'إعادة تصنيف الكيانات';
begin
 perform set_config('app.editor', ed, true);
 create temp table cls_map(code text primary key, newtype text, kind text) on commit drop;
 insert into cls_map values
  ('ORG-0016','festival',null),('ORG-0017','festival',null),('ORG-0027','festival',null),('ORG-0033','festival',null),('ORG-0034','festival',null),
  ('ORG-0002','ensemble','Choir'),('ORG-0003','ensemble','Choir'),('ORG-0005','ensemble','Choir'),('ORG-0006','ensemble','Choir'),('ORG-0009','ensemble','Choir'),
  ('ORG-0001','program','Training Program'),('ORG-0010','program','Evaluation Service'),
  ('ORG-0004','project',null),('ORG-0022','season',null);
 select count(*) into n from cls_map c join archive.entity e on e.public_code=c.code and e.entity_type='organization' join archive.organization o on o.entity_id=e.id;
 if n<>14 then raise exception 'map mismatch: %', n; end if;

 insert into archive.festival(entity_id,name_ar,name_en,legacy_type) select o.entity_id,o.name_ar,o.name_en,o.organization_type from cls_map c join archive.entity e on e.public_code=c.code join archive.organization o on o.entity_id=e.id where c.newtype='festival';
 insert into archive.ensemble(entity_id,name_ar,name_en,legacy_type,ensemble_type) select o.entity_id,o.name_ar,o.name_en,o.organization_type,c.kind from cls_map c join archive.entity e on e.public_code=c.code join archive.organization o on o.entity_id=e.id where c.newtype='ensemble';
 insert into archive.program(entity_id,name_ar,name_en,legacy_type,program_kind) select o.entity_id,o.name_ar,o.name_en,o.organization_type,c.kind from cls_map c join archive.entity e on e.public_code=c.code join archive.organization o on o.entity_id=e.id where c.newtype='program';
 insert into archive.project(entity_id,name_ar,name_en,legacy_type) select o.entity_id,o.name_ar,o.name_en,o.organization_type from cls_map c join archive.entity e on e.public_code=c.code join archive.organization o on o.entity_id=e.id where c.newtype='project';
 insert into archive.season(entity_id,name_ar,name_en,legacy_type) select o.entity_id,o.name_ar,o.name_en,o.organization_type from cls_map c join archive.entity e on e.public_code=c.code join archive.organization o on o.entity_id=e.id where c.newtype='season';
 select (select count(*) from archive.festival)+(select count(*) from archive.ensemble)+(select count(*) from archive.program)+(select count(*) from archive.project)+(select count(*) from archive.season) into n;
 if n<>14 then raise exception 'copy mismatch: %', n; end if;

 update archive.entity e set entity_type=c.newtype from cls_map c where e.public_code=c.code and e.entity_type='organization';
 delete from archive.organization where entity_id in (select e.id from archive.entity e join cls_map c on c.code=e.public_code);  -- 14 explicit ids, copied above and backed up in bk_cls_20261117_organization

 create temp table new_fes(nm text, ev text) on commit drop;
 insert into new_fes values ('مهرجان نقابة المهن التمثيلية','E-0021'),('مهرجان المسرح العربي','E-0060'),('منشد الشارقة','E-0016'),('مهرجان نوادي المسرح','E-0069'),('مهرجان الأفق الدولي','E-0053');
 for m in select * from new_fes loop
  code := archive.next_code('FES-');
  insert into archive.entity(public_code,entity_type,verification,privacy,confirmation_scope)
   values(code,'festival','Pending Review','Internal','Created from event names during Entity Classification restructuring 2026-11-17') returning id into v_id;
  insert into archive.festival(entity_id,name_ar) values(v_id,m.nm);
  insert into archive.translation(entity_id,field,lang,body,status,author,updated_by) values(v_id,'name_ar','ar',m.nm,'Entered',ed,ed);
  insert into archive.source_snapshot(entity_id,src_table,src_pk,row_data) values(v_id,'classification_restructure',code,jsonb_build_object('from_event',m.ev,'name_ar',m.nm));
  insert into archive.review_item(entity_id,reason,detail) values(v_id,'مهرجان جديد اتعمل من اسم حدث','اتعمل أثناء إعادة التصنيف من الحدث '||m.ev||'. راجع الاسم والجهة المنظمة.');
  insert into archive.entity_relation(from_entity,to_entity,kind,note) select ev.id,v_id,'part_of','ربط تلقائي أثناء إعادة التصنيف 2026-11-17 من اسم الحدث' from archive.entity ev where ev.public_code=m.ev;
 end loop;

 insert into archive.entity_relation(from_entity,to_entity,kind,note)
 select ev.id,f.id,'part_of','ربط تلقائي أثناء إعادة التصنيف 2026-11-17 من اسم الحدث'
 from (values ('E-0050','ORG-0016'),('E-0052','ORG-0017'),('E-0017','ORG-0027'),('E-0071','ORG-0027'),('E-0059','ORG-0033')) v(ec,fc)
 join archive.entity ev on ev.public_code=v.ec join archive.entity f on f.public_code=v.fc;
 insert into archive.entity_relation(from_entity,to_entity,kind,note)
 select ev.id,f.id,'concerns','حدث تأسيس الفرقة — ربط من اسم الحدث' from archive.entity ev, archive.entity f where ev.public_code='E-0057' and f.public_code='ORG-0002';

 update archive.event set event_type='دورة مهرجان' where event_type in ('مهرجان','مهرجان / جائزة');
 get diagnostics n = row_count; if n<>6 then raise exception 'event type mismatch: %', n; end if;

 insert into archive.review_item(entity_id,reason,detail)
 select e.id, v.r, v.d from (values
  ('ORG-0022','تصنيف موسم الرياض','اتصنف Season لأنه مربوط بعمل واحد بس (W-0060) ومفيش أحداث مرتبطة. راجع: موسم ولا حدث ولا جهة منظمة.'),
  ('ORG-0034','مهرجان من غير دورات مرتبطة','مفيش حدث مربوط بالمهرجان ده. حفلات ساقية الصاوي (E-0008, E-0068) ماتربطتش لأنه مش مؤكد إنها المونودراما.'),
  ('ORG-0027','تأكيد: نفس المهرجان','الحدثين E-0017 و E-0071 اتربطوا بالمهرجان ده. E-0017 اسمه «مهرجان القاهرة للدراما المصرية». تأكد إنه نفس المهرجان.'),
  ('ORG-0003','تأكيد نوع الفرقة','النوع القديم Children Choir Project. اتصنفت Choir. تأكد إنها فرقة مش مشروع.'),
  ('ORG-0009','تأكيد نوع الفرقة','النوع القديم National Choir Project. اتصنفت Choir. تأكد إنها فرقة مش مشروع.')
 ) v(c,r,d) join archive.entity e on e.public_code=v.c;
end $mig$;
