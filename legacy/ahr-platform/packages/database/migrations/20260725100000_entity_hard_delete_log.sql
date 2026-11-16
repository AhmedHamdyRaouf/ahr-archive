-- Implements: data owner decision, 2026-07-25 — a genuine, irreversible
-- "Delete Permanently" action for Administrators, available on every
-- table, distinct from the existing archive-only workflow. Explicitly
-- requested despite the platform's own "No Hard Delete, ever, for a
-- published entity" principle (Data Lifecycle, Phase 4) — the data owner
-- was walked through the consequences (irreversible row loss; referencing
-- rows still block the delete via existing ON DELETE RESTRICT foreign
-- keys, by their own choice, no cascade) and asked for it anyway, with
-- one condition: every permanent delete writes a full snapshot here
-- FIRST, so at least a manual, off-table recovery path exists.
--
-- Added after the consolidated RLS migration (20260719120000) already
-- ran, so it enables RLS and defines its own policies in this same
-- migration, matching the established pattern for every table added
-- since (see e.g. ai_recommendation_log, media_library).

create table entity_hard_delete_log (
  id            uuid primary key default gen_random_uuid(),

  entity_table  text not null,
  entity_id     uuid not null,
  -- Full row, exactly as it existed the moment before deletion — the
  -- only remaining copy of that data anywhere once the delete commits.
  snapshot      jsonb not null,

  deleted_by    uuid not null references platform_user (id) on delete restrict,
  deleted_at    timestamptz not null default now(),
  reason        text
);

create index idx_entity_hard_delete_log_entity on entity_hard_delete_log (entity_table, entity_id);
create index idx_entity_hard_delete_log_deleted_by on entity_hard_delete_log (deleted_by);
create index idx_entity_hard_delete_log_deleted_at on entity_hard_delete_log (deleted_at);

comment on table entity_hard_delete_log is
  'Implements: data owner decision 2026-07-25 — pre-delete snapshot log for the new '
  '"Delete Permanently" capability (@ahr/cms-core genericForceDelete). Append-only: no '
  'UPDATE/DELETE policy exists for any role, matching entity_state_transition/activity_log.';

-- RLS: same append-only-audit shape as entity_state_transition/
-- activity_log (admin read, admin insert, no update/delete for ANY role —
-- the log of what was permanently deleted must itself never be erasable).

alter table entity_hard_delete_log enable row level security;

create policy entity_hard_delete_log_admin_read on entity_hard_delete_log
  for select
  using (is_administrator());

create policy entity_hard_delete_log_admin_insert on entity_hard_delete_log
  for insert
  with check (is_administrator());
