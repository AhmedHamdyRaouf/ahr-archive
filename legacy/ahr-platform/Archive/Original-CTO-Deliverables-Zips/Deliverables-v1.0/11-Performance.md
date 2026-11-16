# AHR Platform v1 — Performance & Observability Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)

Covers scalability, performance, caching, logging, and operational monitoring together, since the platform's own architecture treats them as one closely-coupled concern (Phase 8: Scalability & Performance Architecture and Observability & Operational Architecture). Testing of these properties is covered in `12-Testing.md`.

---

## 1. Governing Principles

1. **Stateless by default** — Route Handlers/Server Actions hold no in-memory state that would block horizontal scaling later.
2. **Read/write asymmetry** — public read paths (Website, Search) are optimized for throughput; administrative write paths (CMS) prioritize correctness/validation completeness over raw speed.
3. **Asynchronous, non-blocking secondary operations** — AI suggestions and notification dispatch never block the primary action they're attached to.
4. **Growth by addition, not premature complexity** — no caching layer, denormalization, or read-replica strategy is introduced speculatively; each is added only against a specific, measured need.
5. **Graceful degradation** — under unexpected load, core functions (published Archive rendering) take priority over secondary functions (non-critical AI suggestions).

## 2. Query and Index Discipline

- Every foreign key across all 20 tables is indexed — a migration adding a foreign key without its index is a code-review-blocking omission, not a style note (`02-Database.md` §12).
- **N+1 avoidance:** any list view displaying related data (e.g., a Work list showing Contribution counts) fetches that related data in a single batched query, never one query per row — a `@ahr/content`/`@ahr/relationships` responsibility, checked at code review.
- **Pagination everywhere:** no endpoint or admin list view returns an unbounded result set; every list respects `pageSize` (max 100), even for internal/admin use.

## 3. Search Performance (Current, Honest Cost)

`@ahr/search` uses `ILIKE` substring matching and a deterministic relevance heuristic (exact → prefix → substring match, plus verified-status and recency tie-breakers), not a Postgres full-text index. Merging ranked results across five independent tables without a real search index means correct page-N pagination re-fetches each table from its start through the current page's end, then merges/re-sorts/slices — an `O(page × pageSize)` cost per entity type, not `O(pageSize)`. This is an honest, documented cost, not a hidden inefficiency or a silently-wrong later page. The schema is already FTS-ready (`02-Database.md` §14) for when this is upgraded.

## 4. Media Delivery

Public media is served from Storage/CDN directly, never proxied through the Next.js application server unnecessarily. The application only mediates access for restricted/hidden content, via signed URLs (`10-Security.md` §8).

## 5. Caching Strategy

| May be cached | Must never be cached |
|---|---|
| Public Website pages reading published+public content | Anything under `/dashboard/*` |
| Search results for common/popular queries, briefly | Restricted/hidden content or any signed URL response |
| Public media files, aggressively, keyed by their stable Storage path | Session/authentication state |
| | `platform_settings.aiConfiguration`/`emailConfiguration`, or any Administrator-only settings data |

**Invalidation trigger:** publishing, archiving, or updating any entity that reaches `published`+`public` invalidates that specific page's cache — scoped to the affected page/resource, never a blanket full-site clear. A stale published page showing outdated content is a correctness defect, not an acceptable performance trade-off.

**No dedicated client-side caching library** is introduced beyond the frontend framework's built-in data-fetching cache plus CDN-level caching for static/media assets — consistent with `04-Frontend.md`'s "no heavy global client store" decision.

## 6. Three Distinct Logs — Never Conflated

| Log | Purpose | Storage |
|---|---|---|
| `entity_state_transition` | Content lifecycle history (Draft → ... → Archived) | Database table |
| `activity_log` | Actor actions (login, CRUD, settings changes) | Database table |
| Technical/operational log stream | Server errors, performance traces, request logs | Not a database table — a conventional application log stream |

No code path writes technical/operational logs into either database table, and vice versa — `activity_log` is not a debugging log, and the application log stream is not an audit trail.

**What gets logged where:**
- Every mutating, user-attributable Route Handler/Server Action call → `activity_log`.
- Every entity status transition → `entity_state_transition`, automatically, by the shared transition function — never written manually.
- Every unhandled exception / `500 INTERNAL_ERROR` → technical log stream, with full detail (stack trace, request context); this detail never reaches the client (`10-Security.md`, `07-API.md` §8).
- Every AI provider call and its outcome → technical log stream today, since no `ai_recommendation_log` table exists yet — a temporary logging home, not a substitute for the eventual persisted table (`14-AI-Integration.md`).

**Sensitive data:** `ip_address`/`user_agent` and any technical log entry never include full request bodies containing bilingual personal content verbatim — `entityTable`/`entityId` is sufficient to identify the affected record.

## 7. Observability Principle

Logging *observes* the system; it does not influence it — a logging failure must never block or alter a request's actual outcome (e.g., a failed `activity_log` write must never roll back the action it was logging, and vice versa; `03-Backend.md` §4 documents this explicitly for status transitions).

## 8. What Is Monitored

- Health and performance of the logical systems (`01-Architecture.md` §4), not individual user behavior beyond what serves security or verification.
- Alerting is designed around impact on core functions (e.g., content-service outage), not around raw traffic volume or request count alone.
- Every state transition and every AI output is logged with enough detail to be fully traceable from source to final effect (`12-Testing.md` verifies this is actually true).

No specific monitoring tool/vendor is named by this document — selecting one is an infrastructure decision made in `13-Deployment-and-DevOps.md`'s operational readiness track, not an architectural commitment.

## Backlog

- Postgres full-text search (`tsvector`/GIN index) to replace the current `ILIKE` heuristic, when search volume or accuracy needs justify it.
- A dedicated CDN/edge-cache layer beyond what Vercel/Supabase Storage already provide.
- A named monitoring/observability tool selection (currently unselected — an operational readiness item, not a code blocker).
- `pgvector`-based semantic search (`02-Database.md` §14 Backlog).

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Scalability and Performance Architecture, Observability and Operational Architecture (Phase 8); Caching Strategy, Logging Strategy, Performance Guidelines (Development Specification 11, 13, 15); `02-Database.md` §12–§14
