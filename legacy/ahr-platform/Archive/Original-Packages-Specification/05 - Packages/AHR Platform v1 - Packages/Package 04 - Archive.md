# Package 04 — Archive

**Status:** 🟡 Working — pending review
**Package Type:** Domain/service layer — no UI of its own; consumed by CMS (Package 02), Website (Package 03), Search (Package 09)

## 1. Package Overview

Archive is the domain layer implementing Entity Catalog, Relationship Model, Data Integrity Rules, and Data Lifecycle (Phase 4) as callable functions. Every other package that touches `person`, `work`, `project`, `event`, `contribution`, `award`, `category`, or `tag` goes through Archive rather than querying those tables directly — this is the single place the rules live (Coding Standards, "business rules live in one place").

## 2. Objectives

- Be the one place Data Integrity Rules and Entity Lifecycles & State Transitions are enforced.
- Give CMS, Website, and Search one consistent, correct data contract instead of three independent interpretations of the schema.

## 3. Scope

**In scope:** Repository/service functions for the 8 core entities + their relationships + lifecycle transitions + taxonomy joins.
**Out of scope:** Any UI (Package 02/03 own that), Organization-specific relationship management beyond basic CRUD (Package 05 owns the relationship-centric features), Media upload mechanics (Package 08), search indexing itself (Package 09, though it reads through Archive).

## 4. Features

- One repository module per entity (`person`, `work`, `project`, `event`, `contribution`, `award`, `category`, `tag`), matching Data Foundation Conventions' table structure exactly.
- Shared lifecycle transition function, enforcing Draft→Review→Verified→Published→Archived without skipping.
- Shared taxonomy assignment function, enforcing `category.domain` scoping.
- Relationship integrity checks (e.g. Contribution requires Person + at least one of Work/Project/Event) enforced in code as a second layer above the database `check` constraint — never relying on the database to be the only place this is caught, so error messages are meaningful.

## 5. User Stories

This package has no direct users — its "users" are the other packages. Representative internal consumer stories:

- As CMS, I need to create a Work and immediately know if it's missing a required Contribution, with a clear error, not a raw constraint violation.
- As Website, I need to fetch only published+public Works without re-implementing that filter myself.
- As Search, I need a consistent way to fetch searchable fields for indexing.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Every write to `work`, `project`, `event`, `contribution`, `award` must pass through Archive's validation before hitting the database, even though the database also enforces the same rules — for clearer error messages, not as the only line of defense. |
| FR-2 | Archive must expose one lifecycle-transition function used by every entity type — not one per type. |
| FR-3 | Archive must expose read functions parameterized by visibility/status, so "published+public only" is expressed once and reused by Website and Search. |

## 7. Non-Functional Requirements

- No package other than Archive queries these 8 tables directly (architectural boundary, Service Architecture Phase 8 — "no service reaches into another's internals").
- Functions must be safe to call from both Server Actions (CMS writes) and Server Components (Website reads).

## 8. Pages

None — this package has no pages. (Included per the required template structure; N/A is the correct, honest answer here.)

## 9. Components

None (backend-only package). Its "components" are its exported functions:

- `entities/{person,work,project,event,contribution,award,category,tag}.ts`
- `lifecycle.ts`
- `taxonomy.ts`

## 10. Navigation Flow

N/A — no UI.

## 11. Complete Workflow

```
Caller (CMS or Website) → Archive repository function → validation
      → (write) database call → entity_state_transition logged (on status change)
      → (read) filtered query result returned
```

## 12. Roles & Permissions

Archive itself does not decide permissions — it trusts the caller (CMS enforces Administrator-only for writes; Website only ever calls read functions). Row Level Security (Database Architecture §8) is the underlying backstop regardless of what the calling package intended.

## 13. Database Tables Used

`person`, `work`, `project`, `event`, `contribution`, `award`, `category`, `tag`, `work_category`, `work_tag`, `project_category`, `project_tag`, `entity_state_transition` (read + write, all of them).

## 14. APIs Required

Internal module functions only (not HTTP endpoints in their own right) — CMS and Website call these directly from Server Actions/Components, per the frozen Route Handlers + Server Actions decision. No separate Archive HTTP API is exposed.

## 15. Validation Rules

- All `check`-constrained values (Database Architecture §6–§8) are validated in code before the database is asked to enforce them, for better error messages.
- Contribution: exactly one Person, at least one of Work/Project/Event (Data Integrity Rules, Phase 4).
- Media/Press "exactly one owner" rule (enforced by Package 08/Package 05 respectively when they write those tables through Archive's shared validation helper).

## 16. Business Rules

Full restatement of Data Integrity Rules, Entity Lifecycles & State Transitions, and Publication Rules (Phase 4/6) — this package is their code home. Not re-listed exhaustively here to avoid drift from the source documents; Archive's code must match those documents, not the other way around.

## 17. Security Considerations

- Archive does not itself authenticate or authorize — it assumes the caller already has (Package 01). This is a deliberate boundary, not an oversight: mixing authorization checks into the domain layer would duplicate what Row Level Security and Package 01 already guarantee.

## 18. Edge Cases

- A `work.parent_work_id` cycle (A→B→A) must be rejected in code, not just relying on `chk_work_parent_not_self` (which only catches direct self-reference, not longer cycles).
- Removing the last Contribution from a Work that is already Published should be blocked or should force the Work back to a non-published state — this specific rule is not yet resolved; see Developer Notes.

## 19. Error Handling

Errors are returned as typed, specific results (e.g. `MISSING_CONTRIBUTION`, `INVALID_STATUS_TRANSITION`, `TAXONOMY_DOMAIN_MISMATCH`) rather than raw database error codes, so calling packages (CMS) can show meaningful messages.

## 20. Acceptance Criteria

- [ ] Every entity type has a working repository module with create/read/update + lifecycle transition.
- [ ] Multi-hop `parent_work_id` cycles are rejected.
- [ ] Published-only read functions are used by both Website and Search with identical results.

## 21. Dependencies

- **Depends on:** Database Architecture (Frozen v1), Entity Catalog / Relationship Model / Data Integrity Rules / Data Lifecycle (Phase 4), Entity Lifecycles & State Transitions / Publication Rules (Phase 6).
- **Depended on by:** Package 02 (CMS), Package 03 (Website), Package 05 (Contacts & Organizations, for its Organization CRUD base), Package 09 (Search).

## 22. Future Improvements (Post v1)

- Resolve the "remove last Contribution from a Published Work" edge case explicitly (currently open — see §18).
- Optimistic concurrency for simultaneous edits.

## 23. Testing Checklist

- [ ] Data Integrity Rules are enforced for every entity type, not just Work.
- [ ] Lifecycle transitions cannot skip stages, for every entity type.
- [ ] Multi-hop parent-work cycle is rejected.
- [ ] Published+public read filter returns identical results whether called from Website or Search.

## 24. UX Notes

N/A — no UI. Error messages returned by this package should be written with the eventual CMS user in mind (clear, not technical jargon), even though Archive itself renders nothing.

## 25. Developer Notes

- This is the most important package to get right — every content rule in the entire platform lives here or nowhere.
- Open question, needs a decision before Package 02 finalizes its Publish flow: does un-linking the only Contribution from a Published Work auto-revert its status, or block the un-link entirely? Recommend blocking (simpler, matches "no silent state changes" principle) but this is flagged, not decided, here.

---

**Status:**
🟡 Working

**Package:**
04 — Archive

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Database Architecture (Frozen v1), Entity Catalog / Relationship Model / Data Integrity Rules / Data Lifecycle (Phase 4), Business Rules (Phase 6)
