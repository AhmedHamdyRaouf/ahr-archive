-- Implements: Works Page editorial rebuild (data owner spec, 2026-07-24).
-- One additive column on `work` — editorial masonry card size (Small/
-- Medium/Large) for the public Works page, set manually by an
-- Administrator per Work via the generic CMS edit screen (workDefinition's
-- `fields` list, packages/content/src/definitions/work.ts). Never system-
-- generated or randomized — the spec explicitly requires card sizes to be
-- CMS-controlled only. Defaults to 'medium' so every existing Work row
-- renders sensibly with no backfill required.

alter table work add column display_size text not null default 'medium';

alter table work add constraint chk_work_display_size
  check (display_size in ('small', 'medium', 'large'));

comment on column work.display_size is
  'Editorial masonry card size for the public Works page (Small/Medium/Large) — set manually by an Administrator per Work. Never randomly generated.';
