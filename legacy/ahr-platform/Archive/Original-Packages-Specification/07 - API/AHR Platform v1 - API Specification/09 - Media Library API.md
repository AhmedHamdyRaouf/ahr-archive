# AHR Platform v1 — Media Library API

**Status:** 🔒 Frozen, **Version History is Specified but Blocked — see the gap note below**

Base path: `/api/media`

---

### Upload

- **Purpose:** Upload a file and create the corresponding `media_asset` row, linked to exactly one owner.
- **Package:** Media Library
- **HTTP Method:** POST
- **Route:** `/api/media`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: multipart/form-data`, session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** `file` (binary), `ownerType` (`persons`/`works`/`projects`/`events`), `ownerId` (uuid), `captionAr`?, `captionEn`?
- **Validation Rules:** Exactly one owner reference provided (enforced here in addition to the database `check` constraint, per Packages Specification Package 04 §15 "validated in code first"); `mediaType` inferred/validated against `image`/`audio`/`video`.
- **Success Response:** `201 { "data": { ...media_asset, "status": "draft", "storagePath": "media/{ownerType}/{ownerId}/{assetId}.{ext}" } }`
- **Error Responses / HTTP Status Codes:** `422 OWNER_CONSTRAINT_VIOLATION` (zero or multiple owners), `422 VALIDATION_ERROR` (unsupported file type), `401`.
- **Business Rules:** Path construction follows Database Architecture §11 exactly — keyed by owner, not by slug.
- **Notes:** Upload failure must not leave an orphaned database row without a corresponding file (Packages Specification Package 08 §19).

### Delete (Archive Semantics)

- **Purpose:** Remove a media asset from active use.
- **Package:** Media Library
- **HTTP Method:** DELETE
- **Route:** `/api/media/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200 { "data": { "id": "...", "status": "archived" } }` for any asset that has ever been published; `204 No Content` (true removal, file and row both deleted) only if the asset has never left `draft` status.
- **Error Responses / HTTP Status Codes:** `404`, `401`.
- **Business Rules:** **This is not a hard delete for any previously-published asset** — per No Hard Delete (Phase 1/4) and Database Architecture §7/§10, `DELETE` on a published-or-was-published asset performs the same effect as a `transition` to `archived`, never a row/file removal. This distinction is deliberately spelled out here because `DELETE` as an HTTP verb name otherwise implies removal, and this endpoint's actual behavior would surprise a developer who only read the verb.
- **Notes:** There is no separate `POST /{id}/transition` endpoint for media (unlike CMS/Organizations) — `DELETE` and un-archiving (via Update Metadata's `status` field, see below) cover the full lifecycle for this specific resource, since Media's lifecycle is simpler (no Review/Verified intermediate gate specified beyond the shared Data Lifecycle stages already implied).

### Update Metadata

- **Purpose:** Update captions and lifecycle status.
- **Package:** Media Library
- **HTTP Method:** PATCH
- **Route:** `/api/media/{id}`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** `{ "captionAr"?: string, "captionEn"?: string, "status"?: "draft" | "review" | "verified" | "published" }`
- **Validation Rules:** `status` changes still validated against the standard sequence (Entity Lifecycles & State Transitions, Phase 6) even though it's accepted via `PATCH` here rather than a dedicated transition endpoint, given media's simpler lifecycle interactions — this is a deliberate, narrow deviation from the `01 - API Standards` "status only via transition endpoint" rule, called out explicitly rather than silently applied.
- **Success Response:** `200 { "data": { ...updated media_asset } }`
- **Error Responses / HTTP Status Codes:** `409 INVALID_STATUS_TRANSITION`, `422 VALIDATION_ERROR`, `404`, `401`.
- **Business Rules:** Owner fields (`personId`/`workId`/`projectId`/`eventId`) are not editable via this endpoint — re-assigning ownership is not specified in V1 (would require a dedicated, carefully-validated endpoint given the "exactly one owner" constraint; not built here since it wasn't requested).
- **Notes:** None.

### Replace File

- **Purpose:** Upload a new file version for an existing `media_asset`, per Media Versioning Strategy (Database Architecture §11.1).
- **Package:** Media Library
- **HTTP Method:** PUT
- **Route:** `/api/media/{id}/file`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: multipart/form-data`, session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** `file` (binary)
- **Validation Rules:** Same file-type validation as Upload.
- **Success Response:** `200 { "data": { "id": "...", "storagePath": "<new path>" } }`
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR`, `404`, `401`.
- **Business Rules:** The old file is **not deleted** from Storage when replaced (Database Architecture §11.1) — this preserves the seam for future version history even though no `media_asset_version` row is created yet in V1 (see gap note below). `media_asset.id` never changes.
- **Notes:** This is the one place V1's behavior is already forward-compatible with future versioning without itself implementing history retrieval.

### Download

- **Purpose:** Retrieve the actual file bytes for a media asset.
- **Package:** Media Library
- **HTTP Method:** GET
- **Route:** `/api/media/{id}/download`
- **Authentication Required:** Conditional — No for public assets, Yes for restricted/hidden
- **Required Role:** Administrator (restricted/hidden only); none for public
- **Request Headers:** Session cookie (restricted/hidden only)
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200`, binary file stream with appropriate `Content-Disposition`.
- **Error Responses / HTTP Status Codes:** `403 FORBIDDEN` (restricted/hidden asset, no/insufficient session), `404`.
- **Business Rules:** Visibility check mirrors the database row's `visibility` field (Database Architecture §8, mirrored at the Storage layer per §11).
- **Notes:** For restricted/hidden assets, this endpoint issues a redirect to a short-lived signed URL rather than proxying the file itself, per Packages Specification Package 08 §14.

### Preview

- **Purpose:** Return a signed, time-limited URL for previewing a restricted/hidden asset without downloading it.
- **Package:** Media Library
- **HTTP Method:** GET
- **Route:** `/api/media/{id}/preview`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** `id`
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200 { "data": { "previewUrl": "...", "expiresAt": "<ISO 8601>" } }`
- **Error Responses / HTTP Status Codes:** `404`, `401`.
- **Business Rules:** Public assets don't need this endpoint at all — their URL is already directly usable from List/Detail responses (Database Architecture §11).
- **Notes:** None.

---

## Specified but Blocked — Schema Gap

**No `media_asset_version` table exists in the Frozen v1 Database Architecture** — it was documented only as a future design seam (§11.1), not built.

| Requested endpoint | Blocked because |
|---|---|
| `GET /api/media/{id}/versions` (Version History list) | No `media_asset_version` table |
| `GET /api/media/{id}/versions/{versionId}` (single past version) | Same |

The Replace File endpoint above already behaves in a version-history-compatible way (old files are never deleted from Storage) — only the *retrieval* of that history is blocked, not the underlying safety of the replace operation itself.

---

**Status:** 🔒 Frozen — schema gap unresolved (Version History only); one deliberate deviation noted in Update Metadata
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 08; Database Architecture (Frozen v1) §11/§11.1
