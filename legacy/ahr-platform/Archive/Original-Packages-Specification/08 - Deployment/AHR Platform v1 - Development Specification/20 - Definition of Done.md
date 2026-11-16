# AHR Platform v1 — Definition of Done

**Status:** 🔒 Frozen

A feature/package unit of work is **Done** only when every category below is satisfied — not when the code merely "works."

## Architecture Compliance
- [ ] Implements exactly what the frozen Packages Specification/UI-UX Specification/API Specification describe for this scope — nothing invented, nothing silently omitted (undocumented gaps are flagged as "Specified but Blocked," not left unmentioned).
- [ ] Traceability comments present for every rule/entity/flow implemented.

## Database Compliance
- [ ] Uses only tables/columns from the Frozen v1 Database Architecture.
- [ ] Respects naming conventions, audit fields, soft-delete policy, and indexing strategy exactly.
- [ ] No hard delete implemented for any previously-published row.

## API Compliance
- [ ] Matches the corresponding API Specification endpoint(s) exactly: route, method, request/response shape, error codes, required role.
- [ ] Response envelope and pagination shape match `01 - API Standards`.

## UI Compliance
- [ ] Matches the corresponding UI/UX Specification module document: screen list, components used, empty/loading/error/success states.
- [ ] Uses Design System token references, not hardcoded visual values.
- [ ] Bilingual parity verified (both `_ar`/`_en` paths work, not just one).

## Security Review
- [ ] Row Level Security active and verified for every new table.
- [ ] Least-privilege access confirmed for the new code path.
- [ ] No secret exposed client-side.

## Performance Review
- [ ] No N+1 queries; new foreign keys indexed; lists paginated (15 - Performance Guidelines).

## Accessibility Review
- [ ] Contrast, keyboard operability, and screen-reader labeling verified against `17 - Accessibility` (UI/UX Specification).
- [ ] No color-only status signaling introduced.

## Testing Requirements
- [ ] Data Integrity Rules / Business Rules relevant to this scope have a passing test.
- [ ] Manual verification of the actual user-facing flow (not just an automated test in isolation) has been performed at least once.

## Documentation Completed
- [ ] Package README(s) affected are updated.
- [ ] Any newly-discovered gap or inconsistency is recorded (mirroring how prior specification rounds surfaced `moderation_report`, the AI/Notifications schema gaps, and the Press Mention omission) — not left implicit in code alone.

## Final Gate

All boxes above checked **and** the Pull Request has passed review (18/19) — only then does a unit of work move from "in progress" to "Done."

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Database Architecture, Packages Specification, UI/UX Specification, API Specification, Security/Performance/Accessibility sections of this Development Specification
