# AHR Platform v1 — CMS API

**Status:** 🔒 Frozen

Base path: `/api/cms/{entityType}`, where `entityType` ∈ `{ persons, works, projects, events, awards, categories, tags, contributions, press-mentions }` — the entities Packages Specification Package 02 authors, plus `press-mentions` (added here per the Final Consistency Review below). Per API Conventions (doc 15), the generic family is specified once below, followed by entity-specific differences.

---

## Generic Entity Family (applies to every `entityType` above)

### List Entities

- **Purpose:** Return a paginated, filterable list of a given entity type, across all statuses.
- **Package:** CMS
- **HTTP Method:** GET
- **Route:** `/api/cms/{entityType}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `entityType` (enum above)
- **Query Parameters:** `page`, `pageSize` (01 - API Standards); `status`, `verificationStatus` (filters); `q` (free-text admin search, shared logic with 10 - Search API)
- **Request Body:** None
- **Validation Rules:** `entityType` must be one of the allowed values, else `404 NOT_FOUND` (unrecognized resource, not a validation error on a field).
- **Success Response:** `200 { "data": [ ...entities ], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`, `404 NOT_FOUND` (bad `entityType`).
- **Business Rules:** No status filter applied by default — Administrators see Draft through Archived (unlike public Website/Search).
- **Notes:** None.

### Get Entity

- **Purpose:** Return one entity by id, including its relationships (Contributions, Media, Taxonomy) where applicable.
- **Package:** CMS
- **HTTP Method:** GET
- **Route:** `/api/cms/{entityType}/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `entityType`, `id` (uuid)
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** `id` must be a valid uuid.
- **Success Response:** `200 { "data": { ...entity, relationships... } }`
- **Error Responses / HTTP Status Codes:** `401`, `404 NOT_FOUND` (no such id).
- **Business Rules:** None beyond standard read.
- **Notes:** None.

### Create Entity

- **Purpose:** Create a new entity in `draft` status.
- **Package:** CMS
- **HTTP Method:** POST
- **Route:** `/api/cms/{entityType}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `entityType`
- **Query Parameters:** None
- **Request Body:** Entity-specific fields (see table below) — always includes both `_ar`/`_en` field pairs where applicable.
- **Validation Rules:** Required fields per entity (table below); constrained-value fields (e.g. `workType`) checked against their allowed set (Database Architecture §6–§8).
- **Success Response:** `201 { "data": { ...created entity, "status": "draft" } }`
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR`, `401`.
- **Business Rules:** New rows always start in `draft`; caller cannot set `status` on creation.
- **Notes:** `ownerId`/`createdBy`/`updatedBy` are set server-side from the session, never client-supplied.

### Update Entity

- **Purpose:** Partially update an existing entity's fields (not its status — see Transition below).
- **Package:** CMS
- **HTTP Method:** PATCH
- **Route:** `/api/cms/{entityType}/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `entityType`, `id`
- **Query Parameters:** None
- **Request Body:** Any subset of the entity's editable fields.
- **Validation Rules:** Same field-level rules as Create, applied only to fields present in the request.
- **Success Response:** `200 { "data": { ...updated entity } }`
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR`, `404 NOT_FOUND`, `401`.
- **Business Rules:** `status` is rejected if present in this request body (`422`, with a message directing the caller to the Transition endpoint) — this is deliberate, not an oversight.
- **Notes:** None.

### Transition Status

- **Purpose:** Move an entity to its next (or a permitted) lifecycle stage.
- **Package:** CMS
- **HTTP Method:** POST
- **Route:** `/api/cms/{entityType}/{id}/transition`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `entityType`, `id`
- **Query Parameters:** None
- **Request Body:** `{ "toStatus": "review" | "verified" | "published" | "archived" }`
- **Validation Rules:** `toStatus` must be a valid next state from the entity's current `status` (Entity Lifecycles & State Transitions, Phase 6) — no skipping.
- **Success Response:** `200 { "data": { ...entity, "status": "<toStatus>" } }`
- **Error Responses / HTTP Status Codes:** `409 INVALID_STATUS_TRANSITION`, `422 MISSING_CONTRIBUTION` (Work/Project/Event → published without a Contribution), `401`, `404`.
- **Business Rules:** Every successful transition writes an `entity_state_transition` row automatically (Database Architecture §2).
- **Notes:** If the entity has an open `moderation_report`, the response still succeeds but includes a `meta.warning` field surfacing that fact — it does not block the transition outright in V1 (this specific interaction was not resolved as a hard block anywhere in the frozen documents, and is noted rather than assumed here).

### Assign Taxonomy (Work/Project only)

- **Purpose:** Attach or detach Category/Tag associations.
- **Package:** CMS
- **HTTP Method:** POST
- **Route:** `/api/cms/{entityType}/{id}/taxonomy`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `entityType` (`works` or `projects` only — see Database Architecture §2, join tables exist only for these two), `id`
- **Query Parameters:** None
- **Request Body:** `{ "categoryIds": [uuid], "tagIds": [uuid] }` — full replacement of the current set, not incremental add/remove.
- **Validation Rules:** Each `categoryId`'s `domain` must match the entity type (`work_type` categories only on Works, `project_type` only on Projects) — else `TAXONOMY_DOMAIN_MISMATCH`.
- **Success Response:** `200 { "data": { "categoryIds": [...], "tagIds": [...] } }`
- **Error Responses / HTTP Status Codes:** `422 TAXONOMY_DOMAIN_MISMATCH`, `401`, `404`.
- **Business Rules:** None beyond domain scoping.
- **Notes:** Calling this on `persons`, `events`, `awards`, `contributions` returns `404 NOT_FOUND` — no taxonomy join exists for those (Database Architecture §2).

---

## Entity-Specific Differences

| Entity | Extra required fields | Extra validation |
|---|---|---|
| `persons` | `nameAr`, `nameEn` | None beyond generic |
| `works` | `titleAr`, `titleEn`, `workType` | `workType` from the fixed set; publish requires ≥1 Contribution; `parentWorkId` (optional) checked for multi-hop cycles (Packages Specification Package 04 §18) |
| `projects` | `titleAr`, `titleEn`, `projectType` | `projectType` from the fixed set |
| `events` | `titleAr`, `titleEn` | None beyond generic |
| `awards` | `titleAr`, `titleEn`, `organizationId` | `organizationId` required (Database Architecture §4 — Award always has a granting Organization) |
| `categories` | `nameAr`, `nameEn`, `domain` | `parentId` (optional) checked for self-reference |
| `tags` | `nameAr`, `nameEn` | None beyond generic |
| `contributions` | `personId`, at least one of `workId`/`projectId`/`eventId`, `role` | `MISSING_CONTRIBUTION`-shape validation: at least one target required (Data Integrity Rules, Phase 4) |
| `press-mentions` | `publicationName`, exactly one of `personId`/`workId`/`eventId`/`organizationId` | `OWNER_CONSTRAINT_VIOLATION`-shape validation: exactly one subject required (Data Integrity Rules, Phase 4) — same pattern as `media_asset`; **Taxonomy assignment does not apply** to this entity (no join table exists for it, same as Person/Event/Award) |

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 02, Package 04; Database Architecture (Frozen v1) §2–§8
