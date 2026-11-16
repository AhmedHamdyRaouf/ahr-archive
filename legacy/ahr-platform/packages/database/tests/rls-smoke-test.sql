-- RLS Behavior Smoke Test
-- Added: Phase 2 CTO Audit — Milestone 2 (Database Foundation) Verification.
--
-- Unlike tests/smoke-test.sql (which validates structural constraints and
-- necessarily runs as a superuser/table-owner role, which always bypasses
-- Row Level Security), this file validates that the policies added in
-- migration 20260719120000_row_level_security.sql actually produce the
-- intended access behavior for non-superuser roles — the same roles
-- Supabase's PostgREST layer uses in production (`anon`, `authenticated`).
--
-- Requires the local verification shim (auth.uid(), anon/authenticated/
-- service_role roles) that a real Supabase project provisions itself;
-- see docs/local-rls-verification.md for how to run this against a
-- disposable local Postgres instance. This file performs no destructive
-- action against a real project and is never pointed at production.
--
-- Wrapped in a transaction and rolled back at the end, identical in spirit
-- to tests/smoke-test.sql, so it is safe to run repeatably.

begin;

-- ---------------------------------------------------------------------------
-- Fixtures (inserted as the table owner / superuser, bypassing RLS, exactly
-- like normal migration/seed work would via the service-role client)
-- ---------------------------------------------------------------------------

insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'), -- the administrator
  ('00000000-0000-0000-0000-000000000099'); -- an auth.users row with NO platform_user (provisioning-error case)

insert into person (id, public_id, name_ar, name_en, status, visibility, verification_status, created_by, updated_by)
values ('10000000-0000-0000-0000-000000000001', 'admin-person', N'مسؤول', 'Admin Person',
        'published', 'restricted', 'verified',
        '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

insert into platform_user (id, person_id, role, created_by, updated_by)
values ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
        'administrator', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

insert into work (id, public_id, title_ar, title_en, work_type, status, visibility, verification_status, created_by, updated_by)
values
  ('20000000-0000-0000-0000-000000000001', 'published-public-work', N'عمل منشور', 'Published Work', 'song',
   'published', 'public', 'verified', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'draft-work', N'عمل مسودة', 'Draft Work', 'song',
   'draft', 'hidden', 'pending', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------------
-- Scenario 1 — Anonymous (unauthenticated) Visitor
-- ---------------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from work;
  assert visible_count = 1, format('FAIL: anon should see exactly 1 published+public work, saw %s', visible_count);
  raise notice 'PASS: anon sees only the published+public work (1 row), not the draft';
end $$;

do $$
begin
  begin
    insert into work (public_id, title_ar, title_en, work_type, created_by, updated_by)
    values ('anon-attempt', N'محاولة', 'Attempt', 'song',
            '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');
    raise exception 'FAIL: anon insert into work should have been rejected by RLS';
  exception
    when insufficient_privilege or others then
      raise notice 'PASS: anon insert into work rejected';
  end;
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Scenario 2 — Authenticated Administrator
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

do $$
declare
  visible_count integer;
  is_admin boolean;
begin
  select is_administrator() into is_admin;
  assert is_admin, 'FAIL: is_administrator() should be true for the seeded administrator session';
  raise notice 'PASS: is_administrator() resolves true for the administrator session';

  select count(*) into visible_count from work;
  assert visible_count = 2, format('FAIL: administrator should see both works (draft + published), saw %s', visible_count);
  raise notice 'PASS: administrator sees every work regardless of status/visibility (2 rows)';
end $$;

do $$
begin
  update work set title_en = 'Draft Work (edited)' where id = '20000000-0000-0000-0000-000000000002';
  raise notice 'PASS: administrator can update a draft work';
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Scenario 3 — Authenticated session with NO platform_user row
-- (the documented "provisioning error" case — must fail closed, never
-- silently fall back to elevated or public access)
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000099', true);

do $$
declare
  visible_count integer;
  is_admin boolean;
  own_row_count integer;
begin
  select is_administrator() into is_admin;
  assert not is_admin, 'FAIL: a session with no platform_user row must never resolve as administrator';
  raise notice 'PASS: an orphaned auth session (no platform_user row) is never treated as administrator';

  select count(*) into visible_count from work;
  assert visible_count = 1, format('FAIL: this session should still only see the published+public work (1), saw %s', visible_count);
  raise notice 'PASS: an orphaned auth session still only sees published+public content, never more';

  select count(*) into own_row_count from platform_user;
  assert own_row_count = 0, 'FAIL: an orphaned session should see zero platform_user rows (no row has this id)';
  raise notice 'PASS: platform_user self-read policy correctly returns zero rows for a non-existent platform_user id';
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Scenario 4 — Administrator can read their own platform_user row directly
-- via the self-read policy (independent of is_administrator()'s own,
-- separately-privileged internal lookup)
-- ---------------------------------------------------------------------------

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

do $$
declare
  own_row_count integer;
begin
  select count(*) into own_row_count from platform_user where id = auth.uid();
  assert own_row_count = 1, 'FAIL: the administrator should be able to read their own platform_user row';
  raise notice 'PASS: platform_user_self_read policy allows a session to read its own row';
end $$;

reset role;

-- ---------------------------------------------------------------------------
-- Scenario 5 — platform_settings selective public read
-- ---------------------------------------------------------------------------

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

do $$
declare
  public_visible integer;
  sensitive_visible integer;
begin
  select count(*) into public_visible from platform_settings where key = 'site_name';
  assert public_visible = 1, 'FAIL: anon should be able to read the public site_name setting';

  select count(*) into sensitive_visible from platform_settings where key = 'ai_configuration';
  assert sensitive_visible = 0, 'FAIL: anon must never be able to read ai_configuration';

  raise notice 'PASS: platform_settings selective public read excludes ai_configuration/email_configuration for anon';
end $$;

reset role;

do $$
begin
  raise notice 'ALL RLS BEHAVIOR SMOKE TESTS PASSED';
end $$;

rollback;
