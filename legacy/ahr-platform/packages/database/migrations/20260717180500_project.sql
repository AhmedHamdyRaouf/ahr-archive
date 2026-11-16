-- Implements: Entity Catalog, Relationship Model (Phase 4) — Project.
-- "An ongoing activity not classified as a finished creative work."
-- organization_id is nullable: a Project may or may not have a sponsoring
-- Organization (Relationship Model, Phase 4: "optional relationship").

create table project (
  id                    uuid primary key default gen_random_uuid(),
  public_id             text not null,

  title_ar              text not null,
  title_en              text not null,
  project_type          text not null,
  description_ar        text,
  description_en        text,

  organization_id       uuid references organization (id) on delete restrict,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_project_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_project_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_project_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived')),
  constraint chk_project_type
    check (project_type in ('training', 'jury', 'cultural', 'educational',
                             'choir_direction', 'initiative'))
);

create trigger trg_project_set_updated_at
  before update on project
  for each row execute function set_updated_at();

create unique index uq_project_public_id on project (public_id);
create index idx_project_organization_id on project (organization_id);

comment on table project is
  'Implements: Entity Catalog — Project (Phase 4).';
