# AHR Platform v1 — Database Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Source of truth superseded into this document:** Data Foundation Conventions (Milestone 2, Locked), AHR Platform v1 Database Architecture (Frozen v1)
**Engine:** PostgreSQL via Supabase. No ORM abstraction beyond Supabase's generated types — every package that touches Archive tables imports `packages/database`'s generated types.

This document is the schema-level reference. Enforcement mechanics (RLS as a security control, defense in depth) are detailed in `10-Security.md`; this document specifies *what* the policies are, not *why*.

---

## 1. Schema Organization

All v1 tables live in the default `public` Postgres schema. AHR has one live product (Archive) at this stage; multiple schemas are introduced only if/when Academy or Creative Network need true cross-module query isolation — that decision is made when those modules are actually planned, not reserved speculatively now.

## 2. Complete Table List (28 tables)

**Amendment note (2026-07-21):** Tables #18–#21 were added after this document's original freeze, via the Database Architecture Review Round process this document's own §7 (Known Limitations) anticipated — approved by the data owner (Decision Log, items E3, E4, E5), not a silent schema drift. Tables #1–17 are unchanged from the original frozen baseline, except `organization` (#1), which gained two new columns (`contact_information`, `internal_notes`) and `media_asset` (#10), which gained a fifth valid owner column (`organization_id`) — both via the same E5 activation.

**Amendment note (2026-07-24/25):** Tables #22–#25 were added directly at the data owner's request (not a formal Review Round, but the same "explicitly approved, not silent drift" posture) — `media_library` (2026-07-24, a deliberately separate, ownerless asset system — see `packages/media-library/README.md` for why it does not extend `media_asset`), `entity_hard_delete_log` (2026-07-25, backs the "Delete Permanently" capability — a deliberate, informed departure from the platform's "No Hard Delete, ever, for a published entity" default), and `external_platform`/`entity_external_link` (2026-07-25, the reusable external-platforms system — see §2a below for why their column set deliberately differs from §4's table).

| # | Table | Purpose |
|---|---|---|
| 1 | `organization` | Institutions / official bodies. **Amended 2026-07-21:** added `contact_information` (jsonb) and `internal_notes` |
| 2 | `person` | Every individual in the ecosystem |
| 3 | `work` | Completed creative units (self-referencing via `parent_work_id` for compound works) |
| 4 | `project` | Ongoing activities |
| 5 | `event` | Dated/located activities |
| 6 | `contribution` | Person ↔ Work/Project/Event link (at least one target enforced by `check`) |
| 7 | `award` | Prizes/honors/memberships (requires `organization_id`) |
| 8 | `category` | Hierarchical classification, self-referencing, domain-scoped |
| 9 | `tag` | Free descriptive labels, non-hierarchical |
| 10 | `media_asset` | Images/audio/video, polymorphic subject. **Amended 2026-07-21:** `organization_id` added as a fifth valid owner alongside work/person/project/event (exactly one still enforced) |
| 11 | `press_mention` | External press coverage, polymorphic subject (exactly one enforced) |
| 12 | `work_category`, `work_tag`, `project_category`, `project_tag` | Taxonomy join tables (composite PK, no audit columns) |
| 13 | `entity_state_transition` | Shared, append-only content lifecycle history log |
| 14 | `platform_user` | Bridges `auth.users` to `person`; carries `role` |
| 15 | `moderation_report` | Moderation workflow storage (report → review → escalate → resolve) |
| 16 | `platform_settings` | Global key-value configuration, no schema change needed to add a setting |
| 17 | `activity_log` | Append-only actor-action audit trail, distinct from `entity_state_transition` |
| 18 | `ai_recommendation_log` | **Added 2026-07-21.** Durable record of every AI suggestion generated and its accepted/edited/rejected outcome — see `docs/API/API-Specification/07 - AI API.md` |
| 19 | `notification` | **Added 2026-07-21.** Per-recipient notification inbox (read/unread) — distinct from `activity_log` (actor audit trail) and from live-derived indicators like the Moderation Badge. See `docs/API/API-Specification/11 - Notifications API.md` |
| 20 | `organization_category` | **Added 2026-07-21.** Organization ↔ Category, same shape as `work_category`/`project_category` |
| 21 | `organization_tag` | **Added 2026-07-21.** Organization ↔ Tag, same shape as `work_tag`/`project_tag` |
| 22 | `media_library` | **Added 2026-07-24.** General-purpose, reusable, ownerless design/UI asset library — deliberately separate from `media_asset`'s entity-owned model. See `packages/media-library/README.md` |
| 23 | `entity_hard_delete_log` | **Added 2026-07-25.** Append-only pre-delete snapshot log backing the "Delete Permanently" capability, available on every table |
| 24 | `external_platform` | **Added 2026-07-25.** Catalog of external platforms (social/streaming/etc.) an entity can link out to. `category` is free text, no check constraint — see §2a |
| 25 | `entity_external_link` | **Added 2026-07-25.** Links a Person/Organization/Project/Work (exactly one, polymorphic like `media_asset`/`press_mention`) to one `external_platform` row |

## 2a. Deliberately Minimal Tables — `external_platform` / `entity_external_link`

These two tables intentionally do **not** carry §4's full audit-column set (`status`/`visibility`/`verification_status`/`source`/`owner_id`) — a data-owner decision, not an oversight, following the precedent `platform_settings` already established for reference/lookup data with no editorial workflow of its own:

- `external_platform`: `is_active` (not `status`/`visibility`) governs whether a platform is offered; `created_by`/`updated_by` are nullable (the seeded catalog rows have no real admin actor, same reasoning `platform_settings` documents for its own seed rows).
- `entity_external_link`: `is_visible` (not `visibility`) governs public readability, gated additionally on the owning entity's own `published`+`public` state (RLS); `created_by`/`updated_by` are `not null` here, since every row is a real CMS action, never seeded.
- `entity_external_link`'s exactly-one-owner pattern (`person_id`/`organization_id`/`project_id`/`work_id`, `chk_entity_external_link_owner_present`) is the same "polymorphic, exactly one owner" idiom `media_asset` and `press_mention` already use — not a new pattern. §5 below explains why the alternative (a generic `entity_type`/`entity_id` pair with no real FK) was rejected here too.

## 3. Entity Relationship Overview

```
auth.users (Supabase-managed) ──1:1── platform_user ──1:1── person
                                                              │
                        ┌───────────────┬──────────┬─────────┼─────────┐
                        ▼               ▼          ▼         ▼         ▼
                  contribution        award   media_asset  press_mention
                        │               │          │            │
              ┌─────────┼─────────┐     ▼          (polymorphic, exactly one owner/subject)
              ▼         ▼         ▼  organization
            work    project    event
              │
      parent_work_id (self, optional)

work  ── work_category/work_tag ──── category / tag
project ── project_category/project_tag ── category / tag

person / organization / project / work ── entity_external_link ── external_platform
  (polymorphic, exactly one of person_id/organization_id/project_id/work_id — same
   idiom as media_asset/press_mention, see §2a)

entity_state_transition / moderation_report / activity_log / entity_hard_delete_log:
  reference (entity_table, entity_id) generically — no real FK (see §5)
```

Full cardinality table and diagram: see `AHR-Platform-v1-Database-Architecture.md` (project reference); unchanged and not repeated field-by-field here to avoid duplication.

## 4. Structural Conventions (Apply to Every Table)

| Convention | Rule |
|---|---|
| Naming | `snake_case`, singular table names matching the entity exactly (`media_asset`, `press_mention` renamed from Entity Catalog names for clarity) |
| Primary key | Single column `id uuid primary key default gen_random_uuid()` — no composite PKs, no integer PKs, except `platform_settings.key` (`text`, human-chosen) and `platform_user.id` (set equal to `auth.users.id`, not independently generated) |
| Timestamps | `timestamptz` only, never bare `timestamp` |
| Audit columns | Every content table carries `created_at`, `updated_at` (shared `set_updated_at()` trigger), `created_by`, `updated_by`, `owner_id`, `status`, `visibility`, `verification_status`, `source` |
| Foreign keys | Named `<referenced_table>_id`; `ON DELETE RESTRICT` by default, no exceptions in v1 |
| Indexing | Every foreign key indexed; naming `idx_<table>_<column>` / `uq_<table>_<column>` / `fk_<table>_<referenced_table>` / `chk_<table>_<column>` |

## 5. Why Three Tables Have No Real Foreign Key to Their Subject

`entity_state_transition`, `moderation_report`, and `activity_log` reference `(entity_table text, entity_id uuid)` as plain columns, not a real foreign key. This is deliberate and narrow: these three tables must be able to reference **any** current or future table — including Release 2 entities that don't exist yet — without a schema change per new entity type. Every other polymorphic case (`media_asset`, `press_mention`) uses real, enforced foreign keys because their ownership required database-level enforcement. Application code is responsible for validating `entity_table` against a known allow-list for these three tables only; this is not a precedent for the rest of the schema.

## 6. Status, Visibility, Verification — Enumeration Rules

| Field | Allowed values | Enforcement |
|---|---|---|
| `status` | `draft → review → verified → published → archived` (one restore path: `archived → published`) | `check` constraint, no table-specific divergence |
| `visibility` | `public`, `restricted`, `hidden` | `check` constraint |
| `verification_status` | `verified`, `self_reported`, `pending`, `archived` | `check` constraint; **no enforced transition sequence** — any value may be set directly, unlike `status` |

`status` and `role` are kept as constrained `text`, not native Postgres `enum` types, so adding a new intermediate value later is a one-line constraint change, not a type migration.

## 7. Soft Delete / Archive Policy

No `deleted_at` column and no hard-delete path exists for any table, anywhere. Removal from public view is exclusively `status = 'archived'` — a fully queryable, restorable state, never a staging step toward physical deletion. Physical row deletion is permitted **only** for rows that never left `status = 'draft'` and were entered in error. This applies identically to `platform_user` and `moderation_report`.

## 8. Authentication Model (Schema Boundary Only)

Authentication itself is entirely Supabase Auth's responsibility (`auth.users`); this schema's involvement begins at `platform_user`, the bridge row linking a Supabase identity to a `person`. No password, email, or credential field exists anywhere in this schema. Full session-resolution mechanics are documented in `08-Authentication-and-Authorization.md`.

## 9. Roles (Schema Boundary Only)

`platform_user.role` is a single `text` column constrained to the values valid **today**: `'administrator'` only. `trainer`, `student`, `creative_member` are reserved names for Release 2, not active in v1. Full permission semantics: `08-Authentication-and-Authorization.md`.

## 10. Row Level Security — Policy Summary

RLS is enabled on every table, no exceptions. Two policy families cover v1:

| Policy | Applies to | Rule |
|---|---|---|
| Public read | Every content table | `status = 'published' AND visibility = 'public'` |
| Administrator full access | Every table | Full read/write, gated on `platform_user.role = 'administrator'` |

Additional constraints:
- `entity_state_transition`, `moderation_report`, `activity_log` — **no direct client insert/update policy**; written only by server-side code.
- `platform_settings` — selective public read (most keys public; `ai_configuration`/`email_configuration` administrator-only read); write is administrator-only for every key.
- `activity_log` — read is administrator-only (not public).
- Migration scripts run under the Supabase service role, bypassing RLS — the one sanctioned exception, server-side and non-request-driven only.

Full RLS-as-a-security-control rationale (defense in depth, least privilege): `10-Security.md`.

## 11. Media Storage Structure

`media_asset.storage_path` points into Supabase Storage, not a Postgres blob:

```
Bucket: media
  /{entity_table}/{entity_id}/{asset_id}.{ext}
```

One bucket for v1. Path is keyed by `entity_table`/`entity_id`, never by slug — a slug edit must never move or break a file. Public objects are served directly; restricted/hidden objects only via signed URL. Full upload/replace rules: `05-CMS.md` (Media Library) and `10-Security.md`.

### 11.1 Media Versioning — Design Intent Only (Not Built in v1)

`media_asset` is the current-version pointer today (one row, one `storage_path`). The seam for history is already accounted for and requires no redesign when built: a future `media_asset_version` table (`id`, `media_asset_id` FK, `storage_path`, `version_number`, `created_at/by`, `replaced_at`) follows the same append-only pattern as `entity_state_transition`. `media_asset.id` never changes across replacements, so anything referencing "this logical asset" stays stable.

## 12. Indexing Strategy

Every foreign key across all 24 tables is indexed, with no exception. Additional purpose-built indexes:

| Index | Table | Purpose |
|---|---|---|
| `uq_platform_user_person_id` | `platform_user` | Enforces 1:1 Person↔User |
| `idx_moderation_report_entity` | `moderation_report` | `(entity_table, entity_id)` lookup |
| `idx_moderation_report_status` | `moderation_report` | "Show me open reports" |
| `idx_activity_log_actor_id` | `activity_log` | "Show me this actor's history" |
| `idx_activity_log_entity` | `activity_log` | `(entity_type, entity_id)` lookup |
| `idx_activity_log_created_at` | `activity_log` | Chronological pagination |
| GIN over generated `tsvector` (reserved) | `person`, `work`, `project`, `event`, `organization` | Full-text search readiness (see §14) |

## 13. Migration Strategy (Schema-Level)

1. Numbered, sequential migration files in `packages/database/migrations/`, applied strictly in filename order; never edited after shipping.
2. Every migration is additive and reversible — no migration drops a column or table that has already shipped to production; corrections ship as a new migration.
3. New tables are ordered so foreign-key dependencies exist first (e.g., `platform_user` before `moderation_report`).
4. Legacy data migration (populating rows, not schema) runs only after every schema migration for the tables it populates already exists — covered operationally in `13-Deployment-and-DevOps.md`.

## 14. Search Readiness (Schema-Level Only)

Every bilingual text column (`name_ar`/`name_en`, `title_ar`/`title_en`, `bio_ar`/`bio_en`, `description_ar`/`description_en`) is plain `text`, compatible with Postgres `tsvector`/`tsquery` without a type change. Five entities are the reserved primary search targets: `person`, `work`, `project`, `event`, `organization`. `award`, `media_asset`, `press_mention`, `category`, `tag` are discoverable *through* those five, not independently indexed. Actual search implementation (currently `ILIKE`-based, not full-text-index-based): `07-API.md` and `11-Performance.md`.

A future `pgvector`-based `search_embedding vector(n)` column is a pure additive column on any of the five tables, populated through the same AI provider abstraction — not built in v1.

**Update 2026-07-22:** `work.search_embedding vector(1536)` (OpenAI `text-embedding-3-small`) was added — Phase 2 AI backlog item 4, approved by the data owner, `packages/database/migrations/20260722120000_work_search_embedding.sql`. Scope is deliberately narrow: `work` only, admin-only similar/duplicate-Work detection (`POST /api/ai/similar-works`), generated only on explicit Administrator request per §7's "no automatic/background AI calls" boundary — not the public-facing semantic search described in this section, which remains not built (Phase 2 AI backlog item 6, reuses this same column/infrastructure when it ships).

## 15. Forward Compatibility With Release 2 (Compatibility Check Only)

- `person` is already the shared identity anchor for any future module.
- `platform_user.role`'s narrow `check` constraint (not a native enum) means new roles are additive.
- `entity_state_transition`/`moderation_report`/`activity_log`'s generic `(entity_table, entity_id)` referencing gives any future entity history/moderation/audit for free.
- `category.domain` is already namespaced — a new domain value (e.g. a future `course_type`) is a value addition, not a new table.
- No v1 table holds a foreign key into a table that doesn't exist yet.

## Backlog (Explicit — Not Implemented in v1)

| Item | Why deferred |
|---|---|
| `media_asset_version` table | No version-history requirement in v1 scope |
| ~~`ai_recommendation_log` table~~ | ✅ **Added 2026-07-21** — see §2, table #18 |
| Native Postgres `enum` types for `status`/`role` | `text` + `check` keeps adding values low-friction during early evolution; revisit only if constraint maintenance becomes a real burden |
| ~~`pgvector` semantic search columns~~ | ✅ **Partially added 2026-07-22** — `work.search_embedding` only (see §14 update), for admin-only duplicate detection. Public-facing semantic search across all five reserved search targets is still deferred — no requirement in v1 |
| Additional Postgres schemas (multi-schema separation) | No cross-module isolation requirement exists until Academy/Creative Network are actually planned |

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Entity Catalog, Relationship Model, Data Integrity Rules, Metadata Model, Identifier Strategy, Archive Model, Data Lifecycle (Phase 4); Ownership Rules, Verification/Moderation Logic (Phase 6); Data Foundation Conventions (Locked); AHR Platform v1 Database Architecture (Frozen v1)
