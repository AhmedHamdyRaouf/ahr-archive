-- ============================================================================================
-- tests_001.PREP.sql — FINAL DRAFT. NOT EXECUTED on Supabase (validated only on a local scratch PostgreSQL, see README_tests_001.md).
-- Tests for migration 001 (public.ref_relationship_type). Run AFTER 001.up. Each part is ONE statement; run each in its own call.
--
--  PART A  read-only SELECT. Returns one row per assertion: test_id | expected | actual | result (PASS/FAIL) + a last row ZZ SUMMARY.
--          Pass = every row PASS and ZZ SUMMARY = PASS (57 rows: 53 tests + 4 completeness checks; a missing/extra test makes it FAIL).   Writes nothing.
--  PART B  one DO block. Executes real INSERT/UPDATE/DELETE as anon / other user / owner and ALWAYS ends with RAISE EXCEPTION,
--          so everything it did is rolled back whether it passes, fails or crashes. The report is the error message:
--              PHASE1_001_PART_B_PASS ...   -> all assertions passed
--              PHASE1_001_PART_B_FAIL ...   -> at least one assertion failed (FAIL lines are listed first)
--              PHASE1_001_PART_B_ERROR ...  -> the test itself hit an unexpected error (treat as failure)
--          Permanent effects of Part B: NONE on tables or change_log rows. The only thing a rollback cannot undo is the sequence:
--          it consumes exactly 5 values of change_log_id_seq (inner-space insert+delete, owner insert+update+delete) = a gap in
--          change_log ids. Part B itself asserts "5 consumed".
--  PART C  (optional, only with Ahmed's approval) one DO block that runs the DOWN statement and ALWAYS rolls back; proves rollback works.
-- ============================================================================================

-- ---------------------------------- PART A (read-only) ----------------------------------
with
lat as (
  select m.tbl, m.row_count, m.md5,
         query_to_xml(format('select count(*) n, md5(coalesce(string_agg(to_jsonb(t)::text, ''|'' order by to_jsonb(t)::text),'''')) h from public.%I t', m.tbl), false, true, '') x
  from backup_phase1._manifest m
),
fp  as (select kind, n, h from backup_phase1.fingerprint('public')),
base as (select kind, n, h from backup_phase1._struct_manifest),
delta(kind, d) as (values ('columns',6),('constraints',3),('indexes',1),('triggers',1),('policies',1),('rls_flags',1),('grants',24),('sequences',0),('views',0)),
newgrants as (
  select count(*) n from pg_class c cross join lateral aclexplode(c.relacl) x left join pg_roles g on g.oid=x.grantee
  where c.oid='public.ref_relationship_type'::regclass and g.rolname in ('anon','authenticated','service_role')
),
worksgrants as (
  select count(*) n from pg_class c cross join lateral aclexplode(c.relacl) x left join pg_roles g on g.oid=x.grantee
  where c.oid='public.works'::regclass and g.rolname in ('anon','authenticated','service_role')
),
gm_new as (
  select g.rolname::text grantee, x.privilege_type::text priv, x.is_grantable grantable
  from pg_class c cross join lateral aclexplode(c.relacl) x join pg_roles g on g.oid=x.grantee
  where c.oid='public.ref_relationship_type'::regclass and g.rolname in ('anon','authenticated','service_role')
),
gm_works as (
  select g.rolname::text grantee, x.privilege_type::text priv, x.is_grantable grantable
  from pg_class c cross join lateral aclexplode(c.relacl) x join pg_roles g on g.oid=x.grantee
  where c.oid='public.works'::regclass and g.rolname in ('anon','authenticated','service_role')
),
live_c as (select conname::text nm, count(*) n from pg_constraint where connamespace='public'::regnamespace group by 1),
exp_c  as (select nm, sum(n) n from (select obj nm, count(*) n from backup_phase1._ddl where kind='constraint' group by 1
           union all select unnest(array['ref_relationship_type_pkey','chk_ref_relationship_type_label_ar','chk_ref_relationship_type_label_en']), 1) s group by 1),
live_t as (select t.tgname::text nm, count(*) n from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relnamespace='public'::regnamespace and not t.tgisinternal group by 1),
exp_t  as (select nm, sum(n) n from (select obj nm, count(*) n from backup_phase1._ddl where kind='trigger' group by 1
           union all select 'trg_log_ref_relationship_type', 1) s group by 1),
live_p as (select p.polname::text nm, count(*) n from pg_policy p join pg_class c on c.oid=p.polrelid where c.relnamespace='public'::regnamespace group by 1),
exp_p  as (select nm, sum(n) n from (select obj nm, count(*) n from backup_phase1._ddl where kind='policy' group by 1
           union all select 'owner_all', 1) s group by 1),
live_i as (select i.indexrelid::regclass::text nm, 1 n from pg_index i join pg_class c on c.oid=i.indrelid
           where c.relnamespace='public'::regnamespace and not exists(select 1 from pg_constraint k where k.conindid=i.indexrelid)),
exp_i  as (select obj nm, 1 n from backup_phase1._ddl where kind='index'),
required(test_id) as (values
  ('A01 data audience_voices'),
  ('A01 data awards'),
  ('A01 data change_log'),
  ('A01 data contact_channels'),
  ('A01 data credits'),
  ('A01 data data_dictionary'),
  ('A01 data events'),
  ('A01 data life_story'),
  ('A01 data media_assets'),
  ('A01 data person'),
  ('A01 data press'),
  ('A01 data press_links'),
  ('A01 data project_items'),
  ('A01 data review_queue'),
  ('A01 data roles_education'),
  ('A01 data site_texts'),
  ('A01 data sources'),
  ('A01 data training_choir'),
  ('A01 data works'),
  ('A01 data youtube_videos'),
  ('A01 manifest has 20 tables'),
  ('A02 struct columns count'),
  ('A02 struct constraints count'),
  ('A02 struct indexes count'),
  ('A02 struct triggers count'),
  ('A02 struct policies count'),
  ('A02 struct rls_flags count'),
  ('A02 struct grants count'),
  ('A02 struct sequences count'),
  ('A02 struct views count'),
  ('A02 struct views hash unchanged'),
  ('A02 struct sequences hash unchanged'),
  ('A02 new table grants = works grants'),
  ('A02 grants matrix new = works (grantee/privilege/is_grantable)'),
  ('A02 grants matrix mismatching entries (full join)'),
  ('A02 new table grants = 24 (3 roles x 8 privileges)'),
  ('A03 constraint names vs backup+001'),
  ('A03 trigger names vs backup+001'),
  ('A03 policy names vs backup+001'),
  ('A03 non-constraint index names vs backup'),
  ('A03 function log_change unchanged'),
  ('A03 public base tables = 20 old + 1 new'),
  ('A03 public views = 10'),
  ('A03 work_relationship (002) not created'),
  ('A04 columns'),
  ('A04 six codes (exact, ordered)'),
  ('A04 RLS enabled, not forced'),
  ('A04 owner_all identical to works.owner_all (cmd, permissive, using, with check, roles)'),
  ('A04 trigger definition'),
  ('A05 change_log rows unchanged'),
  ('A05 change_log rows about the new table'),
  ('A05 backup _verification 31/31 ok'),
  ('A05 backup _ddl rows')
),
results(test_id, expected, actual) as (
  -- A01: the 20 old tables: rows + md5 identical to the backup manifest
  select 'A01 data '||tbl, row_count||'/'||md5, (xpath('/row/n/text()',x))[1]::text||'/'||(xpath('/row/h/text()',x))[1]::text from lat
  union all select 'A01 manifest has 20 tables', '20', (select count(*)::text from backup_phase1._manifest)
  -- A02: structure counts = backup + exactly what 001 adds
  union all select 'A02 struct '||b.kind||' count', (b.n+d.d)::text, f.n::text from base b join delta d using(kind) join fp f using(kind)
  union all select 'A02 struct views hash unchanged', b.n||'/'||b.h, f.n||'/'||f.h from base b join fp f using(kind) where kind='views'
  union all select 'A02 struct sequences hash unchanged', b.n||'/'||b.h, f.n||'/'||f.h from base b join fp f using(kind) where kind='sequences'
  union all select 'A02 new table grants = works grants', (select n::text from worksgrants), (select n::text from newgrants)
  union all select 'A02 grants matrix new = works (grantee/privilege/is_grantable)',
     coalesce((select string_agg(grantee||'/'||priv||'/'||grantable, ', ' order by grantee, priv, grantable) from gm_works),'(none)'),
     coalesce((select string_agg(grantee||'/'||priv||'/'||grantable, ', ' order by grantee, priv, grantable) from gm_new),'(none)')
  union all select 'A02 grants matrix mismatching entries (full join)', '0',
     (select count(*)::text from gm_new n full join gm_works w using (grantee, priv) where n.grantable is distinct from w.grantable)
  union all select 'A02 new table grants = 24 (3 roles x 8 privileges)', '24', (select n::text from newgrants)
  -- A03: old objects unchanged, by name (bag compare; 0 mismatches expected)
  union all select 'A03 constraint names vs backup+001', '0', (select count(*)::text from live_c l full join exp_c e using(nm) where l.n is distinct from e.n)
  union all select 'A03 trigger names vs backup+001', '0', (select count(*)::text from live_t l full join exp_t e using(nm) where l.n is distinct from e.n)
  union all select 'A03 policy names vs backup+001', '0', (select count(*)::text from live_p l full join exp_p e using(nm) where l.n is distinct from e.n)
  union all select 'A03 non-constraint index names vs backup', '0', (select count(*)::text from live_i l full join exp_i e using(nm) where l.n is distinct from e.n)
  union all select 'A03 function log_change unchanged', md5((select stmt from backup_phase1._ddl where kind='function' and obj='log_change')), md5(pg_get_functiondef('public.log_change'::regproc))
  union all select 'A03 public base tables = 20 old + 1 new', '21', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relkind='r')
  union all select 'A03 public views = 10', '10', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relkind='v')
  union all select 'A03 work_relationship (002) not created', '0', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relname='work_relationship')
  -- A04: the new table itself
  union all select 'A04 columns', 'code:text:true:|label_ar:text:true:|label_en:text:true:|direction_note:text:false:|sort_order:integer:true:0|active:boolean:true:true',
     (select string_agg(format('%s:%s:%s:%s',a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull::text,coalesce(pg_get_expr(d.adbin,d.adrelid),'')),'|' order by a.attnum)
      from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid='public.ref_relationship_type'::regclass and a.attnum>0 and not a.attisdropped)
  union all select 'A04 six codes (exact, ordered)',
     'part_of=جزء من=Part of=source is part of target=1=true,soundtrack_for=موسيقى/أغنية تتر لـ=Soundtrack for=source is the soundtrack of target=2=true,theme_song_for=أغنية رئيسية لـ=Theme song for=source is the theme song of target=3=true,featured_in=ضمن=Featured in=source appears within target=4=true,version_of=نسخة من=Version of=source is a version of target=5=true,updates=تحديث لـ=Updates=source updates/replaces target=6=true',
     (select string_agg(format('%s=%s=%s=%s=%s=%s',code,label_ar,label_en,direction_note,sort_order,active::text),',' order by sort_order) from public.ref_relationship_type)
  union all select 'A04 RLS enabled, not forced', 'true/false', (select relrowsecurity||'/'||relforcerowsecurity from pg_class where oid='public.ref_relationship_type'::regclass)
  union all select 'A04 owner_all identical to works.owner_all (cmd, permissive, using, with check, roles)',
     (select polcmd::text||'|'||polpermissive||'|'||pg_get_expr(polqual,polrelid)||'|'||pg_get_expr(polwithcheck,polrelid)||'|'||coalesce((select string_agg(r.rolname,',' order by r.rolname) from pg_roles r where r.oid = any(polroles)),'public') from pg_policy where polrelid='public.works'::regclass and polname='owner_all'),
     (select polcmd::text||'|'||polpermissive||'|'||pg_get_expr(polqual,polrelid)||'|'||pg_get_expr(polwithcheck,polrelid)||'|'||coalesce((select string_agg(r.rolname,',' order by r.rolname) from pg_roles r where r.oid = any(polroles)),'public') from pg_policy where polrelid='public.ref_relationship_type'::regclass and polname='owner_all')
  union all select 'A04 trigger definition', 'AFTER INSERT OR DELETE OR UPDATE FOR EACH ROW EXECUTE FUNCTION log_change(''code'')',
     (select replace(regexp_replace(regexp_replace(pg_get_triggerdef(t.oid),'^CREATE TRIGGER \S+ ',''),'ON \S+ ',''),'public.','') from pg_trigger t where t.tgrelid='public.ref_relationship_type'::regclass and not t.tgisinternal)
  -- A05: nothing was logged / nothing else changed
  union all select 'A05 change_log rows unchanged', (select row_count::text from backup_phase1._manifest where tbl='change_log'), (select count(*)::text from public.change_log)
  union all select 'A05 change_log rows about the new table', '0', (select count(*)::text from public.change_log where tbl='ref_relationship_type')
  union all select 'A05 backup _verification 31/31 ok', '31/31', (select count(*) filter (where ok)||'/'||count(*) from backup_phase1._verification)
  union all select 'A05 backup _ddl rows', '794', (select count(*)::text from backup_phase1._ddl)
),
-- A06: completeness. Every required test must be present exactly once in `results`, with nothing extra; otherwise the summary cannot pass.
completeness(test_id, expected, actual) as (
  select 'A06 required tests missing from results', '0', (select count(*)::text from required r where r.test_id not in (select test_id from results))
  union all select 'A06 unexpected extra tests in results', '0', (select count(*)::text from results x where x.test_id not in (select test_id from required))
  union all select 'A06 duplicate test ids in results', '0', (select count(*)::text from (select test_id from results group by 1 having count(*)>1) d)
  union all select 'A06 results row count', '53', (select count(*)::text from results)
),
scored as (
  select test_id, expected, actual, expected is not distinct from actual ok from results
  union all select test_id, expected, actual, expected is not distinct from actual from completeness
)
select test_id, expected, actual, case when ok then 'PASS' else 'FAIL' end result from scored
union all
select 'ZZ SUMMARY', '0 FAIL / 57 total', count(*) filter (where not ok)||' FAIL / '||count(*)||' total',
       case when count(*) filter (where not ok)=0 and count(*)=57 then 'PASS' else 'FAIL' end from scored
order by 1;

-- ---------------------------------- PART B (always rolled back) ----------------------------------
do $$
declare
  rep_fail text := ''; rep_pass text := ''; fails int := 0; total int := 0;
  s record; v text; fld text;
  seed_md5 text; n_before bigint; n_after bigint; got_rows bigint; got_state text; seq0 bigint; seq1 bigint; log0 bigint; a text;
  owner_ok  constant text := '{"role":"authenticated","email":"ahrvision@gmail.com","email_verified":true}';
  owner_unv constant text := '{"role":"authenticated","email":"ahrvision@gmail.com","email_verified":false}';
  other_usr constant text := '{"role":"authenticated","email":"other@example.com","email_verified":true}';
  anon_clm  constant text := '{"role":"anon"}';
begin
  if to_regclass('public.ref_relationship_type') is null then raise exception 'PHASE1_001_PART_B_ERROR: table does not exist (001 not applied)'; end if;
  select count(*) into log0 from public.change_log;
  select md5(string_agg(t::text, '|' order by t.code)) into seed_md5 from public.ref_relationship_type t;
  select coalesce(last_value,0) into seq0 from pg_sequences where schemaname='public' and sequencename='change_log_id_seq';

  -- B1: state-changing / access tests. Each step: role, claims, statement (returns one count), expected sqlstate or 'ok', expected rows, expected change_log delta.
  for s in select * from (values
    (1 ,'anon'         ,anon_clm ,'select count(*) from public.ref_relationship_type'                                                                                   ,'ok'   ,0,0),
    (2 ,'anon'         ,anon_clm ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_anon'',''x'',''x'') returning 1) select count(*) from x','42501',0,0),
    (3 ,'anon'         ,anon_clm ,'with x as (update public.ref_relationship_type set label_en=''hacked'' returning 1) select count(*) from x'                          ,'ok'   ,0,0),
    (4 ,'anon'         ,anon_clm ,'with x as (delete from public.ref_relationship_type returning 1) select count(*) from x'                                           ,'ok'   ,0,0),
    (5 ,'authenticated',other_usr,'select count(*) from public.ref_relationship_type'                                                                                   ,'ok'   ,0,0),
    (6 ,'authenticated',other_usr,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_other'',''x'',''x'') returning 1) select count(*) from x','42501',0,0),
    (7 ,'authenticated',other_usr,'with x as (update public.ref_relationship_type set label_en=''hacked'' returning 1) select count(*) from x'                       ,'ok'   ,0,0),
    (8 ,'authenticated',other_usr,'with x as (delete from public.ref_relationship_type returning 1) select count(*) from x'                                        ,'ok'   ,0,0),
    (9 ,'authenticated',owner_unv,'select count(*) from public.ref_relationship_type'                                                                                   ,'ok'   ,0,0),
    (10,'authenticated',owner_unv,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_unv'',''x'',''x'') returning 1) select count(*) from x','42501',0,0),
    (11,'authenticated',owner_unv,'with x as (update public.ref_relationship_type set label_en=''hacked'' returning 1) select count(*) from x'                       ,'ok'   ,0,0),
    (12,'authenticated',owner_unv,'with x as (delete from public.ref_relationship_type returning 1) select count(*) from x'                                        ,'ok'   ,0,0),
    (13,'authenticated',owner_ok ,'select count(*) from public.ref_relationship_type'                                                                                   ,'ok'   ,6,0),
    (14,'authenticated',owner_ok ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_test'',''اختبار'',''test'') returning 1) select count(*) from x','ok',1,1),
    (15,'authenticated',owner_ok ,'with x as (update public.ref_relationship_type set label_en=''test2'' where code=''zz_test'' returning 1) select count(*) from x'      ,'ok'   ,1,1),
    (16,'authenticated',owner_ok ,'with x as (update public.ref_relationship_type set label_en=''test2'' where code=''zz_test'' returning 1) select count(*) from x'      ,'ok'   ,1,0),
    (17,'authenticated',owner_ok ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_ws'','' '',''ok'') returning 1) select count(*) from x','23514',0,0),
    (18,'authenticated',owner_ok ,'with x as (delete from public.ref_relationship_type where code=''zz_test'' returning 1) select count(*) from x'                       ,'ok'   ,1,1),
    (19,'authenticated',owner_ok ,'select count(*) from public.ref_relationship_type'                                                                                   ,'ok'   ,6,0),
    (20,'postgres'     ,'{}'     ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_inner'',''جزء من العمل'',''Part of work'') returning 1) select count(*) from x','ok',1,1),
    (21,'postgres'     ,'{}'     ,'with x as (delete from public.ref_relationship_type where code=''zz_inner'' returning 1) select count(*) from x'                       ,'ok'   ,1,1),
    (22,'postgres'     ,'{}'     ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''part_of'',''x'',''x'') returning 1) select count(*) from x','23505',0,0),
    (23,'postgres'     ,'{}'     ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_n'',null,''x'') returning 1) select count(*) from x'  ,'23502',0,0),
    (24,'postgres'     ,'{}'     ,'with x as (insert into public.ref_relationship_type(code,label_ar,label_en) values(''zz_n'',''x'',null) returning 1) select count(*) from x'  ,'23502',0,0)
  ) as t(id,role_name,claims,stmt,exp_state,exp_rows,exp_log)
  loop
    total := total + 1;
    perform set_config('request.jwt.claims', s.claims, true);
    select count(*) into n_before from public.change_log;
    got_state := 'ok'; got_rows := null;
    begin
      if s.role_name <> 'postgres' then execute format('set local role %I', s.role_name); end if;
      execute s.stmt into got_rows;
    exception when others then got_state := sqlstate; got_rows := 0;
    end;
    execute 'reset role';
    select count(*) into n_after from public.change_log;
    if got_state = s.exp_state and got_rows = s.exp_rows and (n_after - n_before) = s.exp_log then
      rep_pass := rep_pass || format(E'PASS B1.%s %s state=%s rows=%s log+%s\n', s.id, s.role_name, got_state, got_rows, n_after-n_before);
    else
      fails := fails + 1;
      rep_fail := rep_fail || format(E'FAIL B1.%s %s | expected state=%s rows=%s log+%s | actual state=%s rows=%s log+%s\n', s.id, s.role_name, s.exp_state, s.exp_rows, s.exp_log, got_state, got_rows, n_after-n_before);
    end if;
  end loop;

  -- B2: every blank / whitespace-only variant must be rejected by the CHECK (23514) in BOTH label fields; 0 rows logged
  foreach v in array array['', ' ', '   ', E'\t', E'\n', E' \t\n ', chr(160), chr(160)||' '||chr(160), chr(8203), chr(65279)] loop
    foreach fld in array array['label_ar','label_en'] loop
      total := total + 1;
      select count(*) into n_before from public.change_log;
      got_state := 'ok';
      begin
        execute format('insert into public.ref_relationship_type(code,label_ar,label_en) values(%L,%L,%L)', 'zz_ws', case when fld='label_ar' then v else 'ok' end, case when fld='label_en' then v else 'ok' end);
      exception when others then got_state := sqlstate;
      end;
      select count(*) into n_after from public.change_log;
      if got_state = '23514' and n_after = n_before then rep_pass := rep_pass || format(E'PASS B2 %s blank(len=%s,first=%s) rejected\n', fld, length(v), coalesce(ascii(v),0));
      else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B2 %s blank(len=%s,first=%s) | expected 23514 | actual %s log+%s\n', fld, length(v), coalesce(ascii(v),0), got_state, n_after-n_before); end if;
    end loop;
  end loop;

  -- B3: the single 'update' row written for zz_test has the right content; 6 seed rows intact; sequence gap exactly 5
  total := total + 1;
  select format('%s|%s|%s|%s|%s', by_user, tbl, action, before->>'label_en', after->>'label_en') into a from public.change_log where pk='zz_test' and action='update';
  if a = 'ahrvision@gmail.com|ref_relationship_type|update|test|test2' then rep_pass := rep_pass || E'PASS B3 log row content\n';
  else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B3 log row content | expected ahrvision@gmail.com|ref_relationship_type|update|test|test2 | actual %s\n', a); end if;
  total := total + 1;
  select count(*) into got_rows from public.ref_relationship_type;
  if got_rows = 6 then rep_pass := rep_pass || E'PASS B3 six rows intact\n'; else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B3 rows expected 6 actual %s\n', got_rows); end if;
  total := total + 1;
  select md5(string_agg(t::text, '|' order by t.code)) into a from public.ref_relationship_type t;
  if a = seed_md5 then rep_pass := rep_pass || E'PASS B3 six seed rows byte-identical to the start (nothing modified or deleted by anon / other user / unverified owner)\n';
  else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B3 seed rows changed | expected md5 %s | actual %s\n', seed_md5, a); end if;
  total := total + 1;
  select count(*) into n_after from public.change_log;
  if n_after - log0 = 5 then rep_pass := rep_pass || E'PASS B3 change_log +5 inside the test (rolled back after)\n'; else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B3 change_log delta expected 5 actual %s\n', n_after-log0); end if;
  total := total + 1;
  select coalesce(last_value,0) into seq1 from pg_sequences where schemaname='public' and sequencename='change_log_id_seq';
  if seq1 - seq0 = 5 then rep_pass := rep_pass || E'PASS B3 change_log_id_seq consumed 5\n'; else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B3 sequence consumed expected 5 actual %s\n', seq1-seq0); end if;

  raise exception 'PHASE1_001_PART_B_% (fails=% / total=%)%', case when fails=0 then 'PASS' else 'FAIL' end, fails, total, E'\n'||rep_fail||rep_pass;
exception when others then
  if sqlerrm like 'PHASE1_001_PART_B_PASS%' or sqlerrm like 'PHASE1_001_PART_B_FAIL%' or sqlerrm like 'PHASE1_001_PART_B_ERROR%' then raise; end if;
  raise exception 'PHASE1_001_PART_B_ERROR: % (sqlstate %)', sqlerrm, sqlstate;
end $$;

-- ---------------------------------- PART C (optional; run only with Ahmed's approval; always rolled back) ----------------------------------
do $$
declare ok1 boolean; ok2 boolean; ok3 boolean;
begin
  drop table if exists public.ref_relationship_type;                                  -- the exact 001.down statement
  ok1 := to_regclass('public.ref_relationship_type') is null;
  ok2 := (select count(*) from pg_class where relnamespace='public'::regnamespace and relkind='r') = 20;
  ok3 := (select count(*) from public.change_log) = (select row_count from backup_phase1._manifest where tbl='change_log');
  raise exception 'PHASE1_001_PART_C_% (table_gone=% old_tables_20=% change_log_unchanged=%)', case when ok1 and ok2 and ok3 then 'PASS' else 'FAIL' end, ok1, ok2, ok3;
end $$;
