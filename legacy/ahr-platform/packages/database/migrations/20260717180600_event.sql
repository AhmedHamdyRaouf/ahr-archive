-- Implements: Entity Catalog, Relationship Model (Phase 4) — Event.
-- "An activity fixed at a specific date and place."

create table event (
  id                    uuid primary key default gen_random_uuid(),
  public_id             text not null,

  title_ar              text not null,
  title_en              text not null,
  event_date            date,
  location_ar           text,
  location_en           text,
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

  constraint chk_event_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_event_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_event_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived'))
);

create trigger trg_event_set_updated_at
  before update on event
  for each row execute function set_updated_at();

create unique index uq_event_public_id on event (public_id);
create index idx_event_organization_id on event (organization_id);

comment on table event is
  'Implements: Entity Catalog — Event (Phase 4).';
