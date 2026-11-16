-- ============================================================================================
-- tests_002.PREP.sql — tests for migration 002 (public.work_relationship). Run AFTER 002.up. One statement per call.
--  PART A1 read-only. New table only (structure, constraints, indexes, RLS, policy, trigger, grants, empty). Self-contained: also runs on a scratch PG.
--  PART A2 read-only. Old data/structure unchanged vs backup_phase1 (needs backup_phase1; Supabase only). Adds the 002 delta on top of 001.
--          A1/A2 each return rows test_id|expected|actual|result + a last row ZZ SUMMARY (PASS only if every required test exists and passes).
--  PART B  one DO block, ALWAYS ends with RAISE EXCEPTION (everything rolled back, nothing permanent). Report = error message:
--              PHASE1_002_PART_B_PASS (fails=0 / total=N)   -> the only success
--              PHASE1_002_PART_B_FAIL / _ERROR              -> failure
--          Only effect a rollback cannot undo: change_log_id_seq advances by exactly the number of change_log rows the test wrote
--          (gap in ids, no rows). Part B asserts that number.
--  PART C  (NOT to be run without approval) DOWN test, rolls back.
-- ============================================================================================

-- ---------------------------------- PART A1 ----------------------------------
with
cols as (
  select string_agg(format('%s:%s:%s:%s',a.attname,format_type(a.atttypid,a.atttypmod),a.attnotnull::text,coalesce(pg_get_expr(d.adbin,d.adrelid),'')),'|' order by a.attnum) s
  from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
  where a.attrelid='public.work_relationship'::regclass and a.attnum>0 and not a.attisdropped),
cons as (
  select string_agg(conname::text||'='||pg_get_constraintdef(oid),' | ' order by conname::text) s from pg_constraint where conrelid='public.work_relationship'::regclass),
idx as (
  select string_agg(indexrelid::regclass::text,',' order by indexrelid::regclass::text) s from pg_index where indrelid='public.work_relationship'::regclass),
gm_new as (
  select g.rolname::text grantee, x.privilege_type::text priv, x.is_grantable grantable
  from pg_class c cross join lateral aclexplode(c.relacl) x join pg_roles g on g.oid=x.grantee
  where c.oid='public.work_relationship'::regclass and g.rolname in ('anon','authenticated','service_role')),
gm_works as (
  select g.rolname::text grantee, x.privilege_type::text priv, x.is_grantable grantable
  from pg_class c cross join lateral aclexplode(c.relacl) x join pg_roles g on g.oid=x.grantee
  where c.oid='public.works'::regclass and g.rolname in ('anon','authenticated','service_role')),
pol as (
  select p.polname::text nm, p.polcmd::text cmd, p.polpermissive::text perm, pg_get_expr(p.polqual,p.polrelid) q, pg_get_expr(p.polwithcheck,p.polrelid) wc, coalesce((select string_agg(r.rolname,',' order by r.rolname) from pg_roles r where r.oid = any(p.polroles)),'public') roles
  from pg_policy p where p.polrelid='public.work_relationship'::regclass),
polw as (
  select p.polname::text nm, p.polcmd::text cmd, p.polpermissive::text perm, pg_get_expr(p.polqual,p.polrelid) q, pg_get_expr(p.polwithcheck,p.polrelid) wc, coalesce((select string_agg(r.rolname,',' order by r.rolname) from pg_roles r where r.oid = any(p.polroles)),'public') roles
  from pg_policy p where p.polrelid='public.works'::regclass and p.polname='owner_all'),
required(test_id) as (values
  ('A1.01 columns'),('A1.02 constraints exact'),('A1.03 FKs all ON DELETE RESTRICT (3)'),('A1.04 indexes exact'),
  ('A1.05 RLS enabled, not forced'),('A1.06 policies on table = exactly owner_all'),('A1.07 owner_all identical to works.owner_all'),
  ('A1.08 trigger definition'),('A1.09 triggers on table = exactly 1'),('A1.10 grants matrix = works'),('A1.11 grants mismatching entries'),
  ('A1.12 rows = 0'),('A1.13 no view/rule depends on table'),('A1.14 table has no inheritance/partition')),
results(test_id, expected, actual) as (
  select 'A1.01 columns',
    'relationship_id:text:true:|source_work_id:text:true:|target_work_id:text:true:|relationship_type:text:true:|qualifier:text:true:''''::text|qualifier_en:text:true:''''::text|notes:text:true:''''::text|notes_en:text:true:''''::text|evidence_status:text:true:''''::text|confidence:text:true:''''::text|privacy:text:true:''داخلي''::text|publish:text:true:''لا''::text|sort_order:integer:true:0',
    (select s from cols)
  union all select 'A1.02 constraints exact',
    'chk_work_relationship_no_self=CHECK ((source_work_id <> target_work_id)) | fk_work_relationship_source=FOREIGN KEY (source_work_id) REFERENCES works(work_id) ON DELETE RESTRICT | fk_work_relationship_target=FOREIGN KEY (target_work_id) REFERENCES works(work_id) ON DELETE RESTRICT | fk_work_relationship_type=FOREIGN KEY (relationship_type) REFERENCES ref_relationship_type(code) ON DELETE RESTRICT | uq_work_relationship_triple=UNIQUE (source_work_id, target_work_id, relationship_type) | work_relationship_pkey=PRIMARY KEY (relationship_id)',
    (select s from cons)
  union all select 'A1.03 FKs all ON DELETE RESTRICT (3)', '3', (select count(*)::text from pg_constraint where conrelid='public.work_relationship'::regclass and contype='f' and confdeltype='r')
  union all select 'A1.04 indexes exact',
    'idx_work_relationship_source,idx_work_relationship_target,idx_work_relationship_type,uq_work_relationship_triple,work_relationship_pkey',
    (select s from idx)
  union all select 'A1.05 RLS enabled, not forced', 'true/false', (select relrowsecurity::text||'/'||relforcerowsecurity::text from pg_class where oid='public.work_relationship'::regclass)
  union all select 'A1.06 policies on table = exactly owner_all', 'owner_all', (select string_agg(nm,',') from pol)
  union all select 'A1.07 owner_all identical to works.owner_all',
    (select format('%s|%s|%s|%s|%s',cmd,perm,q,wc,roles) from polw), (select format('%s|%s|%s|%s|%s',cmd,perm,q,wc,roles) from pol where nm='owner_all')
  union all select 'A1.08 trigger definition',
    'CREATE TRIGGER trg_log_work_relationship AFTER INSERT OR DELETE OR UPDATE ON public.work_relationship FOR EACH ROW EXECUTE FUNCTION log_change(''relationship_id'')',
    (select pg_get_triggerdef(oid) from pg_trigger where tgrelid='public.work_relationship'::regclass and not tgisinternal and tgname='trg_log_work_relationship')
  union all select 'A1.09 triggers on table = exactly 1', '1', (select count(*)::text from pg_trigger where tgrelid='public.work_relationship'::regclass and not tgisinternal)
  union all select 'A1.10 grants matrix = works',
    coalesce((select string_agg(grantee||'/'||priv||'/'||grantable, ', ' order by grantee, priv, grantable) from gm_works),'(none)'),
    coalesce((select string_agg(grantee||'/'||priv||'/'||grantable, ', ' order by grantee, priv, grantable) from gm_new),'(none)')
  union all select 'A1.11 grants mismatching entries', '0', (select count(*)::text from gm_new n full join gm_works w using (grantee, priv) where n.grantable is distinct from w.grantable)
  union all select 'A1.12 rows = 0', '0', (select count(*)::text from public.work_relationship)
  union all select 'A1.13 no view/rule depends on table', '0',
    (select count(*)::text from pg_depend d join pg_rewrite r on r.oid=d.objid where d.refobjid='public.work_relationship'::regclass and d.classid='pg_rewrite'::regclass)
  union all select 'A1.14 table has no inheritance/partition', '0', (select count(*)::text from pg_inherits where inhrelid='public.work_relationship'::regclass or inhparent='public.work_relationship'::regclass)
),
checked as (
  select test_id, expected, actual, case when actual is not distinct from expected then 'PASS' else 'FAIL' end result from results),
completeness as (
  select 'ZZ completeness: every required test present exactly once' test_id, ((select count(*) from required))::text expected,
         (select count(*)::text from required r where (select count(*) from checked c where c.test_id=r.test_id)=1) actual),
allrows as (select test_id, expected, actual, result from checked
            union all select test_id, expected, actual, case when actual=expected then 'PASS' else 'FAIL' end from completeness)
select * from allrows
union all select 'ZZ SUMMARY', (select count(*) from allrows)::text||' total', (select count(*) filter (where result='FAIL') from allrows)::text||' FAIL',
  case when (select count(*) from allrows)=15 and (select count(*) filter (where result='FAIL') from allrows)=0 then 'PASS' else 'FAIL' end
order by 1;

-- ---------------------------------- PART A2 (needs backup_phase1; Supabase) ----------------------------------
with
lat as (
  select m.tbl, m.row_count, m.md5,
         query_to_xml(format('select count(*) n, md5(coalesce(string_agg(to_jsonb(t)::text, ''|'' order by to_jsonb(t)::text),'''')) h from public.%I t', m.tbl), false, true, '') x
  from backup_phase1._manifest m),
fp   as (select kind, n, h from backup_phase1.fingerprint('public')),
base as (select kind, n, h from backup_phase1._struct_manifest),
-- cumulative delta over backup 000 = migration 001 + migration 002
delta(kind, d) as (values ('columns',6+13),('constraints',3+6),('indexes',1+5),('triggers',1+1),('policies',1+1),('rls_flags',1+1),('grants',24+24),('sequences',0),('views',0)),
live_c as (select conname::text nm, count(*) n from pg_constraint where connamespace='public'::regnamespace group by 1),
exp_c  as (select nm, sum(n) n from (select obj nm, count(*) n from backup_phase1._ddl where kind='constraint' group by 1
           union all select unnest(array['ref_relationship_type_pkey','chk_ref_relationship_type_label_ar','chk_ref_relationship_type_label_en',
                'work_relationship_pkey','fk_work_relationship_source','fk_work_relationship_target','fk_work_relationship_type','chk_work_relationship_no_self','uq_work_relationship_triple']), 1) s group by 1),
live_t as (select t.tgname::text nm, count(*) n from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relnamespace='public'::regnamespace and not t.tgisinternal group by 1),
exp_t  as (select nm, sum(n) n from (select obj nm, count(*) n from backup_phase1._ddl where kind='trigger' group by 1
           union all select 'trg_log_ref_relationship_type', 1 union all select 'trg_log_work_relationship', 1) s group by 1),
live_p as (select p.polname::text nm, count(*) n from pg_policy p join pg_class c on c.oid=p.polrelid where c.relnamespace='public'::regnamespace group by 1),
exp_p  as (select nm, sum(n) n from (select obj nm, count(*) n from backup_phase1._ddl where kind='policy' group by 1
           union all select 'owner_all', 2) s group by 1),
live_i as (select i.indexrelid::regclass::text nm, 1 n from pg_index i join pg_class c on c.oid=i.indrelid
           where c.relnamespace='public'::regnamespace and not exists(select 1 from pg_constraint k where k.conindid=i.indexrelid)),
exp_i  as (select nm, 1 n from (select obj nm from backup_phase1._ddl where kind='index'
           union all select unnest(array['idx_work_relationship_source','idx_work_relationship_target','idx_work_relationship_type'])) s),
results(test_id, expected, actual) as (
  select 'A2 data '||tbl, row_count||'/'||md5, (xpath('/row/n/text()',x))[1]::text||'/'||(xpath('/row/h/text()',x))[1]::text from lat
  union all select 'A2 manifest has 20 tables', '20', (select count(*)::text from backup_phase1._manifest)
  union all select 'A2 struct '||b.kind||' count (backup + 001 + 002)', (b.n+d.d)::text, f.n::text from base b join delta d using(kind) join fp f using(kind)
  union all select 'A2 struct views hash unchanged', b.n||'/'||b.h, f.n||'/'||f.h from base b join fp f using(kind) where kind='views'
  union all select 'A2 struct sequences hash unchanged', b.n||'/'||b.h, f.n||'/'||f.h from base b join fp f using(kind) where kind='sequences'
  union all select 'A2 constraint names vs backup+001+002', '0', (select count(*)::text from live_c l full join exp_c e using(nm) where l.n is distinct from e.n)
  union all select 'A2 trigger names vs backup+001+002', '0', (select count(*)::text from live_t l full join exp_t e using(nm) where l.n is distinct from e.n)
  union all select 'A2 policy names vs backup+001+002', '0', (select count(*)::text from live_p l full join exp_p e using(nm) where l.n is distinct from e.n)
  union all select 'A2 non-constraint index names vs backup+002', '0', (select count(*)::text from live_i l full join exp_i e using(nm) where l.n is distinct from e.n)
  union all select 'A2 function log_change unchanged', md5((select stmt from backup_phase1._ddl where kind='function' and obj='log_change')), md5(pg_get_functiondef('public.log_change'::regproc))
  union all select 'A2 public base tables = 20 old + 2 new', '22', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relkind='r')
  union all select 'A2 public views = 10', '10', (select count(*)::text from pg_class where relnamespace='public'::regnamespace and relkind='v')
  union all select 'A2 ref_relationship_type six codes unchanged', 'part_of,soundtrack_for,theme_song_for,featured_in,version_of,updates', (select string_agg(code,',' order by sort_order) from public.ref_relationship_type)
  union all select 'A2 work_relationship rows = 0', '0', (select count(*)::text from public.work_relationship)
  union all select 'A2 change_log rows about new tables', '0', (select count(*)::text from public.change_log where tbl in ('ref_relationship_type','work_relationship'))
  union all select 'A2 data_dictionary has no Phase-1 sheets (003 not run)', '0', (select count(*)::text from public.data_dictionary where sheet in ('Work_Relationship','Ref_Relationship_Type'))
  union all select 'A2 every policy in public is TO authenticated only (non-conforming = 0)', '0', (select count(*)::text from pg_policy p join pg_class c on c.oid=p.polrelid where c.relnamespace='public'::regnamespace and (select string_agg(r.rolname,',') from pg_roles r where r.oid = any(p.polroles)) is distinct from 'authenticated')
  union all select 'A2 backup _verification 31/31 ok', '31/31', (select count(*) filter (where ok)::text||'/'||count(*)::text from backup_phase1._verification)
),
checked as (select test_id, expected, actual, case when actual is not distinct from expected then 'PASS' else 'FAIL' end result from results)
select * from checked
union all select 'ZZ SUMMARY', '0 FAIL', (select count(*) filter (where result='FAIL') from checked)::text||' FAIL / '||(select count(*) from checked)::text||' total',
  case when (select count(*) from checked)=45 and (select count(*) filter (where result='FAIL') from checked)=0 then 'PASS' else 'FAIL' end
order by 1;

-- ---------------------------------- PART B (always rolled back) ----------------------------------
do $$
declare
  rep_fail text := ''; rep_pass text := ''; fails int := 0; total int := 0;
  s record; got_state text; got_rows bigint; n_before bigint; n_after bigint; log0 bigint; exp_log_sum int := 0; seq0 bigint; seq1 bigint; a text;
  w1 text; w2 text; t_before bigint; t_after bigint;
  owner_ok  constant text := '{"role":"authenticated","email":"ahrvision@gmail.com","email_verified":true}';
  owner_unv constant text := '{"role":"authenticated","email":"ahrvision@gmail.com","email_verified":false}';
  other_usr constant text := '{"role":"authenticated","email":"other@example.com","email_verified":true}';
  anon_clm  constant text := '{"role":"anon"}';
  ins constant text := 'with x as (insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values(%L,%L,%L,%L) returning 1) select count(*) from x';
begin
  if to_regclass('public.work_relationship') is null then raise exception 'PHASE1_002_PART_B_ERROR: table does not exist (002 not applied)'; end if;
  select count(*) into t_before from public.work_relationship;
  if t_before <> 0 then raise exception 'PHASE1_002_PART_B_ERROR: work_relationship is not empty before the test'; end if;
  select work_id into w1 from public.works order by work_id limit 1;
  select work_id into w2 from public.works order by work_id offset 1 limit 1;
  if w1 is null or w2 is null then raise exception 'PHASE1_002_PART_B_ERROR: need at least 2 works'; end if;
  select count(*) into log0 from public.change_log;
  select coalesce(last_value,0) into seq0 from pg_sequences where schemaname='public' and sequencename='change_log_id_seq';

  for s in select * from (values
    (1 ,'authenticated',owner_ok ,format(ins,'WR-T1',w1,w2,'part_of')                                         ,'ok'   ,1,1),
    (2 ,'anon'         ,anon_clm ,'select count(*) from public.work_relationship'                              ,'ok'   ,0,0),
    (3 ,'anon'         ,anon_clm ,format(ins,'WR-T2',w1,w2,'version_of')                                       ,'42501',0,0),
    (4 ,'anon'         ,anon_clm ,'with x as (update public.work_relationship set notes=''hacked'' returning 1) select count(*) from x','ok',0,0),
    (5 ,'anon'         ,anon_clm ,'with x as (delete from public.work_relationship returning 1) select count(*) from x','ok',0,0),
    (6 ,'authenticated',other_usr,'select count(*) from public.work_relationship'                              ,'ok'   ,0,0),
    (7 ,'authenticated',other_usr,format(ins,'WR-T2',w1,w2,'version_of')                                       ,'42501',0,0),
    (8 ,'authenticated',other_usr,'with x as (update public.work_relationship set notes=''hacked'' returning 1) select count(*) from x','ok',0,0),
    (9 ,'authenticated',other_usr,'with x as (delete from public.work_relationship returning 1) select count(*) from x','ok',0,0),
    (10,'authenticated',owner_unv,'select count(*) from public.work_relationship'                              ,'ok'   ,0,0),
    (11,'authenticated',owner_unv,format(ins,'WR-T2',w1,w2,'version_of')                                       ,'42501',0,0),
    (12,'authenticated',owner_unv,'with x as (update public.work_relationship set notes=''hacked'' returning 1) select count(*) from x','ok',0,0),
    (13,'authenticated',owner_unv,'with x as (delete from public.work_relationship returning 1) select count(*) from x','ok',0,0),
    (14,'authenticated',owner_ok ,'select count(*) from public.work_relationship'                              ,'ok'   ,1,0),
    (15,'authenticated',owner_ok ,'with x as (update public.work_relationship set notes_en=''n1'' where relationship_id=''WR-T1'' returning 1) select count(*) from x','ok',1,1),
    (16,'authenticated',owner_ok ,'with x as (update public.work_relationship set notes_en=''n1'' where relationship_id=''WR-T1'' returning 1) select count(*) from x','ok',1,0),
    (17,'authenticated',owner_ok ,format(ins,'WR-T3',w2,w1,'part_of')                                          ,'ok'   ,1,1),
    (18,'authenticated',owner_ok ,format(ins,'WR-T4',w1,w2,'version_of')                                       ,'ok'   ,1,1),
    (19,'postgres'     ,'{}'     ,format(ins,'WR-T5',w1,w2,'part_of')                                          ,'23505',0,0),
    (20,'postgres'     ,'{}'     ,format(ins,'WR-T1',w1,w2,'updates')                                          ,'23505',0,0),
    (21,'postgres'     ,'{}'     ,format(ins,'WR-T6',w1,w1,'part_of')                                          ,'23514',0,0),
    (22,'postgres'     ,'{}'     ,format(ins,'WR-T6','NO-SUCH-WORK',w2,'part_of')                              ,'23503',0,0),
    (23,'postgres'     ,'{}'     ,format(ins,'WR-T6',w1,'NO-SUCH-WORK','part_of')                              ,'23503',0,0),
    (24,'postgres'     ,'{}'     ,format(ins,'WR-T6',w1,w2,'zz_no_such_type')                                  ,'23503',0,0),
    (25,'postgres'     ,'{}'     ,'with x as (insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values(''WR-T6'',null,'''||w2||''',''part_of'') returning 1) select count(*) from x','23502',0,0),
    (26,'postgres'     ,'{}'     ,'with x as (insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values(''WR-T6'','''||w1||''','''||w2||''',null) returning 1) select count(*) from x','23502',0,0),
    (27,'postgres'     ,'{}'     ,format('with x as (delete from public.works where work_id=%L returning 1) select count(*) from x',w1)                ,'23503',0,0),
    (28,'postgres'     ,'{}'     ,'with x as (delete from public.ref_relationship_type where code=''part_of'' returning 1) select count(*) from x'      ,'23503',0,0),
    (29,'postgres'     ,'{}'     ,format('with x as (insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values(%L,%L,%L,%L) returning * ) select count(*) from x where qualifier='''' and qualifier_en='''' and notes='''' and notes_en='''' and evidence_status='''' and confidence='''' and privacy=''داخلي'' and publish=''لا'' and sort_order=0','WR-T7',w2,w1,'featured_in'),'ok',1,1),
    (30,'authenticated',owner_ok ,'with x as (delete from public.work_relationship where relationship_id=''WR-T7'' returning 1) select count(*) from x','ok',1,1),
    (31,'authenticated',owner_ok ,'with x as (delete from public.work_relationship where relationship_id=''WR-T3'' returning 1) select count(*) from x','ok',1,1),
    (32,'authenticated',owner_ok ,'with x as (delete from public.work_relationship where relationship_id=''WR-T4'' returning 1) select count(*) from x','ok',1,1),
    (33,'authenticated',owner_ok ,'with x as (delete from public.work_relationship where relationship_id=''WR-T1'' returning 1) select count(*) from x','ok',1,1),
    (34,'authenticated',owner_ok ,'select count(*) from public.work_relationship'                              ,'ok'   ,0,0)
  ) as t(id,role_name,claims,stmt,exp_state,exp_rows,exp_log) order by id
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
    exp_log_sum := exp_log_sum + s.exp_log;
  end loop;

  -- B2: log content of the single update (WR-T1), table empty again, change_log delta, sequence gap
  total := total + 1;
  select format('%s|%s|%s|%s|%s', by_user, tbl, action, coalesce(before->>'notes_en',''), after->>'notes_en') into a from public.change_log where pk='WR-T1' and action='update';
  if a = 'ahrvision@gmail.com|work_relationship|update||n1' then rep_pass := rep_pass || E'PASS B2 update log row content\n';
  else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B2 update log row | expected ahrvision@gmail.com|work_relationship|update||n1 | actual %s\n', a); end if;
  total := total + 1;
  select count(*) into t_after from public.work_relationship;
  if t_after = 0 then rep_pass := rep_pass || E'PASS B2 table empty at end of test\n'; else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B2 table rows at end expected 0 actual %s\n', t_after); end if;
  total := total + 1;
  select count(*) into n_after from public.change_log;
  if n_after - log0 = exp_log_sum then rep_pass := rep_pass || format(E'PASS B2 change_log +%s inside the test (rolled back after)\n', exp_log_sum);
  else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B2 change_log delta expected %s actual %s\n', exp_log_sum, n_after-log0); end if;
  total := total + 1;
  select coalesce(last_value,0) into seq1 from pg_sequences where schemaname='public' and sequencename='change_log_id_seq';
  if seq1 - seq0 = exp_log_sum then rep_pass := rep_pass || format(E'PASS B2 change_log_id_seq consumed %s\n', exp_log_sum);
  else fails := fails + 1; rep_fail := rep_fail || format(E'FAIL B2 sequence consumed expected %s actual %s\n', exp_log_sum, seq1-seq0); end if;

  raise exception 'PHASE1_002_PART_B_% (fails=% / total=%)%', case when fails=0 then 'PASS' else 'FAIL' end, fails, total, E'\n'||rep_fail||rep_pass;
exception when others then
  if sqlerrm like 'PHASE1_002_PART_B_PASS%' or sqlerrm like 'PHASE1_002_PART_B_FAIL%' or sqlerrm like 'PHASE1_002_PART_B_ERROR%' then raise; end if;
  raise exception 'PHASE1_002_PART_B_ERROR: % (sqlstate %)', sqlerrm, sqlstate;
end $$;

-- ---------------------------------- PART C (DOWN test; NOT to be run on production without approval) ----------------------------------
-- do $$ begin
--   drop table public.work_relationship;
--   if to_regclass('public.work_relationship') is not null then raise exception 'PHASE1_002_PART_C_FAIL: table still exists'; end if;
--   if exists(select 1 from pg_trigger where tgname='trg_log_work_relationship') then raise exception 'PHASE1_002_PART_C_FAIL: trigger remains'; end if;
--   if exists(select 1 from pg_class where relname like '%work_relationship%') then raise exception 'PHASE1_002_PART_C_FAIL: object remains'; end if;
--   raise exception 'PHASE1_002_PART_C_PASS (rolled back)';
-- end $$;
