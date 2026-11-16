-- Implements: Entity Catalog, Relationship Model, Data Integrity Rules (Phase 4)
-- — Award. "A prize, honor, or official membership."
-- Enforces: "Award always references at least one granting Organization"
-- (Data Integrity Rules, Phase 4) via organization_id not null.

create table award (
  id                    uuid primary key default gen_random_uuid(),

  title_ar              text not null,
  title_en              text not null,
  description_ar        text,
  description_en        text,
  year                  integer,

  organization_id       uuid not null references organization (id) on delete restrict,
  person_id             uuid references person (id) on delete restrict,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_award_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_award_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_award_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived'))
);

create trigger trg_award_set_updated_at
  before update on award
  for each row execute function set_updated_at();

create index idx_award_organization_id on award (organization_id);
create index idx_award_person_id on award (person_id);

comment on table award is
  'Implements: Entity Catalog, Data Integrity Rules (Phase 4) — Award. '
  'organization_id is NOT NULL: "no award without a documented institutional source."';
