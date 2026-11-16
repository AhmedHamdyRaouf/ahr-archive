# AHR Platform v1 — Acceptance Criteria

**Status:** 🔒 Frozen

## Relationship to Packages Specification

Every package (01–10) in the Packages Specification already has its own §20 Acceptance Criteria. This document does not replace those — it defines the **format and rigor** every acceptance criterion, present or future, must follow.

## Format

Every acceptance criterion is:
- **Specific** — names the exact entity/endpoint/screen involved, not "the system should work."
- **Verifiable** — a reviewer or tester can check it directly (matches an item in `19 - Code Review Checklist` or is a manual test step).
- **Traceable** — maps back to a functional requirement in the Packages Specification, a validation rule in the API Specification, or a UX rule in the UI/UX Specification.

## Example Pattern (illustrative structure, not a new feature)

```
Given <a specific role and starting state>
When <a specific action is taken>
Then <a specific, checkable outcome occurs>
And <the corresponding error/edge case is also verified>
```

## Minimum Coverage Per Feature

Every new feature's acceptance criteria must cover, at minimum: the success path, at least one validation-failure path, and at least one permission-boundary path (an unauthorized role/Visitor is correctly denied) — a feature with only a "happy path" acceptance criterion is incomplete per this standard.

## Where Acceptance Criteria Live

Written into the Pull Request description (18 - Pull Request Rules) for the specific unit of work, referencing the relevant Packages Specification package's §20 as the baseline, with any feature-specific additions listed explicitly.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Packages Specification (all packages' §20), Pull Request Rules (18)
