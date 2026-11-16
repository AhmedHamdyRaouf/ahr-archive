-- Implements: data owner request, 2026-07-25 — a reusable "external
-- platforms" system (social/streaming/podcast/etc. links attachable to
-- any entity), built after an explicit architectural review confirming:
-- (1) no unified entity table exists or is planned (Database Architecture
-- Overview §5 — "not a precedent for the rest of the schema"), so this
-- follows the same "polymorphic, exactly one owner" pattern already
-- established by media_asset and press_mention; (2) category is
-- deliberately free text with no check constraint, mirroring
-- category.domain's existing precedent, so new categories (podcast,
-- marketplace, ticketing, publication, ...) are a data-population task
-- later, never a schema change; (3) deliberately minimal — no status/
-- visibility/verification_status/source/owner_id lifecycle columns (data
-- owner: "do not add ... verification ... unless required elsewhere"),
-- just the two flags (is_active/is_visible) and created_by/updated_by
-- provenance every table already carries.
--
-- Two tables:
--   external_platform     — the catalog (Facebook, Spotify, Anghami, ...)
--   entity_external_link  — an entity's link to one platform

create table external_platform (
  id             uuid primary key default gen_random_uuid(),

  name           text not null,
  slug           text not null,
  -- Free text, no check constraint (see header) — social/streaming today,
  -- podcast/marketplace/ticketing/publication/etc. later without a migration.
  category       text not null,
  icon           text,
  website        text,
  display_order  integer not null default 0,
  is_active      boolean not null default true,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- Nullable (unlike entity_external_link's, and unlike most content
  -- tables' created_by/updated_by) — same reasoning platform_settings
  -- already documents: the platforms seeded below aren't "created" by any
  -- real admin action, only later edits are (Database Architecture §2.3
  -- precedent). Real CMS-driven creates still stamp both from the actor's
  -- session, same as everywhere else.
  created_by     uuid,
  updated_by     uuid
);

create trigger trg_external_platform_set_updated_at
  before update on external_platform
  for each row execute function set_updated_at();

create unique index uq_external_platform_slug on external_platform (slug);
create index idx_external_platform_category on external_platform (category);

comment on table external_platform is
  'Implements: data owner request 2026-07-25 — catalog of external platforms '
  '(social/streaming/podcast/etc.) that entities can link out to. category is '
  'free text (no check constraint) so new categories never require a migration.';

-- ---------------------------------------------------------------------------

create table entity_external_link (
  id                uuid primary key default gen_random_uuid(),

  platform_id       uuid not null references external_platform (id) on delete restrict,

  -- Exactly one of these four must be set (chk_entity_external_link_owner_present
  -- below) — the same "polymorphic, exactly one owner" pattern already used by
  -- media_asset/press_mention (Database Architecture Overview §3/§5), not a new
  -- one invented here. CASCADE (not the schema-wide default RESTRICT) is
  -- deliberate: a link row has no independent lifecycle apart from the entity
  -- it belongs to (Data Foundation Conventions' one documented cascade
  -- exception — "denormalized tables with no independent lifecycle").
  person_id         uuid references person (id) on delete cascade,
  organization_id   uuid references organization (id) on delete cascade,
  project_id        uuid references project (id) on delete cascade,
  work_id           uuid references work (id) on delete cascade,

  url               text not null,
  display_order     integer not null default 0,
  is_visible        boolean not null default true,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid not null,
  updated_by        uuid not null,

  constraint chk_entity_external_link_owner_present
    check (
      (case when person_id       is not null then 1 else 0 end) +
      (case when organization_id is not null then 1 else 0 end) +
      (case when project_id      is not null then 1 else 0 end) +
      (case when work_id         is not null then 1 else 0 end) = 1
    )
);

create trigger trg_entity_external_link_set_updated_at
  before update on entity_external_link
  for each row execute function set_updated_at();

-- One FK-indexed lookup for "who links to this platform" (reverse lookup).
-- The four partial unique indexes below already index each owner column
-- for its own primary access pattern ("this entity's links").
create index idx_entity_external_link_platform_id on entity_external_link (platform_id);

-- Prevent duplicate platform assignments for the same entity — partial
-- (one per owner type, since only one owner column is ever non-null per row).
create unique index uq_entity_external_link_person
  on entity_external_link (person_id, platform_id) where person_id is not null;
create unique index uq_entity_external_link_organization
  on entity_external_link (organization_id, platform_id) where organization_id is not null;
create unique index uq_entity_external_link_project
  on entity_external_link (project_id, platform_id) where project_id is not null;
create unique index uq_entity_external_link_work
  on entity_external_link (work_id, platform_id) where work_id is not null;

comment on table entity_external_link is
  'Implements: data owner request 2026-07-25 — links an entity (Person/Organization/'
  'Project/Work; exactly one of the four owner columns set, enforced by '
  'chk_entity_external_link_owner_present) to one row in external_platform.';

-- ---------------------------------------------------------------------------
-- RLS — added in this same migration (the consolidated RLS migration
-- 20260719120000 is historical), matching the pattern every table added
-- since has followed.
-- ---------------------------------------------------------------------------

alter table external_platform enable row level security;

create policy external_platform_public_read on external_platform
  for select
  using (is_active = true);

create policy external_platform_admin_all on external_platform
  for all
  using (is_administrator())
  with check (is_administrator());

alter table entity_external_link enable row level security;

-- Public readability follows the owning entity's own publication state —
-- same rule work_category/work_tag/organization_category already apply
-- for their owning Work/Project/Organization row.
create policy entity_external_link_public_read on entity_external_link
  for select
  using (
    is_visible = true
    and (
      exists (
        select 1 from person
        where person.id = entity_external_link.person_id
          and person.status = 'published' and person.visibility = 'public'
      )
      or exists (
        select 1 from organization
        where organization.id = entity_external_link.organization_id
          and organization.status = 'published' and organization.visibility = 'public'
      )
      or exists (
        select 1 from project
        where project.id = entity_external_link.project_id
          and project.status = 'published' and project.visibility = 'public'
      )
      or exists (
        select 1 from work
        where work.id = entity_external_link.work_id
          and work.status = 'published' and work.visibility = 'public'
      )
    )
  );

create policy entity_external_link_admin_all on entity_external_link
  for all
  using (is_administrator())
  with check (is_administrator());

-- ---------------------------------------------------------------------------
-- Seed data — major platforms, per data owner's explicit list. Slugs are
-- the primary human-stable identifier the CMS/other code looks these up
-- by later. created_by/updated_by intentionally left NULL (see column
-- comment above).
-- ---------------------------------------------------------------------------

insert into external_platform (name, slug, category, display_order) values
  ('Facebook',      'facebook',      'social',    1),
  ('Instagram',     'instagram',     'social',    2),
  ('TikTok',        'tiktok',        'social',    3),
  ('X',              'x',            'social',    4),
  ('LinkedIn',      'linkedin',      'social',    5),
  ('YouTube',       'youtube',       'social',    6),
  ('Threads',       'threads',       'social',    7),
  ('Snapchat',      'snapchat',      'social',    8),
  ('Spotify',       'spotify',       'streaming', 9),
  ('Apple Music',   'apple-music',   'streaming', 10),
  ('Anghami',       'anghami',       'streaming', 11),
  ('YouTube Music', 'youtube-music', 'streaming', 12),
  ('Deezer',        'deezer',        'streaming', 13),
  ('SoundCloud',    'soundcloud',    'streaming', 14),
  ('Amazon Music',  'amazon-music',  'streaming', 15),
  ('TIDAL',         'tidal',         'streaming', 16),
  ('Pandora',       'pandora',       'streaming', 17),
  ('Audiomack',     'audiomack',     'streaming', 18),
  ('Boomplay',      'boomplay',      'streaming', 19),
  ('Napster',       'napster',       'streaming', 20),
  ('Qobuz',         'qobuz',         'streaming', 21);
