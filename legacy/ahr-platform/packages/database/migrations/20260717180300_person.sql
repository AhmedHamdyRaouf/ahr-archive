-- Implements: Entity Catalog, Relationship Model (Phase 4) — Person.
-- "Any individual within the AHR ecosystem." No FK dependencies of its own;
-- Contribution, Media, Press reference it (later migrations).
-- name_variants captures alternate spellings/transliterations (e.g. multiple
-- accepted Arabic/English renderings of the same name) for search matching,
-- per Search Architecture's bilingual-matching requirement (Phase 3).

create table person (
  id                    uuid primary key default gen_random_uuid(),
  public_id             text not null,

  name_ar               text not null,
  name_en               text not null,
  name_variants         jsonb not null default '[]'::jsonb,
  bio_ar                text,
  bio_en                text,

  is_featured           boolean not null default false,
  display_order         integer,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_person_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_person_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_person_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived'))
);

create trigger trg_person_set_updated_at
  before update on person
  for each row execute function set_updated_at();

create unique index uq_person_public_id on person (public_id);

comment on table person is
  'Implements: Entity Catalog — Person (Phase 4). This is the single Identity '
  'referenced from every role/User per Identity Model (Phase 4) — never duplicated per role.';
