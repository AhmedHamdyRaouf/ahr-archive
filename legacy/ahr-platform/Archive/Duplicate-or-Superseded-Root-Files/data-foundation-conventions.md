# Database Data Foundation — Conventions

**Milestone:** 2 (sub-stage: Data Foundation — precedes the first migration)
**Architectural reference:** Entity Catalog, Relationship Model, Data Integrity Rules, Metadata Model, Identifier Strategy, Archive Model, Data Lifecycle (Phase 4); Ownership Rules (Phase 6)
**Status:** 🔒 Approved & Locked — official database standard for the AHR Platform. Archive entity migrations begin from this baseline.

This document fixes every structural convention once, so every table created afterward (starting with the Archive entities from Phase 4) is consistent by construction — not by discipline.

---

## 1. Schema Organization

All Archive-scope tables live in the default `public` schema for this milestone. AHR has one product (Archive) live at this stage; introducing multiple Postgres schemas now would be premature separation with no current consumer, contradicting Development Boundaries' "Minimum Governed Product" principle (Phase 9). When Academy and Creative Network are built (Phase 9: Solution Decomposition — deferred modules), each may get its own schema **if** by then they have data that must never be queried across module boundaries by mistake; that decision is made at that time, not reserved speculatively now.

## 2. Naming Conventions

- `snake_case` for every table and column name. No camelCase, no PascalCase, anywhere in the schema.
- **Table names are singular**, matching the entity name from Entity Catalog exactly: `person`, `work`, `contribution`, `project`, `organization`, `award`, `event`, `category`, `tag`.
  - Two entities are renamed for clarity because their Entity Catalog names are ambiguous as bare table names: **Media → `media_asset`**, **Press → `press_mention`**. This is a naming decision only; the entities themselves are unchanged from Phase 4.
- Singular (not plural) table names were chosen deliberately: `media` and `press` have no clean, unambiguous plural/singular distinction in English, and a single consistent rule ("table name = entity name, singular, snake_case") is easier to apply without exceptions than mixing singular and pluralized forms across the catalog.

## 3. Primary Key Strategy

Every table has a single-column primary key named `id`, of type `uuid`. No composite primary keys, no bare auto-incrementing integers as the primary identifier — this is the technical realization of **Internal ID** in Identifier Strategy (Phase 4): stable, opaque, never reused, never exposed as a sequential counter that leaks record volume.

## 4. UUID Policy

- IDs are generated **at the database level**, not the application level: `id uuid primary key default gen_random_uuid()`.
- `gen_random_uuid()` (built into Postgres via `pgcrypto`, available by default on Supabase) is the standard for this milestone. It guarantees uniqueness regardless of which service or script performs the insert — no coordination required between services (Integration Architecture, Phase 8: "no service accesses another's internal data directly").
- Time-ordered UUIDs (UUIDv7) are a candidate future optimization for index locality once available as a stable Postgres builtin; not adopted now to avoid an extra extension dependency for a single-module milestone. This is a reversible choice per Future Technical Evolution (Phase 8): the primary key type contract (`uuid`) does not change if the generation method later does.

## 5. Timestamp Conventions

- All timestamp columns are `timestamptz`, never bare `timestamp`. Every stored instant is timezone-aware; the platform's bilingual, cross-timezone audience (Navigation System, Phase 3) makes ambiguous local time unacceptable.
- Every table has:
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`, maintained by **one shared trigger function** (`set_updated_at()`, defined once in the first migration) attached to every table via `before update`. No table re-implements this logic; every table's migration only adds `create trigger ... execute function set_updated_at();` — never a copy of the function body.

## 6. Audit Columns

Every table carries the shared metadata fields defined conceptually in Metadata Model (Phase 4), realized as columns:

| Column                | Type                                                                                 | Maps to                                                                    |
| --------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `status`              | `text` (constrained via `check`, see §8)                                             | Data Lifecycle stage                                                       |
| `visibility`          | `text` (constrained via `check`: `public`, `restricted`, `hidden`)                   | Metadata Model — Visibility                                                |
| `verification_status` | `text` (constrained via `check`: `verified`, `self_reported`, `pending`, `archived`) | Metadata Model — Verification Status                                       |
| `source`              | `text`, nullable                                                                     | Metadata Model — Source                                                    |
| `owner_id`            | `uuid`, references the responsible administrator                                     | Ownership Rules (Phase 6) — every entity has exactly one accountable owner |
| `created_by`          | `uuid`, references who performed the insert                                          | Observability (Phase 8) — traceability of every change                     |
| `updated_by`          | `uuid`, references who performed the last update                                     | Observability (Phase 8)                                                    |

Every one of `status`, `visibility`, and `verification_status` is enforced with an explicit `check` constraint naming its exact allowed values (`chk_<table>_status`, `chk_<table>_visibility`, `chk_<table>_verification_status` — see §10). None of the three is left as free-form text trusting application code to send only valid values.

`owner_id`, `created_by`, and `updated_by` are deliberately separate columns: the person who happens to click "save" (`created_by`/`updated_by`) is not necessarily the person accountable for the entity's accuracy (`owner_id`), per Ownership Rules (Phase 6).

## 7. Soft Delete / Archive Strategy

**There is no `deleted_at` column and no hard-delete path for any published entity.** This is not a stylistic choice — it is the direct technical enforcement of Core Principles' "No Hard Delete" (Phase 1) and Data Lifecycle (Phase 4). Removal from public view is expressed entirely through `status = 'archived'`, never through row deletion.

**`archived` is a business lifecycle state, not a deletion mechanism.** An archived row is still fully present, queryable, and restorable (`status` can move back to `published` — see §8); it is simply excluded from public visibility. No application code, and no future migration, may treat `status = 'archived'` as equivalent to "safe to delete" or as a staging step before physical removal.

A single shared, append-only table records every state transition for every entity, instead of a per-table history shadow table:

```
entity_state_transition (
  id            uuid primary key default gen_random_uuid(),
  entity_table  text not null,        -- e.g. 'work'
  entity_id     uuid not null,
  from_status   text,                 -- null on first insertion
  to_status     text not null,
  changed_by    uuid not null,
  changed_at    timestamptz not null default now(),
  reason        text
)
```

One shared log table (rather than N per-entity history tables) keeps Archive Model's "Historical Preservation" principle enforceable in exactly one place, consistent with "single source of truth per domain" (Technical Architecture Principles, Phase 8).

Physical row deletion is permitted **only** for rows that never left `status = 'draft'` and were entered in error — matching the exception already stated in Data Lifecycle (Phase 4).

## 8. Status Enumeration

`status` is constrained (via a `check` constraint at this stage, not yet a native Postgres `enum` type, to keep adding new intermediate statuses low-friction during early development) to the sequence approved in Data Lifecycle (Phase 4):

```
'draft' → 'review' → 'verified' → 'published' → 'archived'
```

No table-specific status values. If a future entity type needs a genuinely different lifecycle, that is an architecture-level change to Data Lifecycle (Phase 4) first, not a silent per-table divergence.

## 9. Foreign Key Conventions

- Foreign key columns are named `<referenced_table>_id` — e.g. `person_id`, `organization_id`, `work_id`.
- Default behavior is **`ON DELETE RESTRICT`** everywhere. Because published rows are never hard-deleted (§7), a restrict-by-default policy means any accidental attempt to remove a referenced row fails loudly rather than silently cascading data loss through the graph described in Relationship Model (Phase 4).
- The only exception: a table that exists purely to hold denormalized, disposable data with no independent lifecycle of its own (none exist yet in the Archive scope) may use `ON DELETE CASCADE`, and must say so explicitly in its migration comment.

## 10. Index Naming Conventions

| Object                 | Convention                      | Example                      |
| ---------------------- | ------------------------------- | ---------------------------- |
| Index                  | `idx_<table>_<column(s)>`       | `idx_contribution_person_id` |
| Unique constraint      | `uq_<table>_<column(s)>`        | `uq_person_public_id`        |
| Foreign key constraint | `fk_<table>_<referenced_table>` | `fk_contribution_person`     |
| Check constraint       | `chk_<table>_<column>`          | `chk_work_status`            |

Every foreign key column is indexed by default — an unindexed foreign key is a Scalability & Performance Architecture (Phase 8) violation waiting to happen once the Archive grows past trivial size.

## What This Document Does Not Cover

- No actual table definitions or migration files — those begin only after this document is approved.
- No business logic, no triggers implementing Business Rules (Phase 6) beyond the mechanical `updated_at` trigger described in §5.
- No `public_id` / slug generation algorithm, no `EXTERNAL_IDENTITY` / legacy-reference table structure — those are specified when the first Archive migration is written, using the primary-key and audit conventions fixed here.

---

**Status:**
🔒 Approved & Locked

**Milestone:**
Milestone 2 — Data Foundation sub-stage

**Reviewed By:**
Claude

**Approved By:**
Engineering Review

**Dependencies:**
Entity Catalog, Relationship Model, Data Integrity Rules, Metadata Model, Identifier Strategy, Archive Model, Data Lifecycle (Phase 4), Ownership Rules (Phase 6)
