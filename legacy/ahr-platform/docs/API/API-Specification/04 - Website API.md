# AHR Platform v1 — Website API

**Status:** 🔒 Frozen

Base path: `/api/website`. Every endpoint here is public (no authentication) and filters strictly to `status='published'` + `visibility='public'`, per Packages Specification Package 03 §16.

---

### Get Home

- **Purpose:** Return aggregated content for the Home page (featured Works, Recognition).
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/home`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None required
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "featuredWorks": [...], "featuredAwards": [...] } }`
- **Error Responses / HTTP Status Codes:** `500 INTERNAL_ERROR`.
- **Business Rules:** Only `isFeatured=true`, published+public rows are included.
- **Notes:** None.

### Get About

- **Purpose:** Return the Foundational Personal Brand's profile content.
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/about`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "nameAr", "nameEn", "bioAr", "bioEn", ... } }`
- **Error Responses / HTTP Status Codes:** `404 NOT_FOUND` (should not occur in practice, but documented — About depends on exactly one designated `person` row existing and published).
- **Business Rules:** None additional.
- **Notes:** None.

### List Works

- **Purpose:** Return published+public Works.
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/works`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** `page`, `pageSize`, `categoryId`, `tagId`
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": [...works], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `500 INTERNAL_ERROR`.
- **Business Rules:** `status='published'`, `visibility='public'` only, enforced server-side and backed by RLS.
- **Notes:** None.

### Get Work Detail

- **Purpose:** Return a single Work with its Contributions and Media.
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/works/{slug}`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** `slug` (`publicId`)
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { ...work, "contributions": [...], "media": [...] } }`
- **Error Responses / HTTP Status Codes:** `404 NOT_FOUND` (invalid slug, or the Work exists but isn't published+public — same response either way, per Error Codes doc 12, to avoid confirming existence of non-public content).
- **Business Rules:** Same visibility filter as List Works.
- **Notes:** None.

### List Projects / Get Project Detail

Identical shape to Works, at `/api/website/projects` and `/api/website/projects/{slug}` — not repeated verbatim here per API Conventions (doc 15)'s "generic family" principle.

### List Media

- **Purpose:** Return published+public Media assets for the Media page.
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/media`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** `page`, `pageSize`, `mediaType`
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": [...media], "meta": { pagination } }`
- **Error Responses / HTTP Status Codes:** `500 INTERNAL_ERROR`.
- **Business Rules:** Published+public only.
- **Notes:** File URLs returned here are always public (Database Architecture §11) — restricted/hidden assets never appear on this endpoint at all, not even with a broken link.

### List Recognition

- **Purpose:** Return published+public Awards with their granting Organization.
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/recognition`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** `page`, `pageSize`
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": [ { ...award, "organization": {...} } ] }`
- **Error Responses / HTTP Status Codes:** `500 INTERNAL_ERROR`.
- **Business Rules:** Published+public only.
- **Notes:** None.

### Get Contact Info

- **Purpose:** Return public contact details for the Contact page.
- **Package:** Website
- **HTTP Method:** GET
- **Route:** `/api/website/contact`
- **Authentication Required:** No
- **Required Role:** None
- **Request Headers:** None
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "contactInformation": {...}, "socialMediaLinks": {...} } }` — sourced from the public-readable subset of `platform_settings` (Database Architecture §8).
- **Error Responses / HTTP Status Codes:** `500 INTERNAL_ERROR`.
- **Business Rules:** Only the publicly-readable `platform_settings` keys are ever exposed here — `aiConfiguration`/`emailConfiguration` are never reachable from this or any public endpoint.
- **Notes:** There is no contact-form submission endpoint in this specification — Packages Specification Package 03 §13 and UI/UX Specification (Website UI, doc 08 §13) both flagged that no such mechanism was defined; this endpoint is read-only display data.

---

**Status:** 🔒 Frozen — Contact page is read-only display data; no submission endpoint exists (flagged, not invented)
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 03, Package 04; Database Architecture (Frozen v1) §8
