# AHR Platform v1 — API Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Mechanism:** Next.js Route Handlers + Server Actions (frozen decision, `01-Architecture.md` §2). This is the wire-level contract; where each rule is *enforced* in code is `03-Backend.md`.

---

## 1. Style and Base Path

REST, resource-oriented. All HTTP routes under `/api`. No version prefix beyond that in v1 — a breaking change would introduce `/api/v2`, following the platform's general "no breaking URLs/contracts" rule; this has not been needed yet.

## 2. Resource Naming

API resource paths use plural, English nouns even though database tables are singular `snake_case` — a deliberate, one-time mapping, not an inconsistency:

| Database table | API resource path |
|---|---|
| `person` | `/persons` |
| `work` | `/works` |
| `project` | `/projects` |
| `event` | `/events` |
| `contribution` | `/contributions` |
| `award` | `/awards` |
| `category` | `/categories` |
| `tag` | `/tags` |
| `organization` | `/organizations` |
| `media_asset` | `/media` (collection), `/media/{id}` (item) |
| `press_mention` | `/press-mentions` |

## 3. Field Naming

Request/response JSON fields are `camelCase` (`titleAr`, `workType`) even though database columns are `snake_case` (`title_ar`, `work_type`). This conversion happens exactly once, at the domain package boundary (`@ahr/content`) — no other layer re-implements it.

## 4. Response Envelope

Every response, with no exception, follows one shape:

```json
{
  "data": "<resource, array, or null on error>",
  "error": "<null, or an Error Object — see §8>",
  "meta": "<pagination/context info, or null>"
}
```

No endpoint returns a bare array or bare object at the top level.

## 5. Pagination

List endpoints accept `page` (default 1) and `pageSize` (default 20, max 100). `meta` on a paginated response includes `page`, `pageSize`, `totalItems`, `totalPages`.

## 6. HTTP Verb Mapping

| Verb | Meaning |
|---|---|
| `GET` | Read (single or list) |
| `POST` | Create, or a named action (e.g., a lifecycle transition) that is not a plain field update |
| `PATCH` | Partial field update to an existing resource |
| `DELETE` | Only where explicitly documented; per No Hard Delete, archives a published resource — only performs true removal for a resource that never left Draft |

There is no `PUT`. Lifecycle/status changes are never a raw `PATCH` to a `status` field — they are always `POST /{resource}/{id}/transition` with `{ "toStatus": "..." }`, one consistent action shape across every entity, because a transition requires business-rule validation a blind field update would bypass (`05-CMS.md` §2).

## 7. Locale

The API takes **no** `locale` parameter. Every bilingual field pair is always returned together; the frontend selects which value to display based on its own `/ar`/`/en` route segment (`04-Frontend.md` §10). Bilingual routing is a URL/rendering decision, never a data-shape one.

## 8. Error Object Shape and Standard Codes

```json
{
  "code": "STRING_CONSTANT",
  "message": "Human-readable, safe to display",
  "details": "optional, field-level info"
}
```

Never a raw database error, stack trace, or third-party provider error passed through directly.

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session, insufficient role/ownership |
| `NOT_FOUND` | 404 | Resource doesn't exist, or isn't visible to this caller (a Visitor requesting a Draft gets `NOT_FOUND`, never `FORBIDDEN`, to avoid confirming existence) |
| `VALIDATION_ERROR` | 422 | Field-level validation failure; `details` lists each failing field |
| `INVALID_STATUS_TRANSITION` | 409 | Requested lifecycle transition skips a stage or is otherwise disallowed |
| `MISSING_CONTRIBUTION` | 422 | A Work publish attempt with no linked Contribution |
| `TAXONOMY_DOMAIN_MISMATCH` | 422 | A Category's `domain` doesn't match the entity type it's assigned to |
| `OWNER_CONSTRAINT_VIOLATION` | 422 | A `media_asset`/`press_mention` write sets zero or more than one owner field |
| `REFERENCED_BY_OTHER_RECORDS` | 409 | Attempted archive/status change blocked because another record still depends on this one |
| `RATE_LIMITED` | 429 | Too many requests (infrastructure/edge concern, `10-Security.md`) |
| `PROVIDER_UNAVAILABLE` | 502 | An upstream provider (OpenAI, email) failed or timed out |
| `CONFLICT` | 409 | Generic conflict not covered by a more specific code |
| `INTERNAL_ERROR` | 500 | Unexpected server error; always logged server-side, never detailed to the client |

Each endpoint only ever surfaces the subset of codes it can actually reach — not the full table above.

## 9. Authentication

Every non-public endpoint requires a valid Supabase Auth session, resolved server-side. No API key mechanism exists beyond the session cookie. Full session/role model: `08-Authentication-and-Authorization.md`.

## 10. Status Transition Action Endpoints

Every entity with a lifecycle exposes `POST /{resource}/{id}/transition` — one consistent shape across every package, never one implementation per entity.

## 11. Endpoint Families by Package (Reference Index)

Each package documents one fully-specified generic endpoint family (parameterized by entity type) plus a table of entity-specific differences, rather than repeating an identical CRUD+transition group per entity:

| Package | Base path | Public? |
|---|---|---|
| Authentication | `/api/auth` | Login/forgot-password/reset-password/session-check public; logout/refresh/profile/permissions require a session |
| CMS | `/api/cms/{entityType}` | Administrator only |
| Website | `/api/website/*` (Server-Component-consumed primarily) | Public, published+public only |
| Media | `/api/media` | Public read (published+public), Administrator write |
| Search | `/api/search`, `/api/search/{archive,media,organizations,cms}` | Public read; CMS-embedded search is Administrator, unfiltered |
| Moderation | `/api/moderation-reports` | Administrator only |
| AI | `/api/ai/suggest` (planned — see `14-AI-Integration.md`) | Administrator only |

## 12. Idempotency

`POST .../transition` and media upload are **not** guaranteed idempotent in v1 — no idempotency-key mechanism exists. A retried transition request that already succeeded is rejected with `INVALID_STATUS_TRANSITION` (the entity is no longer in the assumed "from" state) — an acceptable, documented signal, not silent double-application.

## 13. Timestamps and Null Conventions

All timestamps are ISO 8601, UTC. A field with no value is `null`, never an empty string standing in for "not set" — most relevant for nullable foreign keys (e.g., `organizationId` on a Project without one) and nullable bilingual fields.

## Backlog

- API versioning prefix (`/api/v2`) — only introduced if a genuine breaking change is required.
- Idempotency-key support for transition/upload endpoints.
- Persisted AI recommendation endpoints (`14-AI-Integration.md`).

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** API Standards, API Conventions, Error Codes, Permissions Matrix, Authentication Rules (frozen API Specification, all 15 documents); `02-Database.md`, `03-Backend.md`
