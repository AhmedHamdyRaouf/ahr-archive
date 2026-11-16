-- Re-check of the 001 policy assertions AFTER 002 exists (the full tests_001 Part A is a point-in-time suite for "backup + 001 only";
-- once 002 is applied its structure-count assertions are superseded by tests_002 Part A2, which is cumulative).
-- This file re-runs the 001 owner_all assertion (A04, now including roles) and the 001 policy-name expectation. Read-only. Expect 2 rows PASS.
select 'A04 owner_all identical to works.owner_all (cmd, permissive, using, with check, roles)' test_id,
  w.v expected, n.v actual, case when w.v = n.v then 'PASS' else 'FAIL' end result
from (select polcmd::text||'|'||polpermissive||'|'||pg_get_expr(polqual,polrelid)||'|'||pg_get_expr(polwithcheck,polrelid)||'|'||coalesce((select string_agg(r.rolname,',' order by r.rolname) from pg_roles r where r.oid = any(polroles)),'public') v from pg_policy where polrelid='public.works'::regclass and polname='owner_all') w,
     (select polcmd::text||'|'||polpermissive||'|'||pg_get_expr(polqual,polrelid)||'|'||pg_get_expr(polwithcheck,polrelid)||'|'||coalesce((select string_agg(r.rolname,',' order by r.rolname) from pg_roles r where r.oid = any(polroles)),'public') v from pg_policy where polrelid='public.ref_relationship_type'::regclass and polname='owner_all') n
union all
select 'A04b ref_relationship_type has exactly one policy, owner_all, TO authenticated', 'owner_all|authenticated',
  (select string_agg(polname::text||'|'||(select string_agg(r.rolname,',') from pg_roles r where r.oid = any(polroles)),',') from pg_policy where polrelid='public.ref_relationship_type'::regclass),
  case when (select string_agg(polname::text||'|'||(select string_agg(r.rolname,',') from pg_roles r where r.oid = any(polroles)),',') from pg_policy where polrelid='public.ref_relationship_type'::regclass) = 'owner_all|authenticated' then 'PASS' else 'FAIL' end;
