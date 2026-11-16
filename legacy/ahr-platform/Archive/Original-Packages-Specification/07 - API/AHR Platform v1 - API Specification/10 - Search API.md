# AHR Platform v1 — Search API

**Status:** 🔒 Frozen

Base path: `/api/search`

---

### Global Search

- **Purpose:** Search across all five primary searchable entities (Person, Work, Project, Event, Organization) at once.
- **Package:** Search
- **HTTP Method:** GET
- **Route:** `/api/search`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** `q` (required), `page`, `pageSize`, `categoryId`, `tagId`
- **Request Body:** None
- **Validation Rules:** `q` non-empty, capped at a reasonable maximum length (abuse prevention — specific number is a Package 11/Security Hardening concern, per Packages Specification Package 09 §15).
- **Success Response:** `200 { "data": [ { "entityType": "...", "id": "...", "title"/"name": "...", "verificationStatus": "...", ... } ], "meta": { pagination } }` — a mixed-type result list, each item tagged with its `entityType`.
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR` (empty/too-long query), `500 INTERNAL_ERROR`.
- **Business Rules:** `status='published'`, `visibility='public'` only; ranking = exact match → verified status → relevance (Search Architecture, Phase 3).
- **Notes:** Bilingual: matches against both `_ar` and `_en` fields regardless of the query's own language.

### Archive Search

- **Purpose:** Search scoped to Work/Project/Event only (the "Archive" content entities, excluding People and Organizations).
- **Package:** Search
- **HTTP Method:** GET
- **Route:** `/api/search/archive`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** Same as Global Search
- **Request Body:** None
- **Validation Rules:** Same as Global Search.
- **Success Response:** Same shape as Global Search, `entityType` restricted to `works`/`projects`/`events`.
- **Error Responses / HTTP Status Codes:** Same as Global Search.
- **Business Rules:** Same visibility filter and ranking as Global Search.
- **Notes:** This is a convenience scoping of the same underlying index — not a separate search technology.

### Media Search

- **Purpose:** Search Media assets by caption.
- **Package:** Search
- **HTTP Method:** GET
- **Route:** `/api/search/media`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** `q`, `page`, `pageSize`, `mediaType`
- **Request Body:** None
- **Validation Rules:** Same as Global Search.
- **Success Response:** `200 { "data": [...media_asset results], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** Same as Global Search.
- **Business Rules:** Published+public only.
- **Notes:** `media_asset` is **not** one of the five entities with a dedicated `tsvector` column in Search Readiness (Database Architecture §16) — it is discoverable *through* its owning Work/Person/Project/Event per that section's design. This endpoint performs a simpler direct caption match (`ILIKE`-equivalent) rather than ranked full-text search, and is documented as a lighter-weight capability than Global/Archive Search for that reason — not an oversight, but a direct consequence of Search Readiness's own scoping.

### Organization Search

- **Purpose:** Search Organizations by name.
- **Package:** Search
- **HTTP Method:** GET
- **Route:** `/api/search/organizations`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** `q`, `page`, `pageSize`
- **Request Body:** None
- **Validation Rules:** Same as Global Search.
- **Success Response:** `200 { "data": [...organization results], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** Same as Global Search.
- **Business Rules:** Published+public only; full `tsvector` ranking applies (Organization is one of the five primary searchable entities).
- **Notes:** None.

### CMS Search (Admin)

- **Purpose:** Search across any entity type, unfiltered by status, for Administrator use within CMS/Contacts & Organizations list views.
- **Package:** Search
- **HTTP Method:** GET
- **Route:** `/api/search/cms`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** `q`, `entityType` (required — scoped to one type at a time, matching CMS's per-entity-type list views), `page`, `pageSize`, `status`, `verificationStatus`
- **Request Body:** None
- **Validation Rules:** `entityType` must be a valid CMS-managed type (03 - CMS API's enum, plus `organizations`).
- **Success Response:** `200 { "data": [...results, any status], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`, `422 VALIDATION_ERROR` (missing/invalid `entityType`).
- **Business Rules:** Not filtered by `status`/`visibility` — Administrators search everything they can already see (Packages Specification Package 09 §12).
- **Notes:** This is the same query capability CMS's own List Entities endpoint already exposes via its `q` parameter (03 - CMS API) — documented here as well because it was explicitly requested as a distinct item ("CMS Search"), not because it is a second, different implementation.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 09; Search Architecture (Phase 3); Database Architecture (Frozen v1) §16
