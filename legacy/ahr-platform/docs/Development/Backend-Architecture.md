# AHR Platform v1 — Backend Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Runtime:** Next.js Route Handlers + Server Actions inside `apps/web`. No separate backend service exists or is planned for v1.

This document specifies how backend logic is organized and written. The API wire contract itself (envelope, resource naming, error codes) is `07-API.md`; database schema is `02-Database.md`; auth mechanics are `08-Authentication-and-Authorization.md`.

---

## 1. Package Inventory (Actual, as Built)

| Package | Responsibility | Owns which tables |
|---|---|---|
| `@ahr/database` | Migrations, structural conventions, smoke tests | Schema definition for all 20 tables |
| `@ahr/auth` | Authentication resolution, role/capability lookup, policy enforcement point, activity logging | `platform_user` (read), `activity_log` (write) |
| `@ahr/cms-core` | Generic, entity-agnostic CMS engine: status/visibility/verification enums, slug generation, validation, generic CRUD, lifecycle transitions, revision/media-picker seams | No table directly — generic engine consumed by owners |
| `@ahr/content` | One `ResourceDefinition` per Archive entity (Person, Organization, Work, Project, Event, Award, Category, Tag, Press Mention, Contribution); entity-specific business rules; taxonomy scoping; media relation attachment | `person`, `organization`, `work`, `project`, `event`, `award`, `category`, `tag`, `press_mention`, `contribution` (via `cms-core`) |
| `@ahr/media` | Storage abstraction, upload pipeline, path construction, media lifecycle | `media_asset` |
| `@ahr/relationships` | Cross-entity queries, taxonomy join-table services, hierarchy walks, shared metadata updates, state-history reads | `work_category`, `work_tag`, `project_category`, `project_tag` (bespoke — composite PK, incompatible with generic engine); read access to `entity_state_transition` |
| `@ahr/workflow` | Moderation report lifecycle (`open → in_review → escalated/resolved`), content-workflow re-exports | `moderation_report` |
| `@ahr/search` | Entity-search configuration, relevance scoring, five documented search endpoints | Read-only across `person`, `work`, `project`, `event`, `organization` |
| `@ahr/notifications` | Provider abstraction, bilingual templates, dispatch service for wired-up events | No table (v1 has no persisted notification/preference schema — see §7) |
| `@ahr/site` | Bilingual routing utilities, SEO/sitemap building, public settings allowlist, navigation structure | Read-only, public `platform_settings` subset |
| `@ahr/config` | Shared ESLint preset, shared `tsconfig.base.json` | None |

## 2. Structural Rules

1. **One package, one responsibility.** A package doing two unrelated things is split, never patched around.
2. **No package reaches into another package's internals.** Cross-package usage goes only through a package's `src/index.ts` public exports — never a deep import into another package's internal modules.
3. **A table has exactly one owning package** for writes (§1). No package queries or writes a table it doesn't own; cross-package needs go through the owning package's exported function.
4. **Business rules live in exactly one place** — the package owning that domain — and are imported everywhere else, never re-implemented per call site.
5. **Bespoke code is an acknowledged, narrow exception, not a default.** `@ahr/relationships`' taxonomy-join-table services and `@ahr/workflow`'s `moderation_report` handling bypass `cms-core`'s generic engine because their schema shape (composite PK, no audit columns, or a distinct status sequence) is structurally incompatible with it — this is documented per package, not silently duplicated logic.

## 3. Where Business Logic Lives (Layering)

```
Route Handler / Server Action        — thin adapter only
        │  parses input, calls the owning package,
        │  shapes the response per 07-API.md's envelope
        ▼
Owning package's service function     — packages/content/service.ts is the
        │  canonical example: permission check (@ahr/auth) → business rule
        │  → generic repository call (@ahr/cms-core) → activity log write
        ▼
Generic engine (@ahr/cms-core)        — status/validation/query/repository,
        │  entity-agnostic
        ▼
Database (Postgres, RLS)              — last-resort structural backstop
```

No validation, lifecycle, or business-rule logic is ever written inline inside a Route Handler or Server Action. A Route Handler that does more than parse → call → shape is a code-review-blocking defect.

## 4. Generic CMS Engine (`@ahr/cms-core`) — What It Guarantees

- The exact lifecycle graph: `draft → review → verified → published → archived`, plus the one documented restore path `archived → published`. No backward-correction path (e.g. `review → draft`) exists — none was ever authorized, and none is invented at the code level.
- `genericSoftDelete` is exactly a transition to `archived`, never a row deletion.
- `genericHardDelete` is refused for any row that has ever left `draft`.
- Every successful `genericTransitionStatus` call writes its own `entity_state_transition` row directly, in the same function — this is the corrected version of a defect (see §8) and is not delegated to a database trigger.
- Generic pagination/filter/sort/search: `page`/`pageSize` (default 20, max 100), matching `07-API.md`.

Every entity-specific package (`@ahr/content`, `@ahr/media`) reuses this engine rather than reimplementing CRUD/lifecycle per entity.

## 5. Validation

Every request body is validated against the rules the corresponding API endpoint documents (`07-API.md`) *before* it reaches the database — even though the database also enforces its own `check`/FK constraints. Database constraints are the last-resort backstop, not the primary validation layer, because a raw constraint violation cannot produce a meaningful field-level error message. See `10-Security.md` §5 for validation's role as an injection-prevention control, and `12-Testing.md` for how this layering is verified.

## 6. Authentication Enforcement in Backend Code

Every protected Route Handler/Server Action calls the shared session-resolution helper (`@ahr/auth`'s `session.ts`/`policy.ts`) at its start — session checking is never reimplemented inline per route. Full resolution chain and role model: `08-Authentication-and-Authorization.md`.

## 7. Known, Documented Gaps (Not Worked Around)

- **AI recommendation persistence.** No `ai_recommendation_log` table exists; AI suggestions are ephemeral in v1. See `14-AI-Integration.md`.
- **Notification inbox / preferences.** No persisted notification table or per-user preference schema exists. `@ahr/notifications` ships a fixed, single notification policy and dispatches through provider abstractions only (email channel today) for a fixed set of wired-up events (`moderation_report_opened/escalated/resolved`, `content_published`). A persisted inbox is a Backlog item, not a workaround.
- **Full-text search.** `@ahr/search` uses `ILIKE` substring matching and a deterministic relevance heuristic, not Postgres FTS (`tsvector`/`ts_rank`) or a GIN index — no migration ever implemented FTS, and none is added by this document. See `11-Performance.md` for the cost/behavior this implies.
- **Revision history / media-picker richness.** `@ahr/cms-core` exposes `RevisionAdapter`/`MediaPickerAdapter` seams with no-op/raw-id default implementations — no revision table and no rich media-browsing UI exist in v1.

Each gap above is flagged, not silently patched with an invented table or a parallel mechanism, per Development Principles' "no silent schema/feature invention" rule.

## 8. A Corrected Defect (Recorded for Traceability)

`genericTransitionStatus` originally carried a comment claiming a database trigger wrote `entity_state_transition` rows automatically. No such trigger was ever built in any migration; the table was silently empty from the function's creation until the defect was found while building the workflow package's audit integration. The fix (the function writes its own history row directly, in-process, immediately after a successful transition) is now the permanent, tested behavior described in §4. This is recorded here so no future refactor "reintroduces" the false assumption.

## Backlog

- Optimistic locking / conflict detection for concurrent CMS edits (v1 is last-write-wins by design, not oversight).
- Bulk CMS actions (bulk categorize, bulk archive).
- A second backend runtime or separately deployed service — not evaluated unless a genuine scaling need for a specific package emerges (see `11-Performance.md`).

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Service Architecture (Phase 8); Development Specification 01, 02, 06; package READMEs (`@ahr/auth`, `@ahr/cms-core`, `@ahr/content`, `@ahr/media`, `@ahr/relationships`, `@ahr/workflow`, `@ahr/search`, `@ahr/notifications`, `@ahr/site`)
