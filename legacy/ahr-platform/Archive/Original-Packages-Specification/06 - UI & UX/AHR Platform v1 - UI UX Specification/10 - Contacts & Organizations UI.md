# AHR Platform v1 — Contacts & Organizations UI

**Status:** 🟡 Working — pending review, **UI for several requested fields is blocked by the same schema gap noted in Packages Specification Package 05 §13**

## 1. Purpose
Give the Administrator a place to manage Organizations and see their relationships to other Archive entities, per Packages Specification Package 05.

## 2. User Types
Administrator only.

## 3. Entry Points
Dashboard Sidebar → Contacts & Organizations.

## 4. Screen List
Organization List, Organization Detail/Edit (with a Related Records panel).

## 5. Screen Hierarchy
```
Contacts & Organizations
└── Organization List → Organization Detail/Edit
```

## 6. Navigation Flow
See User Flows doc 05, §10.

## 7. User Journey
Administrator opens the list, filters by status, creates or opens an Organization, edits bilingual name/description, transitions its lifecycle, and reviews its Related Records.

## 8. Wireframe Description
List: filter bar + Table. Detail: form on the left, Related Records panel (grouped by Award/Project/Event/Press Mention) on the right/below.

## 9. Layout Structure
`FilterBar` + `EntityListTable` (list); `OrganizationForm` + `RelatedRecordsPanel` (detail).

## 10. Components Used
Table, Badge (status/verification), Card (within Related Records groupings), Alert (for the "cannot archive — referenced by a Published Award" warning, Packages Specification Package 05 §16).

## 11. Tables
Organization List: Name (bilingual), Status, Verification, Related-record count, Updated date, Actions.

## 12. Cards
Related Records panel groups results as small cards per related entity (an Award card, a Project card, etc.), each linking into its own module's edit screen (CMS).

## 13. Forms
`OrganizationForm`: `name_ar`/`name_en`, `description_ar`/`description_en`, lifecycle controls. **Contact information, internal notes, external links, and Tag/Category assignment fields are NOT present in this form in V1** — per the schema gap documented in Packages Specification Package 05 §13. The form does not show empty, non-functional inputs for these (UX Notes, Package 05 §24) — they are simply absent until the schema gap is resolved.

## 14. Buttons
Primary: Save, Publish. Destructive: Archive (blocked with an explanatory Alert if the Organization is still referenced by a Published Award, rather than a raw error).

## 15. Filters
Status, Verification Status. **No Tag/Category filter** — no such join exists for Organizations in V1 (schema gap).

## 16. Search Experience
Inline admin search across Organizations (shared Search logic, doc 14) — searches `name_ar`/`name_en` only, since no notes/tags exist to search.

## 17. Empty States
Zero Organizations: "No organizations yet" + Create button. Related Records panel with zero results: "No related records yet" (normal for a newly created Organization, not an error).

## 18. Loading States
Standard Table/skeleton loading, consistent with CMS UI (doc 07, §18).

## 19. Error States
Standard field validation; the archive-blocked-by-reference case (§13/§14 above) is the one Organization-specific error worth calling out.

## 20. Success States
Toast on save; visible status-badge update on transition.

## 21. Responsive Behaviour
Detail screen's two-column (form + Related Records) layout stacks vertically on Tablet/Mobile, form first (Responsive Rules, doc 04).

## 22. Accessibility Notes
Related Records panel's grouped cards must be reachable via keyboard/screen reader in a logical group-by-group order, not a flattened list that loses the Award/Project/Event/Press Mention grouping context.

## 23. Permissions
Administrator-only (Database Architecture §7).

## 24. UX Rules
Never silently drop a requested feature — Contact Info/Notes/Tags are documented as absent, not partially faked with disabled or non-functional fields.

## 25. Future Improvements
Contact info, internal notes, external links, and Tag/Category assignment — all pending the Database Architecture Review Round 2 recommended in Packages Specification Package 05 §22.

---

**Status:** 🟡 Working — schema gap unresolved (see §13)
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 05, Package 04
