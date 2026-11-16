-- Implements: Entity Catalog, Relationship Model (Phase 4) — Organization.
-- "Any institution or official body linked to content." No FK dependencies
-- of its own; Award and Project reference it (later migrations).

create table organization (
  id                    uuid primary key default gen_random_uuid(),
  public_id             text not null,

  name_ar               text not null,
  name_en               text not null,
  description_ar        text,
  description_en        text,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_organization_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_organization_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_organization_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived'))
);

create trigger trg_organization_set_updated_at
  before update on organization
  for each row execute function set_updated_at();

create unique index uq_organization_public_id on organization (public_id);

comment on table organization is
  'Implements: Entity Catalog — Organization (Phase 4). public_id is the Public ID '
  'per Identifier Strategy (Phase 4); id (uuid) is both Internal ID and Permanent ID.';
