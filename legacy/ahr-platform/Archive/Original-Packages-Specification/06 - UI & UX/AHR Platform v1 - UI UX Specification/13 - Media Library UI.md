# AHR Platform v1 — Media Library UI

**Status:** 🟡 Working — pending review

## 1. Purpose
Let the Administrator upload, caption, link, and manage media files, per Packages Specification Package 08.

## 2. User Types
Administrator only (upload/manage). Visitors view public media only through Website (Package 03), not through this module's own pages.

## 3. Entry Points
Dashboard Sidebar → Media Library; also reachable from within a CMS entity form (linking existing media to the entity being edited).

## 4. Screen List
Media Library grid/list, Upload screen, Asset Detail/Edit.

## 5. Screen Hierarchy
```
Media Library
├── Upload
└── Asset Detail/Edit
```

## 6. Navigation Flow
See User Flows doc 05, §6.

## 7. User Journey
Administrator opens Media Library → filters by type/owner/status → uploads a new file (selecting exactly one owner first) → captions it → moves it through lifecycle to Published.

## 8. Wireframe Description
Grid of thumbnail cards (image/audio/video icon for non-visual types) with status/verification badges overlaid; Upload screen is a focused two-step form (owner selection, then file).

## 9. Layout Structure
`MediaGrid` (list) → `MediaUploadForm` (create) → `MediaAssetDetail` (edit).

## 10. Components Used
`MediaGrid`, `MediaUploadForm`, `MediaAssetDetail`, Badge (status/verification, type), file-upload progress indicator.

## 11. Tables
An optional list-view alternative to the grid, same columns as other CMS list tables plus a thumbnail column.

## 12. Cards
`MediaGrid` cards: thumbnail/type icon, caption excerpt, owner entity name (linked), status badge.

## 13. Forms
Upload: owner-entity picker (single-select, enforced — Packages Specification Package 08 §6 FR-1) + file input. Detail: bilingual caption fields, lifecycle controls.

## 14. Buttons
Primary: Upload, Save. Destructive: Archive.

## 15. Filters
Type (image/audio/video), Owner entity type, Status.

## 16. Search Experience
Caption-based admin search, sharing Search UI's (doc 14) underlying logic where applicable.

## 17. Empty States
"No media yet" + Upload button, for the whole library or for a filtered view with zero matches.

## 18. Loading States
Upload progress indicator during file transfer; standard grid skeleton while loading the library.

## 19. Error States
Upload failure: clear retry option, no orphaned record left without a file (Packages Specification Package 08 §19). Unsupported file type: rejected before upload begins, with a clear message.

## 20. Success States
Toast on successful upload/save; new asset appears in the grid immediately.

## 21. Responsive Behaviour
Grid reflows per Responsive Rules (doc 04); Upload's two-step form stacks naturally at every breakpoint (it's already single-column).

## 22. Accessibility Notes
Every thumbnail/preview has bilingual alt text (from caption fields) reachable by screen readers, matching what's used on the public Website.

## 23. Permissions
Administrator-only for all upload/edit screens; public viewing only occurs via Website, never via this module's own UI.

## 24. UX Rules
Owner selection happens before or alongside file selection, never as an afterthought (Packages Specification Package 08 §24) — prevents orphaned, unowned uploads.

## 25. Future Improvements
File versioning UI (once `media_asset_version`, Database Architecture §11.1, is built); bulk upload; image transformation controls.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 08, Package 04; Database Architecture (Frozen v1) §11
