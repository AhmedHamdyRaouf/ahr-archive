# Coding Standards

**Architectural reference:** Implementation Principles (Phase 9); Technical Architecture Principles (Phase 8) — separation of concerns, single source of truth per domain.

## Language & Tooling

- TypeScript everywhere, `strict: true` (see `packages/config/tsconfig.base.json`). No `any` without an inline comment explaining why.
- Shared lint rules live in `packages/config` (`@ahr/config-eslint`) and are extended by every app/package — no per-app rule divergence without updating the shared preset first.
- Formatting is enforced by Prettier at the repo root (`npm run format:check` in CI). No manual formatting debates in review.

## Structure Rules

1. **One package = one responsibility**, mirroring Service Architecture (Phase 8). A package that starts doing two unrelated things is a signal to split it, not a shortcut to take.
2. **No package reaches into another package's internals.** Cross-package usage goes through that package's public exports only (its `index.ts`), never deep file imports — this is the code-level enforcement of "no service accesses another's internal data directly" (Service Architecture, Phase 8).
3. **Business rules live in one place.** Validation logic for a rule approved in Phase 4/6 (e.g. "a Work cannot exist without at least one Contribution") is implemented once, in the package owning that domain, and imported everywhere it's needed — never re-implemented per call site.

## Traceability

Any file implementing a rule, entity, or flow from the approved architecture includes a short header comment naming the source document, e.g.:

```ts
// Implements: Data Integrity Rules (Phase 4) — "A Work cannot exist without at least one Contribution."
```

This is not optional for anything touching business rules, data integrity, or AI decision boundaries.

## What This Milestone Does NOT Cover

Testing conventions, database access patterns, and API contract conventions will be documented starting Milestone 2 onward, once there is a schema and services to apply them to. This document will grow; it is not rewritten from scratch per milestone.
