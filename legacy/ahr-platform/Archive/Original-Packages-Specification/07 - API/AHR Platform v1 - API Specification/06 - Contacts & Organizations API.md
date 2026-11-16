# AHR Platform v1 — Contacts & Organizations API

**Status:** 🔒 Frozen, **contact info/notes/tags endpoints are Specified but Blocked — see the gap note below**

Base path: `/api/organizations`

---

### List Organizations

- **Purpose:** Return a paginated, filterable list of Organizations, across all statuses.
- **Package:** Contacts & Organizations
- **HTTP Method:** GET
- **Route:** `/api/organizations`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** `page`, `pageSize`, `status`, `verificationStatus`, `q`
- **Request Body:** None
- **Validation Rules:** None beyond standard pagination bounds.
- **Success Response:** `200 { "data": [...organizations], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`.
- **Business Rules:** None additional.
- **Notes:** None.

### Get Organization

- **Purpose:** Return a single Organization by id.
- **Package:** Contacts & Organizations
- **HTTP Method:** GET
- **Route:** `/api/organizations/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** `id` must be a valid uuid.
- **Success Response:** `200 { "data": { "nameAr", "nameEn", "descriptionAr", "descriptionEn", "status", "verificationStatus", ... } }`
- **Error Responses / HTTP Status Codes:** `404 NOT_FOUND`, `401`.
- **Business Rules:** None.
- **Notes:** Response includes only the fields that exist in the frozen schema — see the gap note below for what's absent.

### Create Organization

- **Purpose:** Create a new Organization in `draft` status.
- **Package:** Contacts & Organizations
- **HTTP Method:** POST
- **Route:** `/api/organizations`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** `{ "nameAr": string, "nameEn": string, "descriptionAr"?: string, "descriptionEn"?: string }`
- **Validation Rules:** `nameAr`/`nameEn` required.
- **Success Response:** `201 { "data": { ...created org, "status": "draft" } }`
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR`, `401`.
- **Business Rules:** Starts in `draft`, same as every entity (Entity Lifecycles & State Transitions, Phase 6).
- **Notes:** None.

### Update Organization

- **Purpose:** Update an Organization's editable fields.
- **Package:** Contacts & Organizations
- **HTTP Method:** PATCH
- **Route:** `/api/organizations/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** Any subset of `nameAr`/`nameEn`/`descriptionAr`/`descriptionEn`.
- **Validation Rules:** Same as Create, applied to present fields only.
- **Success Response:** `200 { "data": { ...updated org } }`
- **Error Responses / HTTP Status Codes:** `422`, `404`, `401`.
- **Business Rules:** `status` rejected here (use Transition).
- **Notes:** None.

### Transition Organization Status

- **Purpose:** Move an Organization through its lifecycle.
- **Package:** Contacts & Organizations
- **HTTP Method:** POST
- **Route:** `/api/organizations/{id}/transition`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** `{ "toStatus": "..." }`
- **Validation Rules:** Standard transition sequence (Entity Lifecycles & State Transitions, Phase 6).
- **Success Response:** `200 { "data": { ...org, "status": "<toStatus>" } }`
- **Error Responses / HTTP Status Codes:** `409 INVALID_STATUS_TRANSITION`, `409 REFERENCED_BY_OTHER_RECORDS` (archiving an Organization still referenced by a Published Award), `401`, `404`.
- **Business Rules:** Archiving is blocked, not silently allowed, when a Published Award still requires this Organization (Packages Specification Package 05 §16).
- **Notes:** None.

### Get Related Records

- **Purpose:** Return every Award/Project/Event/Press Mention referencing this Organization.
- **Package:** Contacts & Organizations
- **HTTP Method:** GET
- **Route:** `/api/organizations/{id}/related-records`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200 { "data": { "awards": [...], "projects": [...], "events": [...], "pressMentions": [...] } }`
- **Error Responses / HTTP Status Codes:** `404`, `401`.
- **Business Rules:** Read-only aggregation via existing foreign keys (Packages Specification Package 05 §13) — no new relationship table involved.
- **Notes:** An Organization with zero related records returns empty arrays, not an error.

---

## Specified but Blocked — Schema Gap

The following were requested in scope for this package (per Packages Specification Package 05's original brief: contact information, internal notes, external links, tags, categories) but have **no supporting column or join table in the Frozen v1 Database Architecture** (Packages Specification Package 05 §13). No endpoint is invented for them here:

| Requested endpoint | Blocked because |
|---|---|
| `PATCH /api/organizations/{id}/contact-info` | No `contact_details`-equivalent column on `organization` |
| `PATCH /api/organizations/{id}/notes` | No `notes` column on `organization` |
| `POST/DELETE /api/organizations/{id}/tags` | No `organization_tag` join table |
| `POST/DELETE /api/organizations/{id}/categories` | No `organization_category` join table |

These become real, specified endpoints only after the Database Architecture Review Round 2 recommended in Packages Specification Package 05 §22 is completed.

---

**Status:** 🔒 Frozen — schema gap unresolved
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 05, Package 04; Database Architecture (Frozen v1)
