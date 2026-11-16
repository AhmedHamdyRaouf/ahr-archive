# AHR Platform v1 — CMS Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Package Type:** Administrator-facing authoring surface, hosted inside the Dashboard shell (`06-Dashboard.md`)

CMS is the write side of the platform for Archive content. The public read side is the Website (covered under `04-Frontend.md`'s public route group and `07-API.md`'s Website endpoints); the underlying domain model both sides build on is `@ahr/content` + `@ahr/cms-core` (`03-Backend.md` §1).

---

## 1. Entities Managed

Person, Organization, Work, Project, Event, Contribution, Award, Category, Tag — nine entities, each with one `ResourceDefinition` in `@ahr/content`, copied verbatim from the frozen `check`-constraint value sets in `02-Database.md`. Press Mention is also managed here as a tenth entity, sharing the same generic engine.

**Out of scope for CMS specifically:** Organization management has its own dedicated admin surface (Contacts & Organizations); Media upload mechanics are §5 below; the underlying business-rule *definitions* live in `@ahr/content`, CMS only invokes them.

## 2. Lifecycle

Every entity moves through exactly one lifecycle graph, enforced by `@ahr/cms-core` (`03-Backend.md` §4):

```
draft → review → verified → published → archived
                                  ↑___________|
                              (restore path only)
```

No stage may be skipped (e.g., `draft → published` directly is rejected with `INVALID_STATUS_TRANSITION`). No backward-correction path (e.g., `review → draft`) exists. Every transition is a single shared function call (`transitionStatus(entityTable, entityId, toStatus)`), never a per-entity reimplementation, and automatically produces an `entity_state_transition` audit row.

## 3. Publication Gate: the Contribution Requirement

Only `work` strictly requires at least one linked `contribution` row before it may reach `published` — this is Data Integrity Rules' one documented requirement, and it is **not** extended to `project` or `event` even though they share the same relational shape, because extending it further would silently invent a stricter rule the frozen architecture never authorized. Attempting to publish a Work with zero Contributions fails with `MISSING_CONTRIBUTION` (`07-API.md`).

## 4. Taxonomy

Category and Tag attach to Work and Project via join tables (`work_category`, `work_tag`, `project_category`, `project_tag`), managed by `@ahr/relationships`' `taxonomy-service.ts` (bespoke code — these tables have composite primary keys and no audit columns, structurally incompatible with the generic engine; see `03-Backend.md` §2 item 5).

`category.domain` scopes which entity type a Category may attach to (`work_type` categories only attach to Work; `project_type` only to Project). Attempting a mismatched attachment fails with `TAXONOMY_DOMAIN_MISMATCH`.

## 5. Media Library (Managed Within CMS)

Media is a first-class CMS capability, implemented by `@ahr/media`, reusing `@ahr/cms-core`'s exact, already-tested lifecycle graph — no separate media-specific lifecycle exists.

| Rule | Detail |
|---|---|
| Owner-first | No upload begins server-side processing until exactly one owner entity (`personId`/`workId`/`projectId`/`eventId`) is confirmed present — checked before the file is written to Storage |
| Storage path | `media/{ownerType}/{ownerId}/{assetId}.{ext}`, constructed by one shared function, never derived from filename or slug |
| Allowed types | `image`, `audio`, `video` only — `document` is explicitly excluded; validated both client-side (fast feedback) and server-side (authoritative) |
| Replace, don't overwrite | Replacing a file always writes a new Storage object at a new path and updates `storage_path` — the prior object is never deleted, preserving history per the versioning seam (`02-Database.md` §11.1) |
| Failure cleanup | A partial failure (file written, row failed, or vice versa) is treated as a whole failure and cleaned up — never an orphaned Storage object or a dangling database row |
| Signed URLs | Restricted/hidden assets are only ever reachable via a short-lived signed URL matching the asset's `visibility` — never a permanent public link |

Storage abstraction (`StorageAdapter` interface, one real Supabase-backed implementation) means replacing the storage provider later requires one new adapter, not a rewrite of upload/validation/path logic. Full Storage-as-external-provider detail: `09-Integrations.md`.

## 6. Compound Works and Hierarchy

`work.parent_work_id` (self-referencing, optional) models compound works. `@ahr/relationships`' `work-hierarchy.ts` provides children lookup and a cycle-safe ancestor walk. `category.parent_id` provides the equivalent, domain-scoped hierarchy for Category.

## 7. Cross-Entity Read Services

`@ahr/relationships` also exposes: contribution queries (Person ↔ Work/Project/Event), press-mention queries (exactly-one-subject relationship), award queries (Organization/Person relationships), and `state-history-service.ts` (reads `entity_state_transition` for any entity's full lifecycle history) — read-side only, no writes.

## 8. AI-Assisted Authoring (Cross-Reference)

CMS forms may surface an AI suggestion panel (category/tag, draft summary) as an optional, non-blocking, human-reviewed proposal only. Full behavior, boundaries, and current implementation status: `14-AI-Integration.md`. CMS itself never calls an AI provider directly.

## 9. Validation and Business Rules Enforced at This Layer

- Required fields per entity, per `02-Database.md` §2 (e.g., `work.title_ar`, `work.title_en`, `work.work_type` not null).
- `work.work_type`, `project.project_type` restricted to their frozen `check`-constraint value sets.
- Publication Rules: bilingual completeness, ownership present, required relationships satisfied, no active moderation report on the entity — enforced before Publish succeeds, not merely recommended.

## 10. Edge Cases

- Publishing a Work whose only Contribution was deleted mid-edit is blocked, identical to never having had one.
- Attaching a `project_type` category to a Work is rejected by domain-scoping validation.
- Editing an entity with an open `moderation_report` surfaces a visible warning in the CMS UI (Dashboard's Moderation Queue owns the resolution flow — `06-Dashboard.md`).
- Concurrent edits to the same row: last write wins in v1 — no optimistic locking (Backlog, `03-Backend.md`).

## Backlog

- Optimistic locking / conflict detection for concurrent edits.
- Bulk actions (bulk categorize, bulk archive).
- Role-scoped CMS views once Trainer/Editor-equivalent roles exist (Release 2).
- Richer media browsing/picker UI beyond the current raw-ID seam.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Packages Specification Package 02 (CMS), Package 04 (Archive), Package 08 (Media Library); Business Rules, Publication Rules, Entity Lifecycles & State Transitions (Phase 6); `02-Database.md`, `03-Backend.md`
