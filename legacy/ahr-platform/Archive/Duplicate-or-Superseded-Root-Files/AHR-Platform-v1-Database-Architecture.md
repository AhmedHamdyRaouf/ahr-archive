# AHR Platform v1 — Database Architecture

**Status:** 🔒 **Frozen (Version 1)** — official production database blueprint
**Supersedes (for schema purposes):** Data Foundation Conventions (Milestone 2) — this document does not change those conventions, it completes the schema built on top of them.

## Engineering Decisions Assumed Per Your Instruction

These three items were open in the Final Build Manifest (B1, B3, B6). Per your instruction, they are now frozen for Version 1:

| Item | Decision |
|---|---|
| API Architecture (was B1) | Next.js Route Handlers + Server Actions. No separate backend service. |
| Bilingual Strategy (was B3) | `/ar` and `/en` path segments via Next.js App Router. |
| AI Provider (was B6) | OpenAI only for V1, behind an abstraction layer so a second provider can be added in a future release without touching call sites. |

One consequence noted up front: **bilingual routing is a routing/URL decision, not a database one.** No table below has a "locale" column or per-language rows — every bilingual entity already stores both languages as sibling columns (`title_ar`/`title_en`, etc.), fixed in Data Foundation Conventions. `/ar` and `/en` in the URL select which column the page reads, not which row.

---

## 1. Complete Entity Relationship Diagram

```
                         ┌───────────────────┐
                         │   auth.users      │  (Supabase-managed, not ours)
                         └─────────┬─────────┘
                                   │ 1:1
                         ┌─────────▼─────────┐
                         │  platform_user     │──────────┐
                         └─────────┬─────────┘           │ role
                                   │ 1:1                 │ (admin only in V1)
                         ┌─────────▼─────────┐           │
                         │      person        │◄──────────┘
                         └──┬───┬───┬───┬─────┘
             ┌──────────────┘   │   │   └───────────────┐
             │                  │   │                   │
   ┌─────────▼───────┐  ┌───────▼───┐ ┌────────▼──────┐ ┌▼──────────────┐
   │  contribution    │  │  award    │ │ media_asset   │ │ press_mention │
   └──┬────┬─────┬────┘  └─────┬─────┘ └──┬──┬──┬──┬───┘ └──┬──┬──┬──┬───┘
      │    │     │             │          │  │  │  │        │  │  │  │
      ▼    ▼     ▼             ▼          │  │  │  │        │  │  │  │
   work project event    organization◄────┘  │  │  └────────┘  │  │  │
     ▲                         ▲   ▲         │  │              │  │  │
     │ parent_work_id          │   │         └──▼──────────────▼──┘  │
     └─────(self)              │   │          project              event
                                │   └──────────────────────────────────┘
                          (award, project, event, press_mention,
                           each optionally reference organization)

   work ──┬── work_category ──── category (domain='work_type', self-referencing)
          └── work_tag ────────── tag

   project ──┬── project_category ── category (domain='project_type')
             └── project_tag ─────── tag

   entity_state_transition: generic log, references (entity_table, entity_id)
                             for ANY table above — not a foreign key, by design
                             (see §3, "Why entity_state_transition has no FK").

   moderation_report: references (entity_table, entity_id) the same way,
                      plus reported_by / assigned_to → platform_user.
```

**Cardinality summary:**

| Relationship | Cardinality |
|---|---|
| `auth.users` → `platform_user` | 1:1 |
| `platform_user` → `person` | 1:1 |
| `person` → `contribution` | 1:many |
| `contribution` → `work` / `project` / `event` | many:1 each (at least one required) |
| `work` → `work` (`parent_work_id`) | many:1 (self), optional |
| `organization` → `award` | 1:many (required) |
| `organization` → `project` / `event` / `press_mention` | 1:many (optional) |
| `person` / `work` / `project` / `event` → `media_asset` | 1:many (exactly one owner per asset) |
| `person` / `work` / `event` / `organization` → `press_mention` | 1:many (exactly one subject per mention) |
| `work` ↔ `category`, `work` ↔ `tag` | many:many (via join tables) |
| `project` ↔ `category`, `project` ↔ `tag` | many:many (via join tables) |
| `category` → `category` (`parent_id`) | many:1 (self), optional |

---

## 2. Complete Table List

| # | Table | New in this document? | Purpose |
|---|---|---|---|
| 1 | `organization` | No (Milestone 2) | Institutions/official bodies |
| 2 | `person` | No | Every individual in the ecosystem |
| 3 | `work` | No | Completed creative units |
| 4 | `project` | No | Ongoing activities |
| 5 | `event` | No | Dated/located activities |
| 6 | `contribution` | No | Person ↔ Work/Project/Event link |
| 7 | `award` | No | Prizes/honors/memberships |
| 8 | `category` | No | Hierarchical classification |
| 9 | `tag` | No | Free descriptive labels |
| 10 | `media_asset` | No | Images/audio/video |
| 11 | `press_mention` | No | External press coverage |
| 12 | `work_category`, `work_tag`, `project_category`, `project_tag` | No | Taxonomy join tables |
| 13 | `entity_state_transition` | No | Shared append-only history log |
| 14 | **`platform_user`** | **Yes** | Links `auth.users` to `person`; carries role |
| 15 | **`moderation_report`** | **Yes** | Closes Blocking Issue B2 — storage for Moderation Logic (Phase 6) |
| 16 | **`platform_settings`** | **Yes** | Global configuration the Admin Dashboard manages, never hardcoded in application code |
| 17 | **`activity_log`** | **Yes** | Append-only actor-action audit trail, distinct from `entity_state_transition` |

**20 physical tables total** for Version 1: 16 carried over from Milestone 2 (11 core entities + 4 taxonomy join tables + `entity_state_transition`), plus 4 new in this document: `platform_user`, `moderation_report`, `platform_settings`, `activity_log`.

### 2.1 `platform_user` (new)

Realizes Identity Model's (Phase 4) distinction between `Person` (always exists) and `User` (only exists if the person has platform access). One row per person who can log in.

| Column | Purpose |
|---|---|
| `id` | Primary key, uuid, **same value as** `auth.users.id` (not a new random uuid — see §5) |
| `person_id` | FK → `person.id`, not null, unique (one User per Person) |
| `role` | `text`, not null. V1 only ever populates `'administrator'` — see §7 for why the column is still designed for more roles |
| audit + timestamp columns | Same shape as every other table (§9) |

### 2.2 `moderation_report` (new — closes B2)

Realizes Moderation Logic's (Phase 6) workflow: report → review → escalate → resolve → audit. This entity was missing from Entity Catalog (Phase 4); it is added here, transparently, rather than left blocking Package 6 indefinitely.

| Column | Purpose |
|---|---|
| `id` | Primary key, uuid |
| `entity_table` | `text`, not null — which table the report is about (e.g. `'work'`) |
| `entity_id` | `uuid`, not null — which row |
| `reason` | `text`, not null — why it was reported |
| `status` | `text`, not null — `'open' → 'in_review' → 'escalated' → 'resolved'` (its own sequence, distinct from content `status`, since a report's lifecycle isn't the content's lifecycle) |
| `reported_by` | FK → `platform_user.id`, not null |
| `assigned_to` | FK → `platform_user.id`, nullable — who is reviewing it |
| `resolution_notes` | `text`, nullable |
| audit + timestamp columns | Same shape as every other table (§9) |

`moderation_report` references `(entity_table, entity_id)` as plain columns, not a foreign key — for the same reason `entity_state_transition` does (see §3).

### 2.3 `platform_settings` (new)

Global configuration the Admin Dashboard manages — site name, description, default language, default time zone, contact information, social media links, SEO defaults, maintenance mode, AI configuration, email configuration, branding assets, feature flags.

**Design choice: key-value, not one column per setting.** A table with a fixed column per setting (`site_name text`, `maintenance_mode boolean`, ...) would require a schema migration every time a new setting is added — the same problem `status`/`role` already solved by staying as constrained `text` rather than rigid types. `platform_settings` applies the identical principle one level further: it's a key-value store, so the Admin Dashboard (Package 5) can introduce a new setting without any migration at all.

| Column | Purpose |
|---|---|
| `key` | `text`, primary key — e.g. `'site_name'`, `'maintenance_mode'`, `'ai_configuration'` |
| `value` | `jsonb`, not null — holds the setting's value in whatever shape it needs (string, boolean, object, array) |
| `description` | `text`, nullable — human-readable explanation shown in the Admin Dashboard |
| `updated_at`, `updated_by` | Same shape as every other table (§9); **no `created_at`/`created_by`** — settings are seeded once (migration) and thereafter only ever updated, never individually "created" by a user |

There is exactly one row per setting key, not one row per setting *category* — `'social_media_links'` holds a JSON object with every platform inside it, rather than one row per social network, since the set of social platforms is exactly the kind of thing that changes without warning and shouldn't require a schema decision either way.

### 2.4 `activity_log` (new)

Append-only audit trail of **actor actions** — login, logout, create, update, delete, publish, archive, restore, permission changes, settings changes. This is deliberately separate from `entity_state_transition`: that table records what happened to a piece of *content* (its Data Lifecycle stage, Phase 4); `activity_log` records what an *actor* did, including actions with no content at all (login/logout) and actions on things other than content (permission changes, settings changes).

| Column | Purpose |
|---|---|
| `id` | Primary key, uuid |
| `actor_id` | FK → `platform_user.id`, **nullable** — a failed login attempt may have no resolvable actor yet |
| `entity_type` | `text`, nullable — set for content-related actions, null for login/logout/settings-change |
| `entity_id` | `uuid`, nullable — same reasoning as `entity_type` |
| `action` | `text`, not null — `'login'`, `'logout'`, `'create'`, `'update'`, `'delete'`, `'publish'`, `'archive'`, `'restore'`, `'permission_change'`, `'settings_change'` |
| `metadata` | `jsonb`, nullable — action-specific detail (e.g. which setting changed and its old/new value) |
| `ip_address` | `inet`, nullable |
| `user_agent` | `text`, nullable |
| `created_at` | `timestamptz`, not null, `default now()` — **no `updated_at`**: this table is never updated, only ever inserted into, same as `entity_state_transition` |

Like `entity_state_transition` and `moderation_report`, `activity_log` uses plain `entity_type`/`entity_id` columns rather than a real foreign key, for the identical reason given in §3: it must be able to reference anything, including tables that don't exist yet.

---

## 3. Relationships

All relationships are covered in §1's diagram and cardinality table. One relationship pattern deserves its own explanation:

**Why `entity_state_transition`, `moderation_report`, and `activity_log` have no real foreign key to the entity they're about.** Every other polymorphic case in this schema (`media_asset`, `press_mention`) uses multiple real, enforced foreign key columns because Data Integrity Rules (Phase 4) required their ownership to be database-enforced. These three tables are different: they must be able to reference **any** current or future table (including Release 2's eventual Academy/Creative Network tables) without a schema change every time a new entity type is added. A real foreign key can only ever point at one table. Using `(entity_table text, entity_id uuid)` — or, for `activity_log`, the equivalent nullable pair — sacrifices foreign-key-level enforcement for these three specific, generic, audit-oriented tables only — application code (Package 4/6) is responsible for validating `entity_table` against a known allow-list. This is a deliberate, narrow exception, not a precedent for the rest of the schema.

---

## 4. Primary & Foreign Keys

Unchanged from Data Foundation Conventions §3 and §9, applied to the four new tables:

- `platform_user.id` — primary key, uuid (see §5 for why it's not independently generated).
- `platform_user.person_id` — foreign key → `person.id`, `on delete restrict`, `unique`.
- `moderation_report.id` — primary key, uuid, `default gen_random_uuid()`.
- `moderation_report.reported_by`, `moderation_report.assigned_to` — foreign keys → `platform_user.id`, `on delete restrict`.
- `platform_settings.key` — primary key, `text` (not uuid — see §2.3; a settings key is a human-chosen identifier, not a generated one).
- `activity_log.id` — primary key, uuid, `default gen_random_uuid()`.
- `activity_log.actor_id` — foreign key → `platform_user.id`, `on delete restrict`, **nullable** (§2.4).

Every foreign key across all 20 tables remains `ON DELETE RESTRICT` by default, per Data Foundation Conventions §9 — no exception is introduced by this document.

---

## 5. UUID Strategy

Unchanged from Data Foundation Conventions §4, with one addition specific to authentication:

**`platform_user.id` is not generated by `gen_random_uuid()`.** It is set equal to the corresponding `auth.users.id` from Supabase Auth at the moment the row is created. This keeps a single, stable identifier across the Supabase Auth layer and our own schema, rather than maintaining two different uuids for "the same login" that would need constant cross-referencing.

Every other table's `id` continues to use `gen_random_uuid()` at the database level, as fixed in Milestone 2.

---

## 6. Authentication Model

Authentication itself is handled entirely by **Supabase Auth** (`auth.users`) — this platform does not implement its own password storage, session tokens, or credential verification. Our schema's job starts at `platform_user`, which is the bridge between "a Supabase Auth identity exists" and "that identity is one of our Persons."

```
① User signs in via Supabase Auth (mechanism — email/password, magic link, etc. —
   is a Supabase configuration choice, not modeled in our schema)
        ↓
② Supabase issues a session; Route Handlers / Server Actions read it via the
   Supabase server client (API Architecture decision, this document's header)
        ↓
③ Our code resolves session → platform_user → person, establishing "who is
   making this request" per Identity Model (Phase 4)
        ↓
④ Role Enforcement (§7) and Row Level Security (§8) both key off platform_user.role
```

No `password`, `email`, or other credential field exists anywhere in our own tables — that data lives exclusively in `auth.users`, which we do not duplicate, per Data Foundation Conventions' "single source of truth per domain" principle (Phase 8).

---

## 7. Roles & Permissions

**Version 1 has exactly one active role: `administrator`.** There is no Visitor "role" row — an unauthenticated request is simply not resolved to any `platform_user`, and Row Level Security (§8) treats "no session" as the public/anonymous case automatically.

| Role | Active in V1? | Permissions |
|---|---|---|
| `administrator` | ✅ Yes | Full read/write on every table; the only role that can change `status`, `visibility`, `verification_status`; the only role that can act on `moderation_report` |
| Visitor (unauthenticated) | ✅ Yes (implicit, no row) | Read-only, and only rows where `status = 'published'` and `visibility = 'public'` |
| `trainer`, `student`, `creative_member` | ❌ Not in V1 | Reserved values for Release 2 — see §15 |

`platform_user.role` is a single `text` column, not a Postgres native `enum` type, for the same reason `status` isn't one (Data Foundation Conventions §8): adding a role later must not require an `ALTER TYPE`. It is constrained by a `check` naming only the values valid **today** (`'administrator'`), so Release 2 adding `'trainer'` is a one-line constraint change, not a structural migration.

---

## 8. Row Level Security Strategy

RLS is enabled on every table. Two policies per table cover all of V1:

| Policy | Applies To | Rule |
|---|---|---|
| **Public read** | Every content table (`organization`, `person`, `work`, `project`, `event`, `contribution`, `award`, `category`, `tag`, `media_asset`, `press_mention`, join tables) | `status = 'published' AND visibility = 'public'` — visible to anyone, including unauthenticated requests |
| **Administrator full access** | Every table, including `platform_user`, `moderation_report`, `entity_state_transition` | Full read/write, gated on `platform_user.role = 'administrator'` for the requesting session |

**No other policy exists in V1** — there is no "trainer sees their own students" policy, because no trainer role exists yet (§7). This is intentional: a policy for a role that can't log in yet is dead code that would need re-validating anyway once that role is real, per Release 2 (§15).

`entity_state_transition` and `moderation_report` additionally have **no direct client insert/update policy** — rows are only ever written by server-side code (Route Handlers/Server Actions running with elevated trust), never directly by a browser client, even an administrator's. This keeps the audit trail (§9) tamper-resistant: an administrator can cause a state transition to be logged by taking an action, but cannot hand-edit the log itself through the same API surface used for content.

Migration scripts (Package 9) run using the Supabase service role, which bypasses RLS entirely by design — this is the one sanctioned exception, and only for server-side, non-request-driven migration jobs.

**`platform_settings`**: public read is **selective**, not blanket — most keys (site name, SEO defaults, branding assets, social links) are readable by anyone, since the public site renders from them; a small subset (`ai_configuration`, `email_configuration`) is administrator-only read, since those hold operational configuration, not display content. Write access is administrator-only for every key.

**`activity_log`**: same no-direct-client-write rule as `entity_state_transition` — only server-side code appends rows. Read access is administrator-only; a log of every login and permission change is not public data, unlike the published-content tables above.

---

## 9. Audit Fields

Unchanged from Data Foundation Conventions §6, applied identically to `platform_user` and `moderation_report`: `created_at`, `updated_at` (via the shared `set_updated_at()` trigger, using `clock_timestamp()` — see the Milestone 2 fix), `created_by`, `updated_by`. `owner_id` is **not** added to `platform_user` or `moderation_report` — ownership as a concept (Ownership Rules, Phase 6) applies to content entities; a moderation report's accountable party is already expressed by `assigned_to`.

---

## 10. Soft Delete Policy

Unchanged from Data Foundation Conventions §7: no `deleted_at` column, no hard delete of published rows, anywhere — including `platform_user` and `moderation_report`. Deactivating a `platform_user` (e.g., an administrator leaving the project) is expressed by a future `status` value on that table if ever needed, not by deletion; this is not yet required for V1 since there is exactly one administrator role and no self-service deactivation flow planned.

---

## 11. Media Storage Structure

`media_asset.storage_path` (already defined in Milestone 2) stores a path into **Supabase Storage**, not a binary blob in Postgres.

```
Bucket: media
  /{entity_table}/{entity_id}/{asset_id}.{ext}

  e.g. work/3f9a.../7c21....jpg
```

- One bucket for V1 (`media`), not one per entity type — simpler to reason about, and consistent with "don't introduce structure with no current consumer" (the same reasoning Data Foundation Conventions §1 used for Postgres schemas).
- Storage-level access policy mirrors `media_asset.visibility` (§6 Data Foundation Conventions): public objects are served directly; restricted/hidden objects are only served through a signed URL issued by server-side code after the same Row Level Security check used for the database row.
- The path is deliberately keyed by `entity_table`/`entity_id`, not by `public_id`/slug — the file's location must never change just because a slug is edited (URL Structure, Phase 3: "no breaking URLs" extends to files, not just pages).

### 11.1 Media Versioning Strategy (design intent only — not implemented in V1)

`media_asset` as specified is the **current version pointer**: one row, one `storage_path`, always reflecting what's live now. Version history is not built in V1, but the storage model below never needs to be redesigned to add it:

- **Current version**: `media_asset.storage_path` always points at the file currently in effect — this doesn't change when versioning is added later.
- **Previous versions**: a future `media_asset_version` table (not created now) would hold one row per prior version — `id`, `media_asset_id` (FK), `storage_path`, `version_number`, `created_at`, `created_by`, `replaced_at` — following the exact same "generic append-only history" pattern already established by `entity_state_transition`. No existing table changes shape to accommodate it.
- **Replacement strategy**: replacing a file means uploading a new object (a new path under the same `{entity_table}/{entity_id}/` prefix) and updating `media_asset.storage_path` to point at it — the old object is **not deleted from Storage** when versioning is added, consistent with No Hard Delete (Phase 1) applied to files, not just rows.
- **Immutable file identifiers**: `media_asset.id` (uuid, §5) never changes across replacements — it identifies "this logical asset," not "this specific file." Anything that needs to reference "the cover photo of this Work" links to `media_asset.id`, which stays stable even after the underlying file is replaced.
- **Metadata preservation**: `caption_ar`/`caption_en` and every other column on `media_asset` describe the *logical asset*, not one specific file version, so they are naturally preserved across replacements without any extra design — only the future `media_asset_version` rows would need their own copy of whatever metadata is meant to be historically frozen per version (e.g. the caption as it read at that time), which that table's schema can hold without touching `media_asset` itself.

This section documents the seam where version history plugs in later; it deliberately does not add the `media_asset_version` table to Version 1's table list (§2), per Development Boundaries' "add later without redesigning," not "build now."

---

## 12. Naming Conventions

Unchanged from Data Foundation Conventions §2. The two new tables follow the same rule: singular, `snake_case`, matching their conceptual name exactly (`platform_user`, not `platform_users` or `PlatformUser`; `moderation_report`, not `moderation_reports`).

---

## 13. Indexing Strategy

Extends Data Foundation Conventions §10 with two additions specific to Version 1's actual usage patterns:

| Index | Table | Purpose |
|---|---|---|
| `uq_platform_user_person_id` | `platform_user` | Enforces the 1:1 Person↔User relationship |
| `idx_moderation_report_entity` | `moderation_report` | `(entity_table, entity_id)` — mirrors `entity_state_transition`'s index, for the same lookup pattern |
| `idx_moderation_report_status` | `moderation_report` | Administrator Dashboard's primary query: "show me open reports" |
| `idx_activity_log_actor_id` | `activity_log` | Administrator Dashboard's "show me this actor's history" query |
| `idx_activity_log_entity` | `activity_log` | `(entity_type, entity_id)` — mirrors the same pattern used by `entity_state_transition` and `moderation_report` |
| `idx_activity_log_created_at` | `activity_log` | Chronological browsing/pagination of the audit trail — its dominant access pattern |
| Full-text search indexes (GIN over generated `tsvector` columns) | `person`, `work`, `project`, `event`, `organization` | Search & Discovery (Package 7); only the five entity types Search Architecture (Phase 3) identifies as primary search targets get one — `award`, `media_asset`, `press_mention`, `category`, `tag` are found *through* those five, not searched directly |

Every foreign key across all 20 tables is indexed, per Data Foundation Conventions §10 — no exception for the four new tables.

---

## 14. Migration Strategy

Concrete, V1-specific realization of Migration Strategy (Phase 9):

1. **Schema migrations** continue the existing numbered-file sequence from Milestone 2 (`packages/database/migrations/`, applied in filename order). `platform_user` and `moderation_report` are added as the next two migrations in that sequence, before any package that depends on them (Identity & Access; Verification & Moderation Governance) begins.
2. **Legacy data migrations** (Package 9) run only after all schema migrations for the tables they populate exist — they never create schema themselves.
3. **Every migration remains additive and reversible**: no migration in this schema drops a column or table that already shipped to production; corrections happen by adding a new migration, per Release & Deployment Strategy's "no breaking URLs/no breaking schema" philosophy (Phase 9) applied to the database.
4. **Order for the two new tables**: `platform_user` before `moderation_report` (the latter's `reported_by`/`assigned_to` foreign keys require it to exist first).

---

## 15. Future Compatibility with Release 2 (Without Implementing It)

Nothing in this schema needs to change structurally when Academy and Creative Network are eventually built — only additively:

- **`person` is already the shared identity anchor.** A future `academy_enrollment` or `creative_network_membership` table references `person_id` directly; it does not need its own copy of name/bio/identity data (Identity Model, Phase 4, already guaranteed this).
- **`platform_user.role` is a `text` column with a narrow `check`, not a fixed enum type** (§7) — adding `'trainer'`, `'student'`, `'creative_member'` later is a one-line constraint update, not a migration that touches existing rows.
- **`entity_state_transition` and `moderation_report` reference `(entity_table, entity_id)` generically** (§3) — a future `academy_course` row gets full history tracking and moderation support for free, without any change to these two tables.
- **`category.domain` is already namespaced** (Milestone 2) — a future `'course_type'` or `'membership_tier'` domain is a new value in an existing column, not a new table.
- **No V1 table has a foreign key pointing at a Release 2 table that doesn't exist** — confirmed in the Final Build Manifest (Section 4). The dependency direction, if any, will run the other way (a future Academy table referencing into `person`/`organization`), which requires zero changes here.

This section is a compatibility check, not a plan — no Academy or Creative Network table, column, or migration is created by this document, per the Final Build Manifest freeze.

---

## 16. Search Readiness

Search & Discovery (Package 7) is not implemented by this document, but the schema is already shaped to support it without redesign.

**PostgreSQL Full Text Search compatibility.** Every column that participates in search (`name_ar`/`name_en`, `title_ar`/`title_en`, `bio_ar`/`bio_en`, `description_ar`/`description_en`) is plain `text`, which Postgres's `tsvector`/`tsquery` machinery works with directly — no data type change is needed to turn on search later.

**Future search indexing strategy.** §13 already reserves GIN indexes over generated `tsvector` columns for the five primary searchable entities. The realistic path when Package 7 begins: add one generated `search_vector tsvector` column per searchable table (combining its Arabic and English text fields with appropriate `tsvector` weighting for title/name vs. description), then one GIN index on it — additive migrations, not a redesign of any table above.

**Searchable entities.** `person`, `work`, `project`, `event`, `organization` — the same five identified in §13, matching Search Architecture's (Phase 3) scope for what the platform's search actually needs to cover directly. `award`, `media_asset`, `press_mention` remain discoverable *through* those five (via their foreign keys), not as independent search targets — consistent with Search Architecture's "search finds the primary entity; related records surface through it," not a separate index per table.

**Searchable metadata.** Beyond the text fields above, `category` and `tag` associations (via the join tables) are the intended filters layered on top of full-text results — "search for X, filter by category Y" — which the existing many-to-many join tables already support without any new structure.

**Future AI semantic search compatibility.** Nothing in this schema blocks adding vector-based semantic search later: a `search_embedding vector(n)` column (via Postgres's `pgvector` extension) could be added to any of the five searchable tables as a pure addition, populated by an embedding call through the same AI provider abstraction layer (this document's header — OpenAI now, others later) that already governs `ai_recommendation_log`. This is explicitly **not** built in V1; it is named here only so that when it is needed, it is understood to be an additive column plus a new index, not a schema redesign.

---

## Database Architecture Status: Frozen (Version 1)

This document, as amended in Review Round 1, is the official production database blueprint for AHR Platform v1. No further structural changes are made without a new, explicit review round.

---

## What This Document Does Not Cover

- No SQL, no migration file contents (those are written milestone-by-milestone as before, now unblocked for Packages 3 and 6).
- No API route definitions (Route Handlers/Server Actions are Package 4's concern).
- No UI/component code.

---

**Status:**
🔒 Frozen (Version 1)

**Prepared By:**
Claude

**Approved By:**
Architecture Review (Round 1)

**Dependencies:**
Data Foundation Conventions (Milestone 2), Entity Catalog, Relationship Model, Data Integrity Rules, Identifier Strategy, Metadata Model, Archive Model, Data Lifecycle (Phase 4), Identity Model (Phase 4), Ownership Rules, Verification Logic, Moderation Logic (Phase 6), Identity and Access Architecture, Security Architecture (Phase 8), Migration Strategy (Phase 9), AHR Platform v1 Final Build Manifest
