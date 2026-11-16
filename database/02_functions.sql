-- AHR Master Archive — functions (schema archive), exported 2026-11-16
CREATE OR REPLACE FUNCTION archive.api_create(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare t text := p->>'type'; v_id uuid; code text; pre text; k text; v text; tbl text := archive.ext_table(p->>'type'); req text;
begin
 perform archive.set_editor(p->>'editor');
 if tbl is null then raise exception 'نوع غير معروف'; end if;
 pre := case t when 'work' then 'W-' when 'person' then 'P-' when 'contribution' then 'C-' when 'relationship' then 'WR-' when 'event' then 'E-' when 'award' then 'A-'
   when 'press_mention' then 'PR-' when 'media_asset' then 'MA-' when 'source' then 'SRC-' when 'video' then 'YV-' when 'project_item' then 'PI-'
   when 'life_story' then 'LS-' when 'site_text' then 'TX-' when 'organization' then 'ORG-' when 'digital_profile' then 'DP-' when 'contact_info' then 'CI-'
   when 'fact' then case p->>'fact_kind' when 'audience_voice' then 'AV-' when 'contact' then 'CT-' when 'press_link' then 'PL-' when 'role_education' then 'RE-' when 'training_choir' then 'TC-' else 'F-' end end;
 code := archive.next_code(pre);
 insert into archive.entity(public_code,entity_type,verification,privacy,confirmation_scope)
 values(code,t,coalesce(nullif(p->>'verification',''),'Pending Review'),coalesce(nullif(p->>'privacy',''),'Internal'),
        'Entered in dashboard by '||current_setting('app.editor',true)||' '||to_char(now(),'YYYY-MM-DD')) returning id into v_id;
 req := case t when 'work' then 'title_ar' when 'person' then 'name_ar' when 'organization' then 'name_ar' end;
 if req is not null and nullif(btrim(p->'fields'->>req),'') is null then raise exception 'الاسم أو العنوان مطلوب'; end if;
 if t='work' then insert into archive.work(entity_id,title_ar) values(v_id,btrim(p->'fields'->>'title_ar'));
 elsif t='person' then insert into archive.person(entity_id,name_ar) values(v_id,btrim(p->'fields'->>'name_ar'));
 elsif t='organization' then insert into archive.organization(entity_id,name_ar) values(v_id,btrim(p->'fields'->>'name_ar'));
 elsif t='contribution' then insert into archive.contribution(entity_id,work_id,person_id,role) values(v_id,(p->'ext'->>'work_id')::uuid,nullif(p->'ext'->>'person_id','')::uuid,p->'ext'->>'role');
 elsif t='relationship' then insert into archive.relationship(entity_id,source_work,target_work,relationship_type) values(v_id,(p->'ext'->>'source_work')::uuid,(p->'ext'->>'target_work')::uuid,coalesce(p->'ext'->>'relationship_type','related'));
 elsif t='fact' then insert into archive.fact(entity_id,fact_kind) values(v_id,coalesce(p->>'fact_kind','note'));
 elsif t='digital_profile' then insert into archive.digital_profile(entity_id,section) values(v_id,coalesce(nullif(p->'ext'->>'section',''),'social'));
 elsif t='contact_info' then insert into archive.contact_info(entity_id,kind) values(v_id,coalesce(nullif(p->'ext'->>'kind',''),'phone'));
 else execute format('insert into archive.%I(entity_id) values($1)',tbl) using v_id; end if;
 for k,v in select key,value from jsonb_each_text(coalesce(p->'fields','{}')) loop perform archive.apply_field(v_id,t,k,'ar',v,null); end loop;
 for k,v in select key,value from jsonb_each_text(coalesce(p->'fields_en','{}')) loop perform archive.apply_field(v_id,t,k,'en',v,null); end loop;
 perform archive.apply_ext(v_id,t,(coalesce(p->'ext','{}')) - 'source_work' - 'target_work' - 'work_id' - 'person_id' - 'role' - 'title_ar' - 'name_ar');
 if t not in ('contribution') then perform archive.apply_ext(v_id,t,jsonb_strip_nulls(jsonb_build_object('work_id',p->'ext'->'work_id','person_id',p->'ext'->'person_id'))); end if;
 insert into archive.source_snapshot(entity_id,src_table,src_pk,row_data) values(v_id,'dashboard',code,p - 'editor');
 return jsonb_build_object('ok',true,'id',v_id,'code',code);
end $function$;

CREATE OR REPLACE FUNCTION archive.api_credit(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare r jsonb; pid uuid := nullif(p->>'person_id','')::uuid; wid uuid := nullif(p->>'work_id','')::uuid; wp text;
begin
 perform archive.set_editor(p->>'editor');
 if p->>'op'='add' then
   if not exists(select 1 from archive.work where entity_id=wid) then raise exception 'العمل غير موجود'; end if;
   if pid is null then
     if nullif(btrim(p->>'new_person_name'),'') is null then raise exception 'اختار شخص أو اكتب اسم جديد'; end if;
     r := archive.api_create(jsonb_build_object('type','person','editor',p->>'editor','fields',jsonb_build_object('name_ar',p->>'new_person_name'),'privacy','Public','verification',coalesce(p->>'verification','Pending Review')));
     pid := (r->>'id')::uuid;
   elsif not exists(select 1 from archive.person where entity_id=pid) then raise exception 'الشخص غير موجود'; end if;
   select privacy into wp from archive.entity where id=wid;
   r := archive.api_create(jsonb_build_object('type','contribution','editor',p->>'editor','privacy',wp,'verification',coalesce(p->>'verification','Pending Review'),
        'ext',jsonb_build_object('work_id',wid,'person_id',pid,'role',p->>'role'),'fields',jsonb_build_object('role',p->>'role')));
   update archive.contribution set person_as_stated=(select name_ar from archive.person where entity_id=pid) where entity_id=(r->>'id')::uuid;
   return r;
 elsif p->>'op'='update' then
   update archive.contribution set role=nullif(btrim(p->>'role'),'') where entity_id=(p->>'id')::uuid;
   perform archive.apply_field((p->>'id')::uuid,'contribution','role','ar',p->>'role',null);
   return jsonb_build_object('ok',true);
 elsif p->>'op'='remove' then
   update archive.entity set lifecycle='Archived', publication='Unpublished' where id=(p->>'id')::uuid and entity_type='contribution';
   return jsonb_build_object('ok',true);
 end if;
 raise exception 'عملية غير معروفة';
end $function$;

CREATE OR REPLACE FUNCTION archive.api_date(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare e uuid := (p->>'entity_id')::uuid; f text := coalesce(nullif(p->>'field',''),'date'); pr text := p->>'precision';
begin
 perform archive.set_editor(p->>'editor');
 if f !~ '^[a-z][a-z0-9_]{0,39}$' then raise exception 'حقل غير صالح'; end if;
 if p->>'op'='remove' then delete from archive.date_value where entity_id=e and field=f; return jsonb_build_object('ok',true); end if;
 insert into archive.date_value(entity_id,field,original_text,precision,start_year,start_date,end_year,qualifier)
 values(e,f,coalesce(nullif(btrim(p->>'original_text'),''),'(أُدخل من لوحة التحكم)'),pr,nullif(p->>'start_year','')::int,nullif(p->>'start_date','')::date,nullif(p->>'end_year','')::int,nullif(btrim(p->>'qualifier'),''))
 on conflict(entity_id,field) do update set precision=excluded.precision,start_year=excluded.start_year,start_date=excluded.start_date,end_year=excluded.end_year,qualifier=excluded.qualifier,
   original_text=case when p ? 'original_text' and nullif(btrim(p->>'original_text'),'') is not null then excluded.original_text else archive.date_value.original_text end;
 if pr<>'text' then update archive.review_item set status='Resolved' where entity_id=e and reason='Date needs manual structuring' and status='Open'; end if;
 return jsonb_build_object('ok',true);
end $function$;

CREATE OR REPLACE FUNCTION archive.api_link(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare u text := btrim(coalesce(p->>'url','')); k text := lower(btrim(coalesce(p->>'kind','other'))); n uuid;
begin
 perform archive.set_editor(p->>'editor');
 if p->>'op' in ('add','update') then
   if u !~ '^(https?://|/_blob/|/api/file\?p=)' then raise exception 'الرابط لازم يبدأ بـ https://'; end if;
   if k !~ '^[a-z0-9_]{1,30}$' then raise exception 'نوع رابط غير صالح'; end if;
 end if;
 if p->>'op'='add' then insert into archive.link(entity_id,kind,url) values((p->>'entity_id')::uuid,k,u) returning id into n; return jsonb_build_object('ok',true,'id',n);
 elsif p->>'op'='update' then update archive.link set kind=k,url=u where id=(p->>'id')::uuid; return jsonb_build_object('ok',true);
 elsif p->>'op'='remove' then delete from archive.link where id=(p->>'id')::uuid; return jsonb_build_object('ok',true); end if;
 raise exception 'عملية غير معروفة';
end $function$;

CREATE OR REPLACE FUNCTION archive.api_merge(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare k uuid := (p->>'keep')::uuid; r uuid := (p->>'remove')::uuid; c record;
begin
 perform archive.set_editor(p->>'editor');
 if k=r or (select entity_type from archive.entity where id=k) is distinct from (select entity_type from archive.entity where id=r) then raise exception 'لازم سجلين مختلفين من نفس النوع'; end if;
 for c in select table_name t, column_name col from information_schema.columns where table_schema='archive' and data_type='uuid'
   and column_name in ('work_id','work_id_2','person_id','parent_entity_id','source_work','target_work','from_entity','to_entity') loop
   execute format('update archive.%I set %I=$1 where %I=$2',c.t,c.col,c.col) using k,r;
 end loop;
 insert into archive.link(entity_id,kind,url) select k,kind,url from archive.link where entity_id=r on conflict do nothing;
 insert into archive.translation(entity_id,field,lang,body,status,author) select k,field,lang,body,status,author from archive.translation where entity_id=r on conflict do nothing;
 update archive.entity set lifecycle='Archived', publication='Unpublished' where id=r;
 insert into archive.entity_relation(from_entity,to_entity,kind,note) values(r,k,'merged_into','Merged in dashboard') on conflict do nothing;
 return jsonb_build_object('ok',true);
end $function$;

CREATE OR REPLACE FUNCTION archive.api_review(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 perform archive.set_editor(p->>'editor');
 if p->>'op'='add' then insert into archive.review_item(entity_id,reason,detail) values(nullif(p->>'entity_id','')::uuid,coalesce(nullif(btrim(p->>'reason'),''),'ملاحظة'),nullif(btrim(p->>'detail'),'')) on conflict do nothing; return jsonb_build_object('ok',true); end if;
 update archive.review_item set status=coalesce(nullif(p->>'status',''),'Resolved'),
   detail=case when nullif(btrim(p->>'note'),'') is not null then coalesce(detail||' — ','')||'قرار: '||btrim(p->>'note') else detail end
 where id=(p->>'id')::uuid;
 return jsonb_build_object('ok',true);
end $function$;

CREATE OR REPLACE FUNCTION archive.api_save(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare v_id uuid := (p->>'id')::uuid; v_type text; x jsonb;
begin
 perform archive.set_editor(p->>'editor');
 select entity_type into v_type from archive.entity where id=v_id; if v_type is null then raise exception 'السجل غير موجود'; end if;
 for x in select * from jsonb_array_elements(coalesce(p->'fields','[]')) loop
   perform archive.apply_field(v_id,v_type,x->>'f',x->>'l',x->>'v',x->>'s');
 end loop;
 perform archive.apply_ext(v_id,v_type,p->'ext');
 if p ? 'entity' then
   update archive.entity set
     lifecycle=coalesce(p->'entity'->>'lifecycle',lifecycle),
     verification=coalesce(p->'entity'->>'verification',verification),
     privacy=coalesce(p->'entity'->>'privacy',privacy),
     confirmation_scope=case when p->'entity' ? 'confirmation_scope' then nullif(btrim(p->'entity'->>'confirmation_scope'),'') else confirmation_scope end,
     featured=coalesce((p->'entity'->>'featured')::boolean,featured),
     sort_order=case when p->'entity' ? 'sort_order' then nullif(p->'entity'->>'sort_order','')::int else sort_order end
   where id=v_id;
   update archive.entity set publication='Unpublished' where id=v_id and publication='Published' and (lifecycle<>'Approved' or privacy<>'Public');
 end if;
 return jsonb_build_object('ok',true,'id',v_id);
end $function$;

CREATE OR REPLACE FUNCTION archive.api_status(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare f text := p->>'field'; v text := p->>'value'; n int;
begin
 perform archive.set_editor(p->>'editor');
 if f='lifecycle' and exists(select 1 from archive.ref_lifecycle where code=v) then
   update archive.entity set lifecycle=v where id = any(array(select jsonb_array_elements_text(p->'ids'))::uuid[]) and lifecycle<>v;
   get diagnostics n=row_count;
   update archive.entity set publication='Unpublished' where id = any(array(select jsonb_array_elements_text(p->'ids'))::uuid[]) and publication='Published' and lifecycle<>'Approved';
 elsif f='verification' and exists(select 1 from archive.ref_verification where code=v) then
   update archive.entity set verification=v where id = any(array(select jsonb_array_elements_text(p->'ids'))::uuid[]) and verification<>v; get diagnostics n=row_count;
 elsif f='privacy' and exists(select 1 from archive.ref_privacy where code=v) then
   update archive.entity set privacy=v where id = any(array(select jsonb_array_elements_text(p->'ids'))::uuid[]) and privacy<>v; get diagnostics n=row_count;
   update archive.entity set publication='Unpublished' where id = any(array(select jsonb_array_elements_text(p->'ids'))::uuid[]) and publication='Published' and privacy<>'Public';
 elsif f='publication' and v in ('Published','Unpublished') then
   update archive.entity set publication=v where id = any(array(select jsonb_array_elements_text(p->'ids'))::uuid[]) and publication<>v
     and (v='Unpublished' or (lifecycle='Approved' and privacy='Public')); get diagnostics n=row_count;
 else raise exception 'قيمة غير صالحة'; end if;
 return jsonb_build_object('ok',true,'changed',n);
end $function$;

CREATE OR REPLACE FUNCTION archive.apply_ext(p_id uuid, p_type text, p_ext jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare k text; v text; dt text; tbl text := archive.ext_table(p_type);
begin
 if tbl is null or p_ext is null then return; end if;
 for k,v in select key, value #>> '{}' from jsonb_each(p_ext) loop
  select data_type into dt from information_schema.columns where table_schema='archive' and table_name=tbl and column_name=k;
  if dt is null or k='entity_id' then raise exception 'حقل غير معروف: %', k; end if;
  v := nullif(btrim(v),'');
  if dt='uuid' then
    if v is not null and not exists(select 1 from archive.entity where id=v::uuid) then raise exception 'السجل المرتبط غير موجود'; end if;
    if v is not null and v::uuid=p_id then raise exception 'لا يمكن ربط السجل بنفسه'; end if;
    execute format('update archive.%I set %I=$1::uuid where entity_id=$2',tbl,k) using v,p_id;
  elsif dt='date' then
    execute format('update archive.%I set %I=$1::date where entity_id=$2',tbl,k) using v,p_id;
  else
    if k='category' and v is not null and not exists(select 1 from archive.ref_work_category where code=v) then raise exception 'تصنيف غير معروف'; end if;
    if k in ('title_ar','name_ar','fact_kind','relationship_type') and v is null then raise exception 'الحقل % مطلوب', k; end if;
    execute format('update archive.%I set %I=$1 where entity_id=$2',tbl,k) using v,p_id;
  end if;
 end loop;
end $function$;

CREATE OR REPLACE FUNCTION archive.apply_field(p_id uuid, p_type text, f text, l text, v text, s text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare tbl text := archive.ext_table(p_type); col text;
begin
 if f !~ '^[a-z][a-z0-9_]{0,39}$' or l not in ('ar','en') then raise exception 'حقل غير صالح'; end if;
 v := nullif(btrim(v),'');
 if v is null then delete from archive.translation where entity_id=p_id and field=f and lang=l;
 else insert into archive.translation(entity_id,field,lang,body,status,author,updated_at,updated_by)
      values(p_id,f,l,v,coalesce(nullif(s,''),case when l='ar' then 'Entered' else 'Draft' end),current_setting('app.editor',true),now(),current_setting('app.editor',true))
      on conflict(entity_id,field,lang) do update set body=excluded.body,status=coalesce(nullif(s,''),archive.translation.status),updated_at=now(),updated_by=excluded.updated_by;
 end if;
 col := case when l='ar' then f when f='title_ar' then 'title_en' when f='name_ar' then 'name_en' end;
 if col in ('category','category_original','fact_kind','entity_id') then col := null; end if;
 if col is not null and exists(select 1 from information_schema.columns where table_schema='archive' and table_name=tbl and column_name=col and data_type='text') then
   if col in ('title_ar','name_ar') and v is null then raise exception 'الحقل مطلوب'; end if;
   execute format('update archive.%I set %I=$1 where entity_id=$2',tbl,col) using v,p_id;
 end if;
end $function$;

CREATE OR REPLACE FUNCTION archive.career_start_year()
 RETURNS integer
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 select min(d.start_year) from archive.date_value d join archive.work w on w.entity_id=d.entity_id join archive.entity e on e.id=w.entity_id
 where e.lifecycle='Approved' and d.precision<>'text' $function$;

CREATE OR REPLACE FUNCTION archive.eid(code text)
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$ select id from archive.entity where public_code=nullif(btrim(code),'') $function$;

CREATE OR REPLACE FUNCTION archive.ext_table(t text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case t when 'work' then 'work' when 'person' then 'person' when 'contribution' then 'contribution' when 'relationship' then 'relationship'
  when 'event' then 'event' when 'award' then 'award' when 'press_mention' then 'press_mention' when 'media_asset' then 'media_asset'
  when 'source' then 'source' when 'video' then 'video' when 'project_item' then 'project_item' when 'life_story' then 'life_story'
  when 'site_text' then 'site_text' when 'fact' then 'fact' when 'organization' then 'organization'
  when 'digital_profile' then 'digital_profile' when 'contact_info' then 'contact_info' end $function$;

CREATE OR REPLACE FUNCTION archive.is_staff(write_access boolean)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from archive.staff where email = lower(auth.jwt()->>'email') and active and (not write_access or role <> 'viewer'))
$function$;

CREATE OR REPLACE FUNCTION archive.log_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare r jsonb := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
 insert into archive.change_log(by_user,tbl,row_id,action,before,after)
 values(coalesce(nullif(current_setting('app.editor',true),''),'النظام'), tg_table_name,
        coalesce((r->>'entity_id')::uuid,(r->>'id')::uuid), tg_op,
        case when tg_op<>'INSERT' then to_jsonb(old) end, case when tg_op<>'DELETE' then to_jsonb(new) end);
 return case when tg_op='DELETE' then old else new end;
end $function$;

CREATE OR REPLACE FUNCTION archive.map_category(c text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case c when 'أغنية' then 'Songs' when 'مسلسل تلفزيوني' then 'TV Drama Music' when 'فيلم سينمائي' then 'Film & Documentary Music' when 'فيلم وثائقي' then 'Film & Documentary Music'
  when 'عمل مسرحي' then 'Theatre Music' when 'إعلان (أغنية أو موسيقى)' then 'Advertising Music' when 'موسيقى برنامج' then 'Program Music' when 'مشروع فيديو' then 'Live & Recorded Works' else null end $function$;

CREATE OR REPLACE FUNCTION archive.map_privacy(p text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case when coalesce(btrim(p),'')='' then 'Internal' when p ~ '^أقصى' then 'Restricted' when p ~ '^داخلي' then 'Internal' when p ~ '^عام' then 'Public' else 'Internal' end $function$;

CREATE OR REPLACE FUNCTION archive.map_privacy_back(p text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case p when 'Public' then 'عام' when 'Internal' then 'داخلي' when 'Restricted' then 'أقصى خصوصية' when 'Private' then 'خاص' end $function$;

CREATE OR REPLACE FUNCTION archive.map_verification(ev text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case
  when coalesce(btrim(ev),'')='' then 'Pending Review'
  when ev ~ 'DOCUMENTED' and ev ~ 'USER-CONFIRMED|USER-STATED|معتمد من أحمد' then 'Confirmed by Ahmed + Evidence'
  when ev ~ 'DOCUMENTED' then 'Verified – External Evidence'
  when ev ~ 'USER-CONFIRMED|USER-STATED|معتمد من أحمد' then 'Confirmed by Ahmed'
  when ev ~ 'SOURCE-STATED' then 'Unverified'
  else 'Pending Review' end $function$;

CREATE OR REPLACE FUNCTION archive.map_verification_back(v text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select case v when 'Verified – External Evidence' then 'DOCUMENTED' when 'Confirmed by Ahmed + Evidence' then 'DOCUMENTED + USER-CONFIRMED'
  when 'Confirmed by Ahmed' then 'USER-CONFIRMED' when 'Unverified' then 'SOURCE-STATED' when 'Conflicting' then 'CONFLICTING' when 'Rejected / Incorrect' then 'REJECTED' else '' end $function$;

CREATE OR REPLACE FUNCTION archive.next_code(prefix text)
 RETURNS text
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 select prefix||lpad((coalesce(max(nullif(regexp_replace(substr(public_code,length(prefix)+1),'[^0-9]','','g'),'')::int),0)+1)::text,4,'0')
 from archive.entity where public_code like prefix||'%' and substr(public_code,length(prefix)+1) ~ '^[0-9]+$' $function$;

CREATE OR REPLACE FUNCTION archive.nz(t text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$ select nullif(btrim(t),'') $function$;

CREATE OR REPLACE FUNCTION archive.ref_reject_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin raise exception 'archive records are never hard-deleted (archive via lifecycle)'; end $function$;

CREATE OR REPLACE FUNCTION archive.set_editor(e text)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$
 select set_config('app.editor', left(coalesce(nullif(btrim(e),''),'لوحة التحكم'),60), true) $function$;

CREATE OR REPLACE FUNCTION archive.touch()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin new.updated_at=now(); return new; end $function$;
