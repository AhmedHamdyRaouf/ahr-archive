-- Implements: Entity Catalog, Relationship Model (Phase 4) — Work.
-- "Any completed creative unit." Self-references via parent_work_id for
-- compound works (e.g. a song that is part of an album), per the
-- work_relationship values documented in the pre-existing archive schema
-- reviewed in Phase 0 Audit (AHR Architecture v1.0 FROZEN) and re-approved
-- here as the concrete implementation.

create table work (
  id                    uuid primary key default gen_random_uuid(),
  public_id             text not null,

  title_ar              text not null,
  title_en              text not null,
  title_variants        jsonb not null default '[]'::jsonb,
  work_type             text not null,
  year                  integer,
  description_ar        text,
  description_en        text,

  parent_work_id        uuid references work (id) on delete restrict,
  work_relationship     text,

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

  constraint chk_work_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_work_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_work_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived')),
  constraint chk_work_type
    check (work_type in ('song', 'album', 'theatre', 'tv_series', 'film',
                          'soundtrack', 'arrangement', 'choir', 'concert')),
  constraint chk_work_relationship
    check (work_relationship is null or
           work_relationship in ('contains', 'part_of', 'derived_from', 'live_version')),
  constraint chk_work_parent_not_self
    check (parent_work_id is null or parent_work_id <> id)
);

create trigger trg_work_set_updated_at
  before update on work
  for each row execute function set_updated_at();

create unique index uq_work_public_id on work (public_id);
create index idx_work_parent_work_id on work (parent_work_id);

comment on table work is
  'Implements: Entity Catalog — Work (Phase 4). work_type and work_relationship '
  'values are the Content Taxonomy (Phase 3) categories fixed as concrete check constraints.';
