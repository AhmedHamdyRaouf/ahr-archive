-- Phase 1 / Migration 003: dictionary rows for the 2 new tables (additive: 19 rows in data_dictionary, nothing else).
-- Hardened vs the first draft: one DO block (atomic); refuses to run twice; row_ids assigned in a deterministic order
-- (ord) after the current max; verifies exactly 19 rows were inserted.
-- DECISION (Ahmed, 2026-11-11): data_dictionary has NO trg_log_* trigger and none is added; its changes are intentionally NOT logged in change_log.
do $migration$
declare n int;
begin
  if exists (select 1 from public.data_dictionary where sheet in ('Work_Relationship','Ref_Relationship_Type')) then
    raise exception 'phase1_003: Phase-1 dictionary rows already exist; refusing to insert twice';
  end if;
  insert into public.data_dictionary(row_id,sheet,"column",position,description_ar,key)
  select (select coalesce(max(row_id),0) from public.data_dictionary) + row_number() over (order by v.ord), v.sheet, v."column", v.position, v.description_ar, v.key
  from (values
   (1 ,'Work_Relationship','relationship_id','1','معرّف العلاقة (WR-0001) — المفتاح الأساسي','PK'),
   (2 ,'Work_Relationship','source_work_id','2','العمل المصدر (FK → Works)','FK'),
   (3 ,'Work_Relationship','target_work_id','3','العمل الهدف (FK → Works)','FK'),
   (4 ,'Work_Relationship','relationship_type','4','نوع العلاقة (FK → ref_relationship_type)','FK'),
   (5 ,'Work_Relationship','qualifier','5','توصيف إضافي للعلاقة',''),
   (6 ,'Work_Relationship','qualifier_en','6','Qualifier (EN)',''),
   (7 ,'Work_Relationship','notes','7','ملاحظات',''),
   (8 ,'Work_Relationship','notes_en','8','Notes (EN)',''),
   (9 ,'Work_Relationship','evidence_status','9','حالة الدليل',''),
   (10,'Work_Relationship','confidence','10','درجة الثقة',''),
   (11,'Work_Relationship','privacy','11','الخصوصية (افتراضي: داخلي)',''),
   (12,'Work_Relationship','publish','12','النشر (افتراضي: لا)',''),
   (13,'Work_Relationship','sort_order','13','ترتيب العرض',''),
   (14,'Ref_Relationship_Type','code','1','كود نوع العلاقة','PK'),
   (15,'Ref_Relationship_Type','label_ar','2','الاسم بالعربية',''),
   (16,'Ref_Relationship_Type','label_en','3','الاسم بالإنجليزية',''),
   (17,'Ref_Relationship_Type','direction_note','4','اتجاه العلاقة',''),
   (18,'Ref_Relationship_Type','sort_order','5','الترتيب',''),
   (19,'Ref_Relationship_Type','active','6','فعّال','')
  ) as v(ord,sheet,"column",position,description_ar,key);
  get diagnostics n = row_count;
  if n <> 19 then raise exception 'phase1_003: expected 19 rows inserted, got %', n; end if;
end $migration$;
