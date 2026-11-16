-- Implements: Database Architecture Review Round item E3 (Gap Analysis &
-- Remaining Work Report) — activation decision approved by the data owner
-- 2026-07-21 (see docs/Program-Status/Decision-Log.md). Previously,
-- 14-AI-Integration.md §5/§8 documented this table as a known, deliberate
-- gap: every AI suggestion was ephemeral (returned to the caller, never
-- persisted), logged only to the technical/operational console stream
-- (packages/ai/src/suggestion-service.ts's consoleAiCallLogger). This
-- migration adds the real table so a suggestion's full lifecycle —
-- generated, and later accepted/edited/rejected by an Administrator — has
-- a durable record, without changing anything about how a suggestion
-- itself is generated (packages/ai is unchanged; it still has no database
-- access of its own, per its own documented design).
--
-- Added after the single consolidated RLS migration
-- (20260719120000_row_level_security.sql) already ran — unlike every
-- table created before that point, this table enables RLS and defines
-- its own policies in this same migration, since there is no later
-- "add more tables to the one RLS migration" step once that migration is
-- historical. This is the correct pattern for any future new table too.

create table ai_recommendation_log (
  id                  uuid primary key default gen_random_uuid(),

  entity_type         text not null,
  entity_id           uuid not null,
  kind                text not null,
  suggested_content   jsonb not null,
  rationale           text,
  confidence_level    text not null,
  provider            text not null default 'openai',

  -- 'pending' the moment a suggestion is generated; moves to exactly one
  -- of the other three once the Administrator acts on it (or never, if
  -- they navigate away without deciding -- a 'pending' row is not an
  -- error, it simply means no decision was recorded).
  outcome             text not null default 'pending',
  actor_id            uuid references platform_user (id) on delete restrict,

  created_at          timestamptz not null default now(),
  resolved_at         timestamptz,

  constraint chk_ai_recommendation_log_entity_type
    check (entity_type in ('work', 'project')),
  constraint chk_ai_recommendation_log_kind
    check (kind in ('category-tag-suggestion', 'summary-suggestion')),
  constraint chk_ai_recommendation_log_confidence
    check (confidence_level in ('low', 'medium', 'high')),
  constraint chk_ai_recommendation_log_outcome
    check (outcome in ('pending', 'accepted', 'edited', 'rejected'))
);

create index idx_ai_recommendation_log_entity on ai_recommendation_log (entity_type, entity_id);
create index idx_ai_recommendation_log_actor_id on ai_recommendation_log (actor_id);
create index idx_ai_recommendation_log_created_at on ai_recommendation_log (created_at);

comment on table ai_recommendation_log is
  'Implements: Database Architecture Review Round item E3 (activated 2026-07-21). '
  'Durable record of every AI suggestion generated and its eventual accepted/edited/rejected outcome.';

-- RLS: same append-only-audit shape as activity_log (admin read, admin
-- insert) PLUS an admin-only update policy restricted to exactly the two
-- columns a later "resolve" call is allowed to change (outcome,
-- resolved_at) -- enforced at the application layer (the resolve Route
-- Handler only ever sets those two columns), since column-level RLS
-- restriction is unnecessary complexity for a table only Administrators
-- can reach at all.

alter table ai_recommendation_log enable row level security;

create policy ai_recommendation_log_admin_read on ai_recommendation_log
  for select
  using (is_administrator());

create policy ai_recommendation_log_admin_insert on ai_recommendation_log
  for insert
  with check (is_administrator());

create policy ai_recommendation_log_admin_update on ai_recommendation_log
  for update
  using (is_administrator())
  with check (is_administrator());
