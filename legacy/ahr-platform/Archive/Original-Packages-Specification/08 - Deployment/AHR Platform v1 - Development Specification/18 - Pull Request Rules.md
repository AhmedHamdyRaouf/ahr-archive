# AHR Platform v1 — Pull Request Rules

**Status:** 🔒 Frozen

## Required PR Contents

- **Title:** `[<milestone-id>] <short description>`, matching the branch/commit convention.
- **Description:** Which architecture document(s) this PR implements (link or name — Development Principles §1's traceability rule at the PR level).
- **Scope statement:** What's included, and explicitly what's deferred/out of scope (mirrors how the Build Manifest and Packages Specification themselves state scope).
- **Checklist confirmation:** That `19 - Code Review Checklist` and, if applicable, `20 - Definition of Done` items have been self-verified before requesting review.

## Size

A PR should correspond to one milestone unit of work, not a whole milestone at once where that milestone is large — smaller, reviewable PRs are preferred over one large PR per package (Development Principles §5, Incremental Delivery).

## Required Checks Before Merge

- CI passes (lint, typecheck, build — `.github/workflows/ci.yml`, extended per new packages as they're added).
- At least one review approval.
- No unresolved review comments.
- No new endpoint/table/component introduced that isn't already documented in the frozen specifications — if one is needed, the PR pauses for a specification update first (Development Principles §4).

## What a PR Must Never Do

- Modify a frozen document without an explicit, referenced revision decision.
- Introduce a new database table/column not in the Frozen v1 Database Architecture.
- Introduce a new API endpoint not in the Frozen v1 API Specification.
- Silently work around a "Specified but Blocked" gap instead of leaving it blocked or escalating for a schema decision.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Git Workflow (16), Code Review Checklist (19), Definition of Done (20)
