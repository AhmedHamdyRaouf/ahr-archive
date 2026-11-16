-- Implements: Entity Catalog, Relationship Model, Data Integrity Rules (Phase 4)
-- — Contribution. "The precise link between Person and Work/Project/Event."
--
-- Enforces Data Integrity Rule: "Contribution always references exactly one
-- Person, and at least one of Work/Project/Event." This is enforced here as
-- a real database constraint (chk_contribution_target_present), not left to
-- application code discipline.

create table contribution (
  id                    uuid primary key default gen_random_uuid(),

  person_id             uuid not null references person (id) on delete restrict,
  work_id               uuid references work (id) on delete restrict,
  project_id            uuid references project (id) on delete restrict,
  event_id              uuid references event (id) on delete restrict,

  role                  text not null,
  role_detail_ar        text,
  role_detail_en        text,
  credit_order          integer,
  source_notes          text,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_contribution_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_contribution_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_contribution_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived')),
  constraint chk_contribution_role
    check (role in ('composer', 'arranger', 'producer', 'lyricist', 'singer',
                     'director', 'music_director', 'conductor', 'performer')),
  constraint chk_contribution_target_present
    check (work_id is not null or project_id is not null or event_id is not null)
);

create trigger trg_contribution_set_updated_at
  before update on contribution
  for each row execute function set_updated_at();

create index idx_contribution_person_id on contribution (person_id);
create index idx_contribution_work_id on contribution (work_id);
create index idx_contribution_project_id on contribution (project_id);
create index idx_contribution_event_id on contribution (event_id);

comment on table contribution is
  'Implements: Entity Catalog, Data Integrity Rules (Phase 4) — Contribution. '
  'chk_contribution_target_present is the DB-enforced form of '
  '"Contribution always references one Person and at least one of Work/Project/Event."';
