-- Implements: Entity Catalog, Content Taxonomy (Phase 3/4) — Category.
-- "Hierarchical classification." domain scopes the tree (e.g. 'work_type',
-- 'project_type') so multiple independent hierarchies can coexist in one
-- table without their parent/child chains crossing.

create table category (
  id                    uuid primary key default gen_random_uuid(),

  domain                text not null,
  name_ar               text not null,
  name_en               text not null,
  parent_id             uuid references category (id) on delete restrict,
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

  constraint chk_category_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_category_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_category_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived')),
  constraint chk_category_parent_not_self
    check (parent_id is null or parent_id <> id)
);

create trigger trg_category_set_updated_at
  before update on category
  for each row execute function set_updated_at();

create index idx_category_parent_id on category (parent_id);
create index idx_category_domain on category (domain);

comment on table category is
  'Implements: Entity Catalog — Category (Phase 4); Content Taxonomy (Phase 3).';
