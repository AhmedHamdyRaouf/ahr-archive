-- Implements: new capability requested directly by the data owner
-- 2026-07-24 — a general-purpose, reusable Media Library, distinct from
-- `media_asset` (Milestone 6). `media_asset` is frozen v1, governed,
-- entity-owned content media: every row is provenance-tied to exactly one
-- Person/Work/Project/Event/Organization via chk_media_asset_owner_present
-- (see packages/media/docs/blocked-metadata.md §1 — "a single asset
-- reusable across multiple entities" is explicitly BLOCKED there, pending
-- a Database Architecture Review Round).
--
-- `media_library` is deliberately NOT an attempt to lift that block. It is
-- a separate, additive table for a different responsibility: ungoverned,
-- reusable design/UI assets (hero banners, decorative photography, icons)
-- used across static pages, never tied to a single content entity's
-- provenance. It does not touch `media_asset`, its constraints, or its
-- package in any way.
--
-- Still follows every other locked Data Foundation Convention exactly
-- (Database Architecture Overview / CLAUDE.md "Database conventions"):
-- shared id/created_at/updated_at shape, the one fixed status sequence,
-- the shared audit columns, snake_case naming, RLS enabled with no
-- exception. No table-specific status values were invented.

create table media_library (
  id                    uuid primary key default gen_random_uuid(),

  -- Stable, human-chosen lookup key (e.g. "home-hero-banner") — distinct
  -- from `id`: callers elsewhere in the platform reference an asset by
  -- this key so the underlying image can be swapped without touching the
  -- referencing page's code.
  image_key             text not null,

  title_ar              text,
  title_en              text,
  alt_text_ar            text,
  alt_text_en            text,
  caption_ar            text,
  caption_en            text,

  -- Bucket-relative path, mirroring media_asset.storage_path — the public/
  -- signed access URL is resolved at read time (never persisted), same
  -- convention as @ahr/media's getMediaAccessUrl.
  storage_path          text not null,
  width                 integer,
  height                integer,
  tags                  text[] not null default '{}'::text[],

  status                text not null default 'draft',
  visibility            text not null default 'hidden',
  verification_status   text not null default 'pending',
  source                text,

  owner_id              uuid,
  created_by            uuid not null,
  updated_by            uuid not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint chk_media_library_status
    check (status in ('draft', 'review', 'verified', 'published', 'archived')),
  constraint chk_media_library_visibility
    check (visibility in ('public', 'restricted', 'hidden')),
  constraint chk_media_library_verification_status
    check (verification_status in ('verified', 'self_reported', 'pending', 'archived'))
);

create trigger trg_media_library_set_updated_at
  before update on media_library
  for each row execute function set_updated_at();

create unique index uq_media_library_image_key on media_library (image_key);
create index idx_media_library_tags on media_library using gin (tags);

comment on table media_library is
  'General-purpose, reusable design/UI asset library — deliberately separate from '
  'media_asset (which stays entity-owned/governed). Added 2026-07-24 at the data owner''s '
  'request; see packages/media-library/README.md.';

-- RLS — added in this same migration (the consolidated RLS migration
-- 20260719120000 is historical); same "standard content table" shape used
-- there and for every table added since (e.g. ai_recommendation_log):
-- public read (published+public) + administrator full access.

alter table media_library enable row level security;

create policy media_library_public_read on media_library
  for select
  using (status = 'published' and visibility = 'public');

create policy media_library_admin_all on media_library
  for all
  using (is_administrator())
  with check (is_administrator());
