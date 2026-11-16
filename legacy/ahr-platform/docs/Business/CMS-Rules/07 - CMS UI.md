# AHR Platform v1 — CMS UI

**Status:** 🟡 Working — pending review

## 1. Purpose
Give the Administrator a consistent authoring surface for every Archive entity (Person, Work, Project, Event, Contribution, Award, Category, Tag), per Packages Specification Package 02.

## 2. User Types
Administrator only.

## 3. Entry Points
Dashboard Sidebar → CMS → entity type.

## 4. Screen List
- Entity List (one per entity type: People, Works, Projects, Events, Awards, Categories, Tags)
- Entity Create/Edit form (one shared shape, per entity type)
- Category Manager (tree view)
- Tag Manager (flat list)

## 5. Screen Hierarchy
```
CMS
├── People → [create/edit]
├── Works → [create/edit] (tabs: Details | Contributions | Media)
├── Projects → [create/edit]
├── Events → [create/edit]
├── Awards → [create/edit]
├── Categories (tree)
└── Tags (flat list)
```

## 6. Navigation Flow
See User Flows doc 05, §7.

## 7. User Journey
Administrator opens an entity list → filters by status if needed → opens or creates a record → edits bilingual fields → attaches required relationships (e.g. Contribution) → transitions status step by step → publishes.

## 8. Wireframe Description
List screens: a filter bar (status, verification, search) above a Table. Edit screens: a two-column layout on Desktop — primary fields left, status/lifecycle/relationships panel right (sticky).

## 9. Layout Structure
List: `FilterBar` + `EntityListTable` + `Pagination`. Edit: `EntityForm` (main column) + `StatusTransitionControl` + `ContributionPicker`/`TaxonomyPicker` (side panel).

## 10. Components Used
Table, Filter controls (Select, Checkbox), Badge (status/verification), Card (in Category tree nodes), Tabs (Work editor), Dialog (status transition confirmation), Alert (open moderation report warning), Toast (save confirmation).

## 11. Tables
Entity List tables: columns = Name/Title (bilingual, current-locale shown with a toggle), Type (where applicable), Status badge, Verification badge, Updated date, Actions.

## 12. Cards
Category tree nodes rendered as nested cards/rows, not a raw indented list, to keep touch targets clear on Tablet.

## 13. Forms
`EntityForm`: bilingual field pairs, entity-specific fields (e.g. `work_type` Select, `year` input), `ContributionPicker`, `TaxonomyPicker`, `CompoundWorkEditor` (Work only).

## 14. Buttons
Primary: Save, Publish. Secondary: Save as Draft, Cancel. Destructive: Archive (always behind a confirmation Dialog).

## 15. Filters
Status, Verification Status, Category/Tag, free-text admin search (Package 09, embedded here — not a separate page).

## 16. Search Experience
Inline search box atop each Entity List, searching across all statuses (unlike public search) — see Search UI (doc 14) for the shared search logic.

## 17. Empty States
Entity List with zero records: "No {Entity} yet" + a prominent Create button, not a bare empty table.

## 18. Loading States
Table shows a skeleton/placeholder row set while loading; Save button shows a loading state and disables during submission.

## 19. Error States
Field-level validation errors inline; status-transition errors shown as a Dialog-level message naming the missing requirement (e.g. "Add at least one Contribution before publishing").

## 20. Success States
Toast confirmation on save; visible status-badge change immediately after a successful transition, no full-page reload required.

## 21. Responsive Behaviour
Desktop: two-column edit layout. Tablet: side panel moves below the main form. Mobile: Tabs (Work editor) become a single scrollable stacked form; tables become stacked cards (Responsive Rules, doc 04).

## 22. Accessibility Notes
Tab panels (Work editor) must not hide validation errors on unvisited tabs — a tab with an error shows an indicator on the tab itself.

## 23. Permissions
Administrator-only for all screens in this module (Database Architecture §7).

## 24. UX Rules
No entity may appear "Published" in the UI without having actually passed every Publication Rule (Phase 6) — the Publish button is disabled, not just warned against, until requirements are met.

## 25. Future Improvements
Bulk actions (bulk categorize/archive); optimistic-locking conflict UI for concurrent edits (Packages Specification Package 02 §22).

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 02, Package 04; Design System (doc 02)
