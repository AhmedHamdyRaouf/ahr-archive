# AHR Platform v1 — Archive UI

**Status:** 🟡 Working — pending review

## 1. Purpose
Document, honestly, that Archive (Packages Specification Package 04) is a domain/service layer with **no UI screens of its own** — its "interface" is expressed entirely through CMS (Package 02, authoring) and Website (Package 03, presentation). This document exists to satisfy the requested output structure and to make that boundary explicit, not to invent screens where none exist.

## 2. User Types
None directly — Archive has no direct users. Its consumers are other packages.

## 3. Entry Points
N/A.

## 4. Screen List
None.

## 5. Screen Hierarchy
N/A.

## 6. Navigation Flow
N/A.

## 7. User Journey
N/A — see CMS UI (doc 07) and Website UI (doc 08) for the actual journeys built on top of Archive.

## 8. Wireframe Description
N/A.

## 9. Layout Structure
N/A.

## 10. Components Used
None owned by this module. The shared entity-shape conventions (bilingual field pairs, status/verification badges) that CMS and Website both use are documented once, in the Design System (doc 02), precisely so Archive doesn't need its own visual language.

## 11. Tables
N/A (UI sense). In the database sense, see Database Architecture (Frozen v1) §2.

## 12. Cards
N/A.

## 13. Forms
N/A.

## 14. Buttons
N/A.

## 15. Filters
N/A.

## 16. Search Experience
N/A — see Search UI (doc 14), which reads through Archive but is its own module.

## 17. Empty States
N/A.

## 18. Loading States
N/A.

## 19. Error States
Archive's validation errors (Packages Specification Package 04 §19: `MISSING_CONTRIBUTION`, `INVALID_STATUS_TRANSITION`, `TAXONOMY_DOMAIN_MISMATCH`) surface as CMS UI's error states (doc 07, §19) — they are Archive's responsibility to define and CMS's responsibility to display.

## 20. Success States
N/A.

## 21. Responsive Behaviour
N/A.

## 22. Accessibility Notes
N/A.

## 23. Permissions
Archive does not enforce permissions itself (Packages Specification Package 04 §17) — it trusts the calling package/Row Level Security.

## 24. UX Rules
The one rule that matters here, for every other module's UI: **any rule Archive enforces must produce a specific, nameable error** (not a generic failure) so CMS and other consuming UIs can show a meaningful message — this is a UI requirement placed on a non-UI package, which is why it's noted here.

## 25. Future Improvements
None specific to UI — see Packages Specification Package 04 §22 for domain-layer future improvements.

---

**Status:** 🟡 Working — intentionally minimal; this module has no screens
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 04
