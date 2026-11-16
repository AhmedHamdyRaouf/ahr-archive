# Package 02 — CMS (Content Management)

**Status:** 🟡 Working — pending review
**Package Type:** Admin authoring tool, lives inside the Dashboard (Package 07) shell

## 1. Package Overview

CMS is the administrator-facing authoring surface for every Archive entity: creating, editing, and moving `person`, `work`, `project`, `event`, `contribution`, `award`, `category`, and `tag` records through their Data Lifecycle (Draft → Review → Verified → Published → Archived). It is the write side of the platform; Package 03 (Website) is the read side; Package 04 (Archive) is the underlying domain model both build on.

## 2. Objectives

- Give the Administrator one consistent way to create and edit every entity type.
- Enforce Data Lifecycle transitions and Data Integrity Rules at the point of entry, not after the fact.
- Route verification and moderation decisions through Package 04's domain rules, not through ad hoc CMS-only logic.

## 3. Scope

**In scope:** Create/edit forms for all 8 core content entities + Category/Tag management + lifecycle status changes (Draft/Review/Verified/Published/Archived) + taxonomy assignment (work↔category/tag, project↔category/tag).
**Out of scope:** Organization management (Package 05 owns it specifically, despite `organization` being a "content" table); media upload (Package 08); the underlying business rule definitions themselves (Package 04 owns those; CMS only invokes them).

## 4. Features

- Entity list views (filterable by status, verification_status, type) for Person, Work, Project, Event, Contribution, Award, Category, Tag.
- Create/edit forms per entity, respecting each table's required fields (Database Architecture §2).
- Status transition controls (Draft → Review → Verified → Published → Archived → Restore), enforced against Entity Lifecycles & State Transitions (Phase 6).
- Taxonomy assignment UI (attach/detach Category and Tag to Work/Project via the join tables).
- Compound-work editor (`work.parent_work_id`, `work_relationship`).

## 5. User Stories

- As the Administrator, I can create a new Work and see it start in Draft.
- As the Administrator, I can attach one or more Contributions to a Work before I can publish it (Data Integrity Rules require at least one).
- As the Administrator, I can categorize and tag a Work.
- As the Administrator, I can move a Work through Review → Verified → Published, and cannot skip a stage.
- As the Administrator, I can archive a published item and later restore it.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | The system must prevent saving a `work`/`project`/`event` as Published if it has zero linked `contribution` rows *and* the entity type requires one (only `work` strictly requires it, per Data Integrity Rules). |
| FR-2 | The system must prevent any status transition that skips a stage (e.g. Draft → Published directly). |
| FR-3 | The system must record every status change as a new `entity_state_transition` row (Package 04's responsibility, invoked here). |
| FR-4 | Category assignment must respect `category.domain` scoping — a `work_type` category cannot be attached to a `project`. |

## 7. Non-Functional Requirements

- Forms must be usable bilingually — every `_ar`/`_en` field pair is edited side by side, not as separate pages (Information Presentation, Phase 7).
- Autosave or explicit save — explicit save is the V1 choice, to keep Draft state intentional rather than accidental.

## 8. Pages

| Page | Path | Notes |
|---|---|---|
| Entity list (per type) | `/{locale}/dashboard/cms/{entity}` | One list view per entity type |
| Entity create/edit | `/{locale}/dashboard/cms/{entity}/[id]` | Shared form component per entity, not per action |
| Category manager | `/{locale}/dashboard/cms/categories` | Tree view, respects `domain` and `parent_id` |
| Tag manager | `/{locale}/dashboard/cms/tags` | Flat list |

## 9. Components

- `EntityListTable` (status/verification filters)
- `EntityForm` (bilingual field pairs, shared shape across entity types)
- `StatusTransitionControl`
- `ContributionPicker` (attaches Person + role to a Work/Project/Event)
- `TaxonomyPicker` (Category/Tag assignment)
- `CompoundWorkEditor`

## 10. Navigation Flow

```
Dashboard shell → CMS section → entity list → entity form
                                              → status transition → (back to list)
```

## 11. Complete Workflow

```
① Administrator creates a Work (status=draft)
② Administrator adds required fields + at least one Contribution
③ Administrator requests Review — status moves to 'review'
④ Administrator (or a future Verifier role, Release 2) marks Verified
⑤ Administrator publishes — status moves to 'published', now visible on Website (Package 03)
⑥ Each transition writes an entity_state_transition row automatically
```

## 12. Roles & Permissions

Only `administrator` exists in V1 (Database Architecture §7) — full CMS access. No Trainer/Editor-restricted views exist yet.

## 13. Database Tables Used

`person`, `work`, `project`, `event`, `contribution`, `award`, `category`, `tag`, `work_category`, `work_tag`, `project_category`, `project_tag`, `entity_state_transition` (write, via the shared lifecycle mechanism — never edited directly by CMS UI, per Database Architecture §8).

## 14. APIs Required

- CRUD Server Actions per entity type (create/update/list/get).
- `transitionStatus(entityTable, entityId, toStatus)` — shared across all entity types, not duplicated per type (Coding Standards §"business rules live in one place").
- `assignTaxonomy(entityTable, entityId, categoryIds[], tagIds[])`.

## 15. Validation Rules

- Required fields per entity, per Database Architecture §2 (e.g. `work.title_ar`, `work.title_en`, `work.work_type` are not null).
- `work.work_type`, `project.project_type` restricted to the frozen `check` constraint value sets.
- At least one Contribution required before a `work` can leave Draft (Data Integrity Rules, Phase 4).

## 16. Business Rules

- Publication Rules (Phase 6): bilingual completeness, ownership present, required relationships satisfied, no active moderation report — all enforced before the Publish action succeeds, not just recommended.
- No entity may skip a lifecycle stage (Entity Lifecycles & State Transitions, Phase 6).

## 17. Security Considerations

- Every CMS route requires an authenticated Administrator session (Package 01).
- Row Level Security still applies underneath the application layer — CMS is not the only enforcement point (defense in depth, Security Architecture Phase 8).

## 18. Edge Cases

- Attempting to publish a Work whose only Contribution was just deleted mid-edit → blocked, same as if it never had one.
- Attempting to attach a `project_type` category to a Work → rejected by domain-scoping validation.
- Editing an entity that currently has an open `moderation_report` (Package 05/07 concern) → CMS should surface a visible warning, not silently allow changes that contradict an active report.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Missing required field on save | Inline field-level error, form not submitted |
| Invalid status transition attempted | Rejected with an explanatory message naming the required intermediate stage |
| Concurrent edit (two sessions editing the same row) | Last write wins in V1 — no optimistic locking; flagged in Future Improvements |

## 20. Acceptance Criteria

- [ ] Every entity type has working create/edit/list views.
- [ ] Status transitions cannot skip a stage.
- [ ] Publishing a Work without a Contribution is blocked.
- [ ] Category assignment respects domain scoping.
- [ ] Every transition is visible in the entity's history (via `entity_state_transition`).

## 21. Dependencies

- **Depends on:** Package 01 (Authentication), Package 04 (Archive — domain rules), Database Architecture (Frozen v1).
- **Depended on by:** Package 03 (Website reads what CMS publishes), Package 09 (Search indexes what CMS publishes), Package 07 (Dashboard hosts CMS).

## 22. Future Improvements (Post v1)

- Optimistic locking / conflict detection for concurrent edits.
- Bulk actions (bulk categorize, bulk archive).
- Additional role-scoped CMS views once Trainer/Editor roles exist (Release 2).

## 23. Testing Checklist

- [ ] Create/edit/list works for all 8 entity types.
- [ ] Lifecycle transition guardrails hold for every entity type, not just Work.
- [ ] Taxonomy domain-scoping is enforced.
- [ ] Bilingual fields save and display correctly in both languages.

## 24. UX Notes

- Status should always be visible at a glance in list views (color/label per §Design System Foundations, Phase 7) — never require opening a record to know its lifecycle stage.
- Forms should never silently discard unsaved bilingual content when switching tabs/fields.

## 25. Developer Notes

- `transitionStatus` and `assignTaxonomy` are the two functions every entity-specific form calls — do not reimplement per entity (Coding Standards §"one place for business rules").
- CMS never talks to `entity_state_transition` directly for writes outside the shared lifecycle function.

---

**Status:**
🟡 Working

**Package:**
02 — CMS

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 01 (Authentication), Package 04 (Archive), Database Architecture (Frozen v1), Business Rules / Publication Rules / Entity Lifecycles & State Transitions (Phase 6)
