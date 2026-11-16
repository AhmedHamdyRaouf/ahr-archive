-- Implements: Database Architecture (Frozen v1) §2.1, §5, §6, §7 — platform_user.
-- Bridges Supabase Auth (auth.users) to our own person/Identity Model (Phase 4).
-- id is NOT independently generated (see §5 of the Database Architecture) — it is
-- always set equal to the corresponding auth.users.id by the calling code at
-- creation time, so no `default gen_random_uuid()` appears on this table's id.

create table platform_user (
  id            uuid primary key,
  person_id     uuid not null unique references person (id) on delete restrict,

  role          text not null default 'administrator',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid,
  updated_by    uuid,

  constraint chk_platform_user_role
    check (role in ('administrator'))
    -- Deliberately a narrow, single-value check today, not a native enum type.
    -- Release 2 adding 'trainer' / 'student' / 'creative_member' is a one-line
    -- constraint update, per Database Architecture §7 — not a migration that
    -- touches existing rows or requires an ALTER TYPE.
);

create trigger trg_platform_user_set_updated_at
  before update on platform_user
  for each row execute function set_updated_at();

comment on table platform_user is
  'Implements: Database Architecture (Frozen v1) §2.1. Bridges auth.users to person. '
  'id = auth.users.id (not independently generated). One row per Person who can log in.';
