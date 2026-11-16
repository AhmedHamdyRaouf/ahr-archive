-- ============================================================================================
-- tests_003.PREP.sql — tests for migration 003 (19 rows in public.data_dictionary). Run AFTER 003.up. One statement per call.
--  PART A1 read-only, self-contained (also runs on a scratch PG): exact content of the 19 rows, contiguous row_ids after the old max,
--          order, uniqueness, dictionary == real columns of the 2 tables, data_dictionary has no trigger (documented decision).
--  PART A2 read-only, needs backup_phase1 (Supabase): old 346 rows identical to backup; the other 19 tables identical to the manifest;
--          change_log untouched; structure unchanged vs post-002; no new objects.
--  PART B  one DO block, ALWAYS rolled back (ends with RAISE EXCEPTION): guard (UP refuses to run twice), DOWN removes exactly the 19 rows and the
--          rest is byte-identical, UP after DOWN reproduces byte-identical rows, change_log untouched throughout.
--          Success only if the message starts with PHASE1_003_PART_B_PASS (fails=0 / total=N).
-- ============================================================================================

-- ---------------------------------- PART A1 ----------------------------------
with
exp(ord,sheet,col,pos,descr,k) as (values
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
),
newrows as (select * from public.data_dictionary where sheet in ('Work_Relationship','Ref_Relationship_Type')),
oldmax as (select coalesce(max(row_id),0) m from public.data_dictionary where sheet not in ('Work_Relationship','Ref_Relationship_Type')),
mism as (
  select count(*) n from exp e full join newrows r on r.sheet=e.sheet and r."column"=e.col
  where e.ord is null or r.row_id is null or r.position is distinct from e.pos or r.description_ar is distinct from e.descr or r.key is distinct from e.k),
required(test_id) as (values
  ('A1.01 exactly 19 Phase-1 rows'),('A1.02 content identical to specification (sheet/column/position/description/key)'),
  ('A1.03 row_ids contiguous right after the old max'),('A1.04 row_id order = specification order'),
  ('A1.05 no duplicate (sheet,column)'),('A1.06 Work_Relationship rows = real columns of work_relationship'),
  ('A1.07 Ref_Relationship_Type rows = real columns of ref_relationship_type'),('A1.08 positions = real column order (both tables)'),
  ('A1.09 no empty descriptions'),('A1.10 data_dictionary has no triggers (intentional, documented)'),('A1.11 data_dictionary constraints = primary key only')),
results(test_id, expected, actual) as (
  select 'A1.01 exactly 19 Phase-1 rows','19',(select count(*)::text from newrows)
  union all select 'A1.02 content identical to specification (sheet/column/position/description/key)','0',(select n::text from mism)
  union all select 'A1.03 row_ids contiguous right after the old max',
     (select (m+1)||'-'||(m+19) from oldmax), (select min(row_id)||'-'||max(row_id) from newrows)
  union all select 'A1.04 row_id order = specification order','0',
     (select count(*)::text from exp e join newrows r on r.sheet=e.sheet and r."column"=e.col where r.row_id <> (select m from oldmax)+e.ord)
  union all select 'A1.05 no duplicate (sheet,column)','0',(select count(*)::text from (select sheet,"column" from newrows group by 1,2 having count(*)>1) d)
  union all select 'A1.06 Work_Relationship rows = real columns of work_relationship',
     (select string_agg(column_name,',' order by column_name) from information_schema.columns where table_schema='public' and table_name='work_relationship'),
     (select string_agg("column",',' order by "column") from newrows where sheet='Work_Relationship')
  union all select 'A1.07 Ref_Relationship_Type rows = real columns of ref_relationship_type',
     (select string_agg(column_name,',' order by column_name) from information_schema.columns where table_schema='public' and table_name='ref_relationship_type'),
     (select string_agg("column",',' order by "column") from newrows where sheet='Ref_Relationship_Type')
  union all select 'A1.08 positions = real column order (both tables)','0',
     (select count(*)::text from newrows r join information_schema.columns c on c.table_schema='public'
        and c.table_name = case r.sheet when 'Work_Relationship' then 'work_relationship' else 'ref_relationship_type' end and c.column_name=r."column"
      where c.ordinal_position::text <> r.position)
  union all select 'A1.09 no empty descriptions','0',(select count(*)::text from newrows where coalesce(btrim(description_ar),'')='')
  union all select 'A1.10 data_dictionary has no triggers (intentional, documented)','0',(select count(*)::text from pg_trigger where tgrelid='public.data_dictionary'::regclass and not tgisinternal)
  union all select 'A1.11 data_dictionary constraints = primary key only','data_dictionary_pkey:p',(select string_agg(conname::text||':'||contype::text,',') from pg_constraint where conrelid='public.data_dictionary'::regclass)
),
checked as (select test_id, expected, actual, case when actual is not distinct from expected then 'PASS' else 'FAIL' end result from results),
completeness as (select 'ZZ completeness: every required test present exactly once' test_id,(select count(*) from required)::text expected,
   (select count(*)::text from required r where (select count(*) from checked c where c.test_id=r.test_id)=1) actual),
allrows as (select * from checked union all select test_id,expected,actual,case when actual=expected then 'PASS' else 'FAIL' end from completeness)
select test_id, result, case when result='FAIL' then expected||' <> '||actual end detail from allrows
union all select 'ZZ SUMMARY', case when (select count(*) from allrows)=12 and (select count(*) filter (where result='FAIL') from allrows)=0 then 'PASS' else 'FAIL' end,
  (select count(*) filter (where result='FAIL') from allrows)::text||' FAIL / '||(select count(*) from allrows)::text||' total'
order by 1;

-- ---------------------------------- PART A2 (needs backup_phase1; Supabase) ----------------------------------
with
lat as (select m.tbl, m.row_count, m.md5,
        query_to_xml(format('select count(*) n, md5(coalesce(string_agg(to_jsonb(t)::text, ''|'' order by to_jsonb(t)::text),'''')) h from public.%I t', m.tbl), false, true, '') x
        from backup_phase1._manifest m where m.tbl <> 'data_dictionary'),
fp   as (select kind, n, h from backup_phase1.fingerprint('public')),
base as (select kind, n, h from backup_phase1._struct_manifest),
delta(kind, d) as (values ('columns',19),('constraints',9),('indexes',6),('triggers',2),('policies',2),('rls_flags',2),('grants',48),('sequences',0),('views',0)),
results(test_id, expected, actual) as (
  select 'A2 data '||tbl, row_count||'/'||md5, (xpath('/row/n/text()',x))[1]::text||'/'||(xpath('/row/h/text()',x))[1]::text from lat
  union all select 'A2 data_dictionary: old rows identical to backup copy (md5 of rows not in the 2 new sheets)',
    (select md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) from backup_phase1.data_dictionary t),
    (select md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) from public.data_dictionary t where sheet not in ('Work_Relationship','Ref_Relationship_Type'))
  union all select 'A2 data_dictionary: old row count = backup', (select count(*)::text from backup_phase1.data_dictionary), (select count(*)::text from public.data_dictionary where sheet not in ('Work_Relationship','Ref_Relationship_Type'))
  union all select 'A2 data_dictionary: total rows = old + 19', ((select count(*) from backup_phase1.data_dictionary)+19)::text, (select count(*)::text from public.data_dictionary)
  union all select 'A2 manifest has 20 tables', '20', (select count(*)::text from backup_phase1._manifest)
  union all select 'A2 struct '||b.kind||' count (unchanged since 002)', (b.n+d.d)::text, f.n::text from base b join delta d using(kind) join fp f using(kind)
  union all select 'A2 struct views hash unchanged', b.n||'/'||b.h, f.n||'/'||f.h from base b join fp f using(kind) where kind='views'
  union all select 'A2 struct sequences hash unchanged', b.n||'/'||b.h, f.n||'/'||f.h from base b join fp f using(kind) where kind='sequences'
  union all select 'A2 function log_change unchanged', md5((select stmt from backup_phase1._ddl where kind='function' and obj='log_change')), md5(pg_get_functiondef('public.log_change'::regproc))
  union all select 'A2 change_log rows unchanged (1304) and none about data_dictionary/new tables', '1304/0',
    (select count(*)::text from public.change_log)||'/'||(select count(*)::text from public.change_log where tbl in ('data_dictionary','ref_relationship_type','work_relationship'))
  union all select 'A2 public base tables = 22', '22', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relkind='r')
  union all select 'A2 public views = 10', '10', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relkind='v')
  union all select 'A2 Phase-1 tables unchanged (6 seed rows, 0 relationships)', '6/0', (select count(*)::text from public.ref_relationship_type)||'/'||(select count(*)::text from public.work_relationship)
  union all select 'A2 every policy in public is TO authenticated only (non-conforming = 0)', '0', (select count(*)::text from pg_policy p join pg_class c on c.oid=p.polrelid where c.relnamespace='public'::regnamespace and (select string_agg(r.rolname,',') from pg_roles r where r.oid = any(p.polroles)) is distinct from 'authenticated')
  union all select 'A2 backup _verification 31/31 ok', '31/31', (select count(*) filter (where ok)::text||'/'||count(*)::text from backup_phase1._verification)
),
checked as (select test_id, expected, actual, case when actual is not distinct from expected then 'PASS' else 'FAIL' end result from results)
select test_id, result, case when result='FAIL' then expected||' <> '||actual end detail from checked
union all select 'ZZ SUMMARY', case when (select count(*) from checked)=19+3+1+9+2+7 and (select count(*) filter (where result='FAIL') from checked)=0 then 'PASS' else 'FAIL' end,
  (select count(*) filter (where result='FAIL') from checked)::text||' FAIL / '||(select count(*) from checked)::text||' total'
order by 1;

-- ---------------------------------- PART B (always rolled back) ----------------------------------
do $$
declare
  rep_fail text := ''; rep_pass text := ''; fails int := 0; total int := 0;
  old_md5 text; all_md5 text; n_all bigint; log0 bigint; a text; b text; c bigint;
  up_sql constant text := $up$
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

  $up$;
  down_sql constant text := $down$delete from public.data_dictionary where sheet in ('Work_Relationship','Ref_Relationship_Type')$down$;
  ph constant text := $ph$select md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) from public.data_dictionary t$ph$;
begin
  select count(*) into c from public.data_dictionary where sheet in ('Work_Relationship','Ref_Relationship_Type');
  if c <> 19 then raise exception 'PHASE1_003_PART_B_ERROR: expected 19 Phase-1 rows before the test, found %', c; end if;
  select count(*) into log0 from public.change_log;
  execute ph into all_md5;
  select md5(coalesce(string_agg(to_jsonb(t)::text,'|' order by to_jsonb(t)::text),'')) into old_md5 from public.data_dictionary t where sheet not in ('Work_Relationship','Ref_Relationship_Type');
  select count(*) into n_all from public.data_dictionary;

  -- B1 guard: UP refuses to run twice, nothing changes
  total := total + 1; a := 'no error';
  begin execute up_sql; exception when others then a := sqlerrm; end;
  if a like 'phase1_003: Phase-1 dictionary rows already exist%' then rep_pass := rep_pass || E'PASS B1 UP refuses to run twice\n';
  else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B1 guard | actual: %s\n', a); end if;
  total := total + 1; execute ph into b;
  if b = all_md5 then rep_pass := rep_pass || E'PASS B1b table byte-identical after refused UP\n'; else fails := fails + 1; rep_fail := rep_fail || E'FAIL B1b table changed after refused UP\n'; end if;

  -- B2 DOWN removes exactly the 19 rows; the rest is byte-identical to the old rows
  execute down_sql;
  total := total + 1; select count(*) into c from public.data_dictionary;
  if c = n_all - 19 then rep_pass := rep_pass || format(E'PASS B2 DOWN removed exactly 19 rows (%s -> %s)\n', n_all, c); else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B2 DOWN row count expected %s actual %s\n', n_all-19, c); end if;
  total := total + 1; execute ph into b;
  if b = old_md5 then rep_pass := rep_pass || E'PASS B2b remaining rows byte-identical to the old rows\n'; else fails := fails + 1; rep_fail := rep_fail || E'FAIL B2b remaining rows differ from the old rows\n'; end if;

  -- B3 UP after DOWN reproduces the identical table
  execute up_sql;
  total := total + 1; execute ph into b;
  if b = all_md5 then rep_pass := rep_pass || E'PASS B3 UP after DOWN reproduces a byte-identical table (same row_ids and content)\n'; else fails := fails + 1; rep_fail := rep_fail || E'FAIL B3 UP after DOWN differs from the original\n'; end if;

  -- B4 no change_log entries from any of it (intentional: no trigger on data_dictionary)
  total := total + 1; select count(*) into c from public.change_log;
  if c = log0 then rep_pass := rep_pass || E'PASS B4 change_log untouched (no trigger on data_dictionary, by decision)\n'; else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B4 change_log delta %s\n', c-log0); end if;

  raise exception 'PHASE1_003_PART_B_% (fails=% / total=%)%', case when fails=0 then 'PASS' else 'FAIL' end, fails, total, E'\n'||rep_fail||rep_pass;
exception when others then
  if sqlerrm like 'PHASE1_003_PART_B_PASS%' or sqlerrm like 'PHASE1_003_PART_B_FAIL%' or sqlerrm like 'PHASE1_003_PART_B_ERROR%' then raise; end if;
  raise exception 'PHASE1_003_PART_B_ERROR: % (sqlstate %)', sqlerrm, sqlstate;
end $$;
