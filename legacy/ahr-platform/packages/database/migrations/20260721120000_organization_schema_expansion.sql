-- Implements: Database Architecture Review Round item E5 (Gap Analysis &
-- Remaining Work Report) — activation decision approved by the data
-- owner 2026-07-21 (docs/Program-Status/Decision-Log.md). Adds exactly
-- the four capabilities that report named as blocked: contact info,
-- internal notes, media ownership, and Category/Tag assignment for
-- `organization`.
--
-- Added after the single consolidated RLS migration already ran — see
-- 20260721100000_ai_recommendation_log.sql's header comment for the
-- general pattern this migration also follows (new RLS defined inline).

-- ---------------------------------------------------------------------------
-- 1. Contact information + internal notes on `organization`
-- ---------------------------------------------------------------------------
-- `contact_information` follows the same jsonb, open-ended shape already
-- established for `platform_settings.contact_information` (Database
-- Architecture §2.3) rather than inventing rigid email/phone columns —
-- an Organization's real-world contact details vary too much (some have
-- only a phone, some only a website) for a fixed column set to fit well,
-- and this platform already has a working precedent for this exact shape.
-- `internal_notes` is distinct from the existing public `description_ar`/
-- `description_en` -- it is never shown on the public Website, only in
-- the Dashboard, matching how "internal notes" was named in the Gap
-- Analysis (distinct from the public-facing description already on file).

alter table organization
  add column contact_information jsonb not null default '{}'::jsonb,
  add column internal_notes text;

comment on column organization.contact_information is
  'Implements: Database Architecture Review Round item E5 (2026-07-21). Open-ended contact '
  'details (email, phone, address, website...) -- same jsonb shape as platform_settings.contact_information.';
comment on column organization.internal_notes is
  'Implements: Database Architecture Review Round item E5 (2026-07-21). Dashboard-only notes -- '
  'never shown on the public Website, distinct from description_ar/description_en.';

-- ---------------------------------------------------------------------------
-- 2. Organization as a valid media_asset owner
-- ---------------------------------------------------------------------------
-- Mirrors work_id/person_id/project_id/event_id exactly. The existing
-- "exactly one owner" constraint is dropped and recreated to include the
-- new column -- Postgres has no ALTER CONSTRAINT for a check expression,
-- so drop+recreate is the correct, standard approach here (the same
-- constraint name is reused so nothing else needs to reference a new name).

alter table media_asset
  add column organization_id uuid references organization (id) on delete restrict;

create index idx_media_asset_organization_id on media_asset (organization_id);

alter table media_asset drop constraint chk_media_asset_owner_present;

alter table media_asset add constraint chk_media_asset_owner_present
  check (
    (case when work_id         is not null then 1 else 0 end) +
    (case when person_id       is not null then 1 else 0 end) +
    (case when project_id      is not null then 1 else 0 end) +
    (case when event_id        is not null then 1 else 0 end) +
    (case when organization_id is not null then 1 else 0 end) = 1
  );

-- ---------------------------------------------------------------------------
-- 3. Category/Tag assignment for `organization`
-- ---------------------------------------------------------------------------
-- Exactly the same shape as work_category/work_tag/project_category/
-- project_tag (20260717181300_taxonomy_join_tables.sql). Category rows
-- with domain = 'organization_type' are a content-population task, not a
-- schema change -- `category.domain` is already a free-text column with
-- no fixed check constraint (Content Taxonomy, Phase 3/4), so no further
-- migration is needed to introduce that domain value.

create table organization_category (
  organization_id   uuid not null references organization (id) on delete restrict,
  category_id       uuid not null references category (id) on delete restrict,
  primary key (organization_id, category_id)
);

create index idx_organization_category_category_id on organization_category (category_id);

create table organization_tag (
  organization_id   uuid not null references organization (id) on delete restrict,
  tag_id            uuid not null references tag (id) on delete restrict,
  primary key (organization_id, tag_id)
);

create index idx_organization_tag_tag_id on organization_tag (tag_id);

comment on table organization_category is
  'Implements: Database Architecture Review Round item E5 (2026-07-21) -- Organization <-> Category.';
comment on table organization_tag is
  'Implements: Database Architecture Review Round item E5 (2026-07-21) -- Organization <-> Tag.';

-- RLS for the two new join tables, mirroring work_category/work_tag's
-- policies exactly (public read when the parent Organization is
-- published+public, admin full access otherwise).

alter table organization_category enable row level security;
alter table organization_tag enable row level security;

create policy organization_category_public_read on organization_category
  for select
  using (
    exists (
      select 1 from organization
      where organization.id = organization_category.organization_id
        and organization.status = 'published'
        and organization.visibility = 'public'
    )
  );

create policy organization_category_admin_all on organization_category
  for all
  using (is_administrator())
  with check (is_administrator());

create policy organization_tag_public_read on organization_tag
  for select
  using (
    exists (
      select 1 from organization
      where organization.id = organization_tag.organization_id
        and organization.status = 'published'
        and organization.visibility = 'public'
    )
  );

create policy organization_tag_admin_all on organization_tag
  for all
  using (is_administrator())
  with check (is_administrator());
