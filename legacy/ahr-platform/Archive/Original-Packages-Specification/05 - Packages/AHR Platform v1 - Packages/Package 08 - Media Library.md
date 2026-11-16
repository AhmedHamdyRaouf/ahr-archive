# Package 08 — Media Library

**Status:** 🟡 Working — pending review
**Package Type:** Admin tool + supporting service (Supabase Storage integration)

## 1. Package Overview

Manages `media_asset` rows and their underlying files in Supabase Storage — upload, linking to exactly one owning entity, captioning, and lifecycle. Implements Media Storage Structure and Media Versioning Strategy (Database Architecture §11).

## 2. Objectives

- Provide one place to upload and manage media files, enforcing the "exactly one owner" rule at the UI level (backed by the database `check` constraint underneath).
- Serve public media directly and restricted/hidden media only via signed URLs.

## 3. Scope

**In scope:** Upload, caption (bilingual), owner-entity linking (Person/Work/Project/Event), lifecycle, public Media page data source (consumed by Package 03).
**Out of scope:** File versioning implementation (documented as a future seam only, Database Architecture §11.1 — not built in V1); video/audio transcoding (files are stored and served as uploaded).

## 4. Features

- Upload a file to Supabase Storage under `media/{entity_table}/{entity_id}/{asset_id}.{ext}`.
- Link the resulting `media_asset` row to exactly one of Person/Work/Project/Event.
- Bilingual caption fields.
- Lifecycle status (Draft→...→Published/Archived), same shared mechanism as every other entity (Package 04).
- Signed URL generation for restricted/hidden assets.

## 5. User Stories

- As the Administrator, I can upload an image and attach it to a specific Work.
- As the Administrator, I cannot accidentally attach one media file to two different entities.
- As a visitor, I can see public media on the Media page and inside Work/Project detail pages.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Upload UI must require selecting exactly one owner entity before the asset can be saved. |
| FR-2 | Public asset URLs must be directly servable; restricted/hidden assets must only be reachable via a signed URL issued after an RLS-equivalent check. |
| FR-3 | The system must never allow two owner fields (e.g. both `person_id` and `work_id`) to be set simultaneously — matching `chk_media_asset_owner_present`. |

## 7. Non-Functional Requirements

- Upload should handle reasonably large files (images/audio/video) without blocking the rest of the CMS UI.
- Storage path must never change on caption edits — only on replacement (Media Versioning Strategy, §11.1 of the Database Architecture).

## 8. Pages

| Page | Path | Notes |
|---|---|---|
| Media Library | `/{locale}/dashboard/media` | Grid/list of all `media_asset` rows, filterable by type/owner/status |
| Upload | `/{locale}/dashboard/media/upload` | Single-owner selection + file upload |
| Asset detail/edit | `/{locale}/dashboard/media/[id]` | Caption, owner, lifecycle |

## 9. Components

- `MediaGrid`
- `MediaUploadForm` (owner-entity picker, single-select by design — not multi-select, per FR-3)
- `MediaAssetDetail`

## 10. Navigation Flow

```
Dashboard shell → Media Library → Upload → (owner picked, file selected) → asset created (draft)
                                → Asset detail → lifecycle transitions → Published
```

## 11. Complete Workflow

```
① Administrator selects an owner entity (Person/Work/Project/Event) and a file
② File uploads to Supabase Storage at media/{entity_table}/{entity_id}/{asset_id}.{ext}
③ media_asset row created (draft), storage_path recorded
④ Administrator captions, moves through lifecycle to Published
⑤ Public pages (Package 03) render published+public assets directly;
   restricted/hidden assets are never rendered publicly at all
```

## 12. Roles & Permissions

Administrator only for upload/edit. Visitors can view public assets (via Package 03), never through this package's own pages.

## 13. Database Tables Used

`media_asset` (read/write, full lifecycle).

## 14. APIs Required

- `uploadMedia(ownerEntity, ownerId, file, captions)` — Server Action, writes to Storage then `media_asset`.
- `getSignedUrl(mediaAssetId)` — for restricted/hidden assets only.
- Shared lifecycle transition function (from Package 04).

## 15. Validation Rules

- Exactly one owner field set (UI enforces single-select; database `check` constraint is the backstop).
- File type restricted to `image`/`audio`/`video` per `chk_media_asset_type`.

## 16. Business Rules

- Media Storage Structure (Database Architecture §11): one bucket, path keyed by `entity_table`/`entity_id`, never by slug.
- No Hard Delete extends to files: archiving a `media_asset` does not delete the underlying Storage object (§10 of the Database Architecture, applied to files).

## 17. Security Considerations

- Signed URLs for restricted/hidden content expire; they are not permanent public links.
- Upload size/type limits enforced server-side, not just via client-side form validation.

## 18. Edge Cases

- Replacing a file (future versioning seam, §11.1) — in V1, "replace" means uploading a new object and updating `storage_path`; the old object is not deleted (forward-compatible with future version history).
- Deleting the owning entity — blocked by `ON DELETE RESTRICT` (Database Architecture §4); the UI should explain why an entity with attached media can't be removed, rather than surfacing a raw database error.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Upload failure (network/storage error) | Clear retry option; no partial `media_asset` row left behind without a corresponding file |
| Unsupported file type | Rejected client-side and server-side, with a clear message |

## 20. Acceptance Criteria

- [ ] Upload requires exactly one owner and succeeds end to end.
- [ ] Public assets are directly viewable; restricted/hidden assets require a signed URL.
- [ ] Attempting to set two owners is impossible through the UI and rejected by the database if bypassed.

## 21. Dependencies

- **Depends on:** Package 04 (Archive, for owner-entity validation and lifecycle), Database Architecture (Frozen v1) §11.
- **Depended on by:** Package 03 (Website renders media), Package 02 (CMS forms can link existing media to an entity being edited).

## 22. Future Improvements (Post v1)

- File versioning (`media_asset_version` table, per Database Architecture §11.1 — documented seam, not yet built).
- Image transformation/resizing pipeline.
- Bulk upload.

## 23. Testing Checklist

- [ ] Upload with each owner entity type (Person/Work/Project/Event).
- [ ] Two-owner attempt is rejected.
- [ ] Signed URL works for restricted assets and expires appropriately.
- [ ] Archiving an asset does not delete the underlying file.

## 24. UX Notes

- Owner selection should happen before or alongside file selection, not as an afterthought — prevents orphaned uploads.

## 25. Developer Notes

- Storage path construction is one shared function, not duplicated per upload call site (Coding Standards).

---

**Status:**
🟡 Working

**Package:**
08 — Media Library

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 04 (Archive), Database Architecture (Frozen v1) §11/§11.1, Data Integrity Rules (Phase 4)
