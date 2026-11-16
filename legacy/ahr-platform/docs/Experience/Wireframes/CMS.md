# Wireframes — CMS (Content Management)

**Screens:** Entity List (People/Works/Projects/Events/Awards/Categories/Tags), Entity Create/Edit, Category Manager (tree), Tag Manager (flat list)

## Composition — List Screens
A filter bar (status, verification, free-text search) sits above a Table. Zero-state: "No {Entity} yet" + prominent Create button, never a bare empty table.

## Composition — Edit Screens
Two-column layout on Desktop: primary bilingual fields (left/main column), status/lifecycle/relationships panel (right, sticky). Tablet: side panel moves below the form. Mobile: tabs (Work editor: Details/Contributions/Media) become a single scrollable stacked form.

```
┌───────────────────────────────────────────┐
│ [FilterBar: status | verification | search]│
├───────────────────────────────────────────┤
│ [EntityListTable]                          │
│ [Pagination]                                │
└───────────────────────────────────────────┘

┌──────────────────────────┬────────────────┐
│ [EntityForm — bilingual   │ [StatusTransition│
│  field pairs, entity-     │  Control]        │
│  specific fields]         │ [ContributionPicker│
│                            │  /TaxonomyPicker] │
└──────────────────────────┴────────────────┘
```

## Components
Table, Filter controls, Badge (status/verification), Card (Category tree nodes), Tabs (Work editor), Dialog (status transition confirmation), Alert (open moderation report warning), Toast (save confirmation).

## State Coverage Required
Loading (skeleton table rows; Save button loading+disabled) · Error (field-level inline; status-transition errors as a named Dialog message, e.g. "Add at least one Contribution before publishing") · Empty (per module above) · Success (Toast + immediate badge update, no reload).

## UX Rule Enforced Here
The Publish button is **disabled**, not just warned against, until every Publication Rule is met — the UI must never allow a "Published" appearance without the underlying rule actually being satisfied.

## Cross-Reference
Full behavioral spec: original UI/UX Specification, CMS UI. Flow: `User Flows/README.md` §7.
