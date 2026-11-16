# AHR Platform v1 — Coding Standards

**Status:** 🔒 Frozen

Extends Milestone 1's `docs/coding-standards.md` — that document remains valid; this one applies it across the full, now-larger package set.

## Language
TypeScript everywhere, `strict: true`. No `any` without an inline comment explaining why it's unavoidable.

## Package Boundaries
No package reaches into another package's internals — only through its `index.ts` public exports (Coding Standards, Milestone 1; Service Architecture, Phase 8: "no service accesses another's internal data directly"). This applies equally to `packages/content` being the only code allowed to query the 8 core Archive tables directly (Archive API §"No Public HTTP API," now generalized to "no direct table access from outside `packages/content`" either).

## Traceability Comments
Mandatory for any file implementing a rule, entity, or flow from the approved architecture:

```
// Implements: <Document Name> (<Phase/Package>) — "<short quote or paraphrase of the rule>"
```

This is not optional for anything touching business rules, data integrity, permissions, or AI decision boundaries (unchanged from Milestone 1).

## One Function, Many Callers
Shared logic (status transition validation, taxonomy domain-scoping, owner-constraint checks) is written once in `packages/content` and imported everywhere it's needed — never duplicated per entity type or per package (mirrors the API Specification's own "generic entity family" documentation choice).

## Comments vs. Self-Documenting Code
Prefer clear naming over comments for *what* code does; reserve comments for *why* — especially for any deviation from a general rule (e.g. Media's `PATCH`-based status field, explicitly called out as a deliberate exception in `09 - Media Library API.md`; the corresponding code must carry the same explanation).

## Formatting and Linting
Prettier + shared ESLint preset (`packages/config`, Milestone 1) — no per-package rule divergence without updating the shared preset first.

## No Dead Feature Flags for Unbuilt Scope
Code for Academy/Creative Network (Release 2) or any "Specified but Blocked" endpoint (API Specification) is not stubbed out with commented-out or feature-flagged placeholders in V1 — it simply doesn't exist yet, consistent with the Final Build Manifest's "complete absence, not partial" scope rule.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Coding Standards (Milestone 1), Technical Architecture Principles (Phase 8)
