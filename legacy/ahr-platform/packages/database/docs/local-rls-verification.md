# Local Row Level Security Verification

**Added:** Phase 2 CTO Audit — Milestone 2 (Database Foundation) Verification.
**Status:** 🔒 Verification tooling — not part of the production schema or deploy path.

This document explains how `tests/rls-smoke-test.sql` was verified, and how to
re-run it, against a disposable local PostgreSQL instance instead of a live
Supabase project (none is provisioned yet — Blocking Issue B4).

A real Supabase project provisions three things our own migrations never
create, because Supabase creates them itself for every project: the `auth`
schema and `auth.uid()` function, and the `anon`/`authenticated`/
`service_role` Postgres roles with their standard table grants. Locally, a
one-time shim recreates the minimum needed to exercise our own RLS policies
correctly. This shim is never applied to a real Supabase project (Supabase
already has the real versions of all of it) and ships in no migration file.

## One-time local setup

```sql
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid()
);

create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$ language sql stable;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;

-- Run once, AFTER every migration under migrations/ has been applied (these
-- tables must already exist):
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
grant execute on function is_administrator() to anon, authenticated;
```

## Running the verification

```bash
createdb ahr_rls_check
psql -d ahr_rls_check -f /tmp/00_supabase_shim.sql   # the block above, saved to a file
for f in migrations/*.sql; do psql -d ahr_rls_check -v ON_ERROR_STOP=1 -f "$f"; done
psql -d ahr_rls_check -c "grant select, insert, update, delete on all tables in schema public to anon, authenticated; grant execute on function is_administrator() to anon, authenticated;"
psql -d ahr_rls_check -v ON_ERROR_STOP=1 -f tests/rls-smoke-test.sql
```

`tests/rls-smoke-test.sql` wraps everything in `BEGIN`/`ROLLBACK`, so it never
leaves fixture data behind, and is safe to re-run repeatedly.

## What this proves, and what it doesn't

Confirmed by this harness, against a real PostgreSQL 16 engine:

- Every one of the 20 tables has Row Level Security enabled.
- An anonymous (`anon`) session sees only `status = 'published' AND visibility = 'public'` rows, and cannot insert.
- An authenticated administrator session sees and can modify every row regardless of status/visibility.
- A session with **no** `platform_user` row (the documented provisioning-error case) fails closed: `is_administrator()` is false, content visibility falls back to public-only, and `platform_user` self-read correctly returns zero rows.
- `platform_settings` correctly excludes `ai_configuration`/`email_configuration` from anonymous read while keeping the rest public.

**Not covered by this harness** (needs a real Supabase project, tracked under Blocking Issue B4 in the Deployment & DevOps report):

- PostgREST's own request-routing and JWT-parsing behavior (this shim reimplements only the `auth.uid()` contract our policies rely on, not the whole auth stack).
- Supabase Storage's own signed-URL/bucket-policy behavior for `media_asset`.
- The known `activity_log` failed-login edge case flagged in migration `20260719120000_row_level_security.sql`'s own comments and in the Authentication & Authorization Verification Report — this requires an application-code change (a service-role or `SECURITY DEFINER` write path), not a schema change, and is tracked as Backlog.
