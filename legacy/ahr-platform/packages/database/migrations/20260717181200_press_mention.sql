-- Implements: Entity Catalog, Data Integrity Rules (Phase 4) — Press.
-- "Any external press/media coverage." Same polymorphic-subject pattern as
-- media_asset: exactly one of person_id/work_id/event_id/organization_id
-- identifies what the coverage is about. publication_name is free text
-- because the outlet publishing the coverage is usually external and not
-- itself a modeled Organization row (it is not "another entity AHR owns").

create table press_mention (
  id                    uuid primary key default gen_random_uuid(),

  title_ar              text,
  title_en              text,
  publication_name      text not null,
  url                   text,
  published_date        date,

  person_id             uuid references person (id) on delete restrict,
  work_id               uuid references work (id) on delete restrict,
  event_id              uuid references event (id) on delete restrict,
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

  constraint chk_press_mention_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_press_mention_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_press_mention_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived')),
  constraint chk_press_mention_subject_present
    check (
      (case when person_id       is not null then 1 else 0 end) +
      (case when work_id         is not null then 1 else 0 end) +
      (case when event_id        is not null then 1 else 0 end) +
      (case when organization_id is not null then 1 else 0 end) = 1
    )
);

create trigger trg_press_mention_set_updated_at
  before update on press_mention
  for each row execute function set_updated_at();

create index idx_press_mention_person_id on press_mention (person_id);
create index idx_press_mention_work_id on press_mention (work_id);
create index idx_press_mention_event_id on press_mention (event_id);
create index idx_press_mention_organization_id on press_mention (organization_id);

comment on table press_mention is
  'Implements: Entity Catalog, Data Integrity Rules (Phase 4) — Press (renamed '
  'press_mention per Data Foundation Conventions §2). Exactly one subject FK must be set.';
