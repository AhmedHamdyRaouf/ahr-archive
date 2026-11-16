# AHR Platform v1 — API Standards

**Status:** 🔒 Frozen

## Style
REST, resource-oriented. All routes under `/api`. No versioning prefix beyond that in V1 (`/api/v2` would only appear if a breaking change is ever needed — Release & Deployment Strategy's "no breaking" philosophy, Phase 9, applies to the API surface too).

## Resource Naming
API resource paths use **plural, kebab-case-safe English nouns**, even though the underlying Database Architecture (Frozen v1) tables are singular `snake_case` (Data Foundation Conventions §2). This is a deliberate, one-time documented mapping — not a contradiction:

| Database table | API resource path |
|---|---|
| `person` | `/persons` (regular plural used deliberately instead of irregular "people," for mechanical consistency) |
| `work` | `/works` |
| `project` | `/projects` |
| `event` | `/events` |
| `contribution` | `/contributions` |
| `award` | `/awards` |
| `category` | `/categories` |
| `tag` | `/tags` |
| `organization` | `/organizations` |
| `media_asset` | `/media` (collection endpoint), individual asset via `/media/{id}` |
| `press_mention` | `/press-mentions` |

## Request/Response Body Field Naming
JSON fields are **camelCase** (`titleAr`, `titleEn`, `workType`), even though database columns are `snake_case` (`title_ar`, `title_en`, `work_type`). The conversion happens once, at Package 04 (Archive)'s boundary — no other package re-implements this mapping (Coding Standards, "one place for business rules," applied to naming too).

## Response Envelope

Every response follows one shape:

```
{
  "data": <resource or array of resources, or null on error>,
  "error": <null, or an Error Object per 12 - Error Codes>,
  "meta": <pagination/context info, or null>
}
```

No endpoint returns a bare array or bare object at the top level — this is consistent across all 10 packages' APIs.

## Pagination

List endpoints accept `page` (default 1) and `pageSize` (default 20, max 100) query parameters. `meta` on a paginated response includes `page`, `pageSize`, `totalItems`, `totalPages`.

## HTTP Verb Mapping

| Verb | Meaning |
|---|---|
| `GET` | Read (single or list) |
| `POST` | Create, or a named action (e.g. a lifecycle transition) that isn't a plain field update |
| `PATCH` | Partial field update to an existing resource |
| `DELETE` | Only where explicitly documented — per No Hard Delete (Phase 1/4), a `DELETE` call **archives** a published resource; it only performs true removal for a resource that never left Draft (see each package doc for specifics) |

There is no `PUT` in this API — `PATCH` covers partial updates, and lifecycle/status changes are their own `POST .../transition` action endpoints, never a raw `PATCH` to a `status` field (Business Rules, Phase 6, require transition-specific validation that a blind field update would bypass).

## Status Transition Action Endpoints

Every entity with a lifecycle (Database Architecture-backed tables using `status`) exposes `POST /{resource}/{id}/transition` with a body `{ "toStatus": "..." }` — one consistent action shape across every package, per Coding Standards' "shared lifecycle function, not one per entity" (already the rule in Package 04/Archive).

## Locale

The API does **not** take a `locale` parameter to filter which language's data is returned — every bilingual field pair (`titleAr`/`titleEn`, etc.) is always returned together, per Database Architecture's own framing (bilingual routing is a URL/rendering decision, not a data-shape one). The frontend (Website, Package 03) selects which field to display based on its own `/ar`/`/en` route segment.

## Authentication

Every non-public endpoint requires a valid Supabase Auth session, resolved server-side (13 - Authentication Rules). No API key mechanism exists in V1 beyond the session cookie.

## Versioning of This Document

This is the frozen API contract for Version 1. Any endpoint change after this document's approval goes through the same review-round process used for every other frozen document in this project.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Technology Stack (Next.js Route Handlers + Server Actions), Database Architecture (Frozen v1), Packages Specification
