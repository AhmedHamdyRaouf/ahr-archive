-- Implements: data owner request 2026-07-25 — self-service focal point
-- control for Asset Library images. `object-cover` (used everywhere
-- Asset Library images render, e.g. apps/web/components/about/asset-image.tsx)
-- center-crops by default; a fixed aspect-ratio frame can then cut off the
-- subject of a photo whose natural proportions differ from the frame. This
-- adds a per-asset crop anchor point the Administrator sets from the Asset
-- Library edit screen (click-to-set on the preview), so no code change is
-- needed per photo.

alter table media_library
  add column focal_x smallint not null default 50,
  add column focal_y smallint not null default 50;

alter table media_library
  add constraint chk_media_library_focal_x check (focal_x between 0 and 100),
  add constraint chk_media_library_focal_y check (focal_y between 0 and 100);

comment on column media_library.focal_x is
  'Horizontal crop anchor, 0-100 (% from left) — used as the CSS object-position X '
  'value wherever this asset renders inside an object-cover frame. Defaults to 50 (center).';
comment on column media_library.focal_y is
  'Vertical crop anchor, 0-100 (% from top) — used as the CSS object-position Y '
  'value wherever this asset renders inside an object-cover frame. Defaults to 50 (center).';
