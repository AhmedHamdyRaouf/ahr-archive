# AHR Platform v1 — Development Checklist

**Status:** 🔒 Frozen

**This is the official checklist to complete before writing any production code for a new unit of work.** If any item below is unchecked, stop and resolve it first — do not begin implementation.

## Before Writing Any Code

- [ ] The unit of work maps to a specific Build Manifest Package/Milestone.
- [ ] The relevant Packages Specification package(s) have been read for this scope.
- [ ] The relevant API Specification endpoint(s) have been read — request/response shape, validation rules, error codes are known before writing the handler.
- [ ] The relevant UI/UX Specification module document has been read — screen list, components, states are known before writing the UI.
- [ ] Any Database Architecture tables/columns involved have been confirmed to exist as needed — if something needed doesn't exist, this is a **stop-and-escalate** point (Database Architecture Review Round), not a build-around point.
- [ ] Any "Specified but Blocked" item relevant to this scope has been noted — the unit of work either respects the block or is itself the schema-amendment work resolving it (never quietly ignored).
- [ ] The correct branch has been created per `17 - Branch Strategy`, named per convention.

## While Developing

- [ ] Traceability comments added as code is written, not retrofitted afterward.
- [ ] Business rules implemented in the owning package only (06 - Backend Development Rules).
- [ ] Bilingual fields handled together, not one added later.
- [ ] Errors mapped to `12 - Error Codes` (API Specification) as they're introduced.

## Before Opening a Pull Request

- [ ] `19 - Code Review Checklist` self-verified.
- [ ] `20 - Definition of Done` categories addressed for this scope (even if some categories are "not applicable, because...").
- [ ] `21 - Acceptance Criteria` written for this unit of work.
- [ ] CI passes locally (lint, typecheck, build).

## Before Merging

- [ ] At least one review approval, no unresolved comments (`18 - Pull Request Rules`).
- [ ] Package README(s) updated if affected.

## Before Promoting to Production (`staging` → `main`)

- [ ] The entire milestone this unit of work belongs to is complete and reviewed — not a partial promotion.
- [ ] Operational Readiness criteria relevant to this milestone are met (Build Manifest/Development Planning, Phase 9).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** All Development Specification documents (01–21)
