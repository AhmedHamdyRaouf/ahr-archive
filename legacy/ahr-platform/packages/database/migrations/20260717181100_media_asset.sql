-- Implements: Entity Catalog, Data Integrity Rules (Phase 4) — Media.
-- "Any visual or audio file." Enforces "Media always belongs to another
-- entity" via four nullable FK columns plus chk_media_asset_owner_present,
-- requiring exactly one to be set. A generic entity_type/entity_id
-- polymorphic pair was deliberately rejected: it cannot be enforced by a
-- real foreign key at the database level, which this table's governing
-- rule requires (Data Foundation Conventions §9).

create table media_asset (
  id                    uuid primary key default gen_random_uuid(),

  media_type            text not null,
  storage_path          text not null,
  caption_ar            text,
  caption_en            text,

  work_id               uuid references work (id) on delete restrict,
  person_id             uuid references person (id) on delete restrict,
  project_id            uuid references project (id) on delete restrict,
  event_id              uuid references event (id) on delete restrict,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_media_asset_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_media_asset_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_media_asset_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived')),
  constraint chk_media_asset_type
    check (media_type in ('image', 'audio', 'video')),
  constraint chk_media_asset_owner_present
    check (
      (case when work_id    is not null then 1 else 0 end) +
      (case when person_id  is not null then 1 else 0 end) +
      (case when project_id is not null then 1 else 0 end) +
      (case when event_id   is not null then 1 else 0 end) = 1
    )
);

create trigger trg_media_asset_set_updated_at
  before update on media_asset
  for each row execute function set_updated_at();

create index idx_media_asset_work_id on media_asset (work_id);
create index idx_media_asset_person_id on media_asset (person_id);
create index idx_media_asset_project_id on media_asset (project_id);
create index idx_media_asset_event_id on media_asset (event_id);

comment on table media_asset is
  'Implements: Entity Catalog, Data Integrity Rules (Phase 4) — Media (renamed '
  'media_asset per Data Foundation Conventions §2). Exactly one of work_id/'
  'person_id/project_id/event_id must be set — enforced by chk_media_asset_owner_present.';
