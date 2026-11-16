-- Implements: Database Architecture (Frozen v1) §2.3 — platform_settings.
-- Key-value, not one column per setting, so the Admin Dashboard (Package 05/07)
-- can introduce a new setting without any migration — same extensibility
-- principle already used for `status`/`role`.
--
-- No created_at/created_by: settings are seeded once (migration/seed data) and
-- thereafter only ever updated, never individually "created" by a user
-- (Database Architecture §2.3).

create table platform_settings (
  key           text primary key,
  value         jsonb not null,
  description   text,

  updated_at    timestamptz not null default now(),
  updated_by    uuid
);

create trigger trg_platform_settings_set_updated_at
  before update on platform_settings
  for each row execute function set_updated_at();

comment on table platform_settings is
  'Implements: Database Architecture (Frozen v1) §2.3. Key-value global configuration. '
  'One row per setting key, not one row per setting category.';

-- Seed the setting keys named explicitly in Database Architecture §2.3 and the
-- Packages Specification (Package 07), with safe, empty/neutral defaults.
-- These are placeholders only — no real site content, contact info, or
-- credentials are set here.
insert into platform_settings (key, value, description) values
  ('site_name', '""'::jsonb, 'Public site name'),
  ('site_description', '""'::jsonb, 'Public site description'),
  ('default_language', '"ar"'::jsonb, 'Default locale for visitors with no preference'),
  ('default_time_zone', '"Africa/Cairo"'::jsonb, 'Default time zone for displaying dates'),
  ('contact_information', '{}'::jsonb, 'Public contact details (email, phone, address)'),
  ('social_media_links', '{}'::jsonb, 'Public social media profile links'),
  ('seo_defaults', '{}'::jsonb, 'Default meta title/description for pages without their own'),
  ('maintenance_mode', 'false'::jsonb, 'When true, the public site shows a maintenance message'),
  ('ai_configuration', '{}'::jsonb, 'Administrator-only: AI provider configuration (Database Architecture §8 — never publicly readable)'),
  ('email_configuration', '{}'::jsonb, 'Administrator-only: outbound email configuration (Database Architecture §8 — never publicly readable)'),
  ('branding_assets', '{}'::jsonb, 'Logo/branding asset references (values pending Blocking Issue B10)'),
  ('feature_flags', '{}'::jsonb, 'Feature flag toggles');
