-- Implements: Entity Catalog, Content Taxonomy (Phase 3/4) — Tag.
-- "Free, non-hierarchical descriptive label." Deliberately has no parent_id
-- and no domain scoping — that hierarchy/scoping distinction is exactly
-- what separates Tag from Category per Content Architecture (Phase 3).

create table tag (
  id                    uuid primary key default gen_random_uuid(),

  name_ar               text not null,
  name_en               text not null,

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_tag_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_tag_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_tag_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived'))
);

create trigger trg_tag_set_updated_at
  before update on tag
  for each row execute function set_updated_at();

create unique index uq_tag_name_en on tag (name_en);

comment on table tag is
  'Implements: Entity Catalog — Tag (Phase 4); Content Taxonomy (Phase 3).';
