# Wireframes — Contacts & Organizations

**Screens:** Organization List, Organization Detail/Edit
**Note:** UI for several requested fields is blocked by a schema gap — carried forward, not resolved by this audit.

## Composition
List: filter bar + Table (Name, Status, Verification, Related-record count, Updated, Actions). Detail: `OrganizationForm` (left) + `RelatedRecordsPanel` grouped by Award/Project/Event/Press Mention (right/below), stacking vertically on Tablet/Mobile, form first.

```
┌──────────────────────────┬────────────────────┐
│ [OrganizationForm:         │ [RelatedRecordsPanel│
│  name_ar/en, description_  │  — small cards per  │
│  ar/en, lifecycle]          │  related entity,    │
│                              │  grouped]           │
└──────────────────────────┴────────────────────┘
```

## Explicit Absence (not a bug, a documented gap)
Contact information, internal notes, external links, and Tag/Category assignment fields are **not present** in this form in V1. The form does not show empty, non-functional inputs for these — they are simply absent until the underlying schema gap is resolved (see `Backlog.md`).

## Components
Table, Badge, Card (Related Records groupings), Alert ("cannot archive — referenced by a Published Award").

## Cross-Reference
Full behavioral spec: original UI/UX Specification, Contacts & Organizations UI. Flow: `User Flows/README.md` §10.
