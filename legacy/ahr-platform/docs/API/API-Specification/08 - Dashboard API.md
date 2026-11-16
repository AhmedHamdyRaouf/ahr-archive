# AHR Platform v1 — Dashboard API

**Status:** 🔒 Frozen

Base path: `/api/dashboard`

---

### List Settings

- **Purpose:** Return `platform_settings` key-value pairs, optionally filtered by group.
- **Package:** Dashboard
- **HTTP Method:** GET
- **Route:** `/api/dashboard/settings`
- **Authentication Required:** Yes (partial public variant described in Notes)
- **Required Role:** Administrator (for the full set); public callers only ever reach this data through Website's own endpoints (04 - Website API), not this route directly
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** `group` (e.g. `siteInfo`, `seo`, `social`, `aiConfiguration`, `emailConfiguration`, `branding`, `featureFlags`)
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200 { "data": { "<key>": <value>, ... } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`.
- **Business Rules:** `aiConfiguration`/`emailConfiguration` keys are only ever returned to an Administrator session (Database Architecture §8) — this route always requires authentication, unlike Website's own settings-derived endpoints, which pre-filter to the public subset before this route is ever involved.
- **Notes:** None.

### Update Setting

- **Purpose:** Update a single `platform_settings` key.
- **Package:** Dashboard
- **HTTP Method:** PATCH
- **Route:** `/api/dashboard/settings/{key}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `key`
- **Query Parameters:** None
- **Request Body:** `{ "value": <any JSON-compatible shape> }`
- **Validation Rules:** `value`'s shape is validated against the expected shape for that specific `key` (Packages Specification Package 07 §15) — e.g. `maintenanceMode` must be boolean, `socialMediaLinks` must be an object.
- **Success Response:** `200 { "data": { "key": "...", "value": ... } }`
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR` (wrong shape for the key), `404 NOT_FOUND` (unknown key), `401`.
- **Business Rules:** Every successful update writes one `activity_log` row (`action='settings_change'`, `metadata` capturing old/new value).
- **Notes:** New keys can be introduced without an API contract change — the endpoint shape itself doesn't need to know every possible key in advance (Database Architecture §2.3).

### List Activity Log

- **Purpose:** Return a paginated, filterable, read-only activity log.
- **Package:** Dashboard
- **HTTP Method:** GET
- **Route:** `/api/dashboard/activity-log`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** `page`, `pageSize`, `actorId`, `action`, `dateFrom`, `dateTo`
- **Request Body:** None
- **Validation Rules:** None beyond standard pagination bounds.
- **Success Response:** `200 { "data": [...activityLogEntries], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `401`.
- **Business Rules:** Read-only — there is no corresponding write/update/delete endpoint for this resource anywhere in this specification (Database Architecture §8, append-only).
- **Notes:** None.

### List Moderation Reports

- **Purpose:** Return moderation reports, filterable by status.
- **Package:** Dashboard
- **HTTP Method:** GET
- **Route:** `/api/dashboard/moderation-reports`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** `page`, `pageSize`, `status` (`open`/`in_review`/`escalated`/`resolved`)
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200 { "data": [...reports], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `401`.
- **Business Rules:** None additional.
- **Notes:** None.

### Get Moderation Report

- **Purpose:** Return a single moderation report's detail.
- **Package:** Dashboard
- **HTTP Method:** GET
- **Route:** `/api/dashboard/moderation-reports/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** `id` valid uuid.
- **Success Response:** `200 { "data": { ...report, "entitySnapshot": {...} } }` — `entitySnapshot` resolves `entityTable`/`entityId` to the entity's current state, even if that entity is now archived (Packages Specification Package 07 §18).
- **Error Responses / HTTP Status Codes:** `404`, `401`.
- **Business Rules:** None additional.
- **Notes:** None.

### Transition Moderation Report

- **Purpose:** Move a moderation report through its own status sequence.
- **Package:** Dashboard
- **HTTP Method:** POST
- **Route:** `/api/dashboard/moderation-reports/{id}/transition`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** `{ "toStatus": "in_review" | "escalated" | "resolved", "resolutionNotes"?: string }`
- **Validation Rules:** `toStatus` must follow `open → in_review → escalated → resolved` (its own sequence, distinct from content `status` — Database Architecture §2.2); `resolutionNotes` required when `toStatus='resolved'`.
- **Success Response:** `200 { "data": { ...report, "status": "<toStatus>" } }`
- **Error Responses / HTTP Status Codes:** `409 INVALID_STATUS_TRANSITION`, `422 VALIDATION_ERROR` (missing `resolutionNotes` on resolve), `401`, `404`.
- **Business Rules:** Moderation Logic (Phase 6) sequence enforced.
- **Notes:** None.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 07; Database Architecture (Frozen v1) §2.3/§2.4/§8
