# AHR Platform v1 — Code Review Checklist

**Status:** 🔒 Frozen

A reviewer verifies every item below before approving. This is not a suggestion list — a PR with an unchecked item here should not be approved.

## Architecture Compliance
- [ ] Every new file's purpose is traceable to a specific frozen document (traceability comment present).
- [ ] No new database table/column/endpoint/module introduced outside the frozen specifications.
- [ ] No frozen document modified without a referenced revision decision.

## Correctness
- [ ] Business rules (Data Integrity Rules, Business Rules, AI Decision Boundaries) are enforced in `packages/content`/the owning package, not just assumed to be caught by the database.
- [ ] Status/lifecycle transitions use the shared transition function/endpoint — no direct `status` field mutation bypassing it.
- [ ] Bilingual fields (`_ar`/`_en`) are both handled — no code path that silently drops one language.

## Security
- [ ] No secret/service-role key exposed to client-side code.
- [ ] Row Level Security is not bypassed outside the one sanctioned migration-script exception.
- [ ] Input validation exists server-side, not only client-side.

## Consistency
- [ ] Naming matches `04 - Naming Conventions`.
- [ ] Error responses use `12 - Error Codes` (API Specification) — no invented error shape.
- [ ] New components match `16 - Components Library` (UI/UX Specification) or that index is updated in this same PR.

## Performance
- [ ] No N+1 query pattern introduced.
- [ ] New foreign keys are indexed.
- [ ] List endpoints/views are paginated.

## Testing
- [ ] New business rules have a corresponding test (mirrors the existing `smoke-test.sql` pattern where applicable, or an equivalent test at the relevant layer).
- [ ] Existing tests still pass.

## Documentation
- [ ] Any package README affected by this change is updated in the same PR.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** All Development Specification documents (01–18)
