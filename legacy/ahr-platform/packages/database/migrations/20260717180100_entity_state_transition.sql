-- Implements: Data Foundation Conventions §7 — one shared, append-only
-- history log for every entity's state transitions, instead of a
-- per-table history shadow table. Realizes Archive Model's
-- "Historical Preservation" principle (Phase 4) and Data Lifecycle's
-- state sequence (Phase 4).

create table entity_state_transition (
  id            uuid primary key default gen_random_uuid(),
  entity_table  text not null,
  entity_id     uuid not null,
  from_status   text,
  to_status     text not null,
  changed_by    uuid not null,
  changed_at    timestamptz not null default now(),
  reason        text
);

create index idx_entity_state_transition_entity
  on entity_state_transition (entity_table, entity_id);

comment on table entity_state_transition is
  'Append-only log of every status transition for every entity table. '
  'Implements: Archive Model, Data Lifecycle (Phase 4). Never updated or deleted, only inserted into.';
