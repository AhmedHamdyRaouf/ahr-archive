# AHR Platform v1 — File Upload Rules

**Status:** 🔒 Frozen

## Scope

Applies to Media Library (Package 08) uploads — the only file-upload surface in V1.

## Owner-First Rule

No upload begins server-side processing until exactly one owner entity (`personId`/`workId`/`projectId`/`eventId`) is confirmed present in the request — enforced in code before the file is even written to Storage, not just checked after (Media Library API §"Upload," Database Architecture §9 `chk_media_asset_owner_present`).

## Storage Path Construction

`media/{ownerType}/{ownerId}/{assetId}.{ext}` — constructed by one shared function, never inline per call site (Database Architecture §11, Coding Standards). The path is never derived from the file's original name or the entity's slug.

## Allowed Types

`image`, `audio`, `video` only (`chk_media_asset_type`) — validated both client-side (fast feedback) and server-side (authoritative), never client-side only.

## Size Limits

A maximum file size is enforced server-side before the upload is accepted (specific number is a deployment/infrastructure configuration concern, not fixed in this architecture-level document — see Performance Guidelines, doc 15, for the general principle).

## Replace, Don't Overwrite Silently

`PUT /api/media/{id}/file` (Replace File) writes a new Storage object at a new path and updates `storage_path` — it never overwrites the existing object in place, preserving the old file per Media Versioning Strategy (Database Architecture §11.1).

## Failure Cleanup

If the file upload succeeds but the `media_asset` row write fails (or vice versa), the operation must be treated as a whole failure and cleaned up — no orphaned Storage object without a database row, and no database row pointing at a Storage object that was never actually written (Packages Specification Package 08 §19).

## Signed URLs

Restricted/hidden assets are never served via a permanent public URL — only a short-lived signed URL, generated on request (Media Library API §"Preview"/"Download"), matching the asset's `visibility` field.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Database Architecture (Frozen v1) §9/§11/§11.1, Media Library API (API Specification 09)
