-- Implements: Database Architecture (Frozen v1) §2.2 — moderation_report.
-- Closes Blocking Issue B2 (Build Manifest) — storage for Moderation Logic
-- (Phase 6), never present in the original Entity Catalog (Phase 4).
--
-- entity_table/entity_id are plain columns, not a foreign key, for the same
-- reason entity_state_transition uses the same pattern (§3 of the Database
-- Architecture): a report must be able to reference ANY current or future
-- table, including tables that don't exist yet (Release 2).

create table moderation_report (
  id                  uuid primary key default gen_random_uuid(),

  entity_table        text not null,
  entity_id           uuid not null,

  reason              text not null,
  status              text not null default 'open',
  reported_by         uuid not null references platform_user (id) on delete restrict,
  assigned_to         uuid references platform_user (id) on delete restrict,
  resolution_notes    text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid not null,
  updated_by          uuid not null,

  constraint chk_moderation_report_status
    check (status in ('open', 'in_review', 'escalated', 'resolved'))
    -- This is the report's OWN lifecycle, distinct from any content entity's
    -- `status` column (Draft/Review/Verified/Published/Archived) — a report
    -- being 'resolved' says nothing about the underlying entity's own status.
);

create trigger trg_moderation_report_set_updated_at
  before update on moderation_report
  for each row execute function set_updated_at();

create index idx_moderation_report_entity on moderation_report (entity_table, entity_id);
create index idx_moderation_report_status on moderation_report (status);

comment on table moderation_report is
  'Implements: Database Architecture (Frozen v1) §2.2 — Moderation Logic (Phase 6) storage. '
  'entity_table/entity_id are plain columns by design, not a foreign key (see file header).';
