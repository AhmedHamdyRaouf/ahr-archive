# AHR Platform v1 — Naming Conventions

**Status:** 🔒 Frozen

Consolidates and cross-references naming rules already frozen elsewhere — this document does not introduce new naming rules, it is the single place a developer looks instead of searching six documents.

## Database (unchanged — Data Foundation Conventions §2)
Tables: singular, `snake_case` (`work`, `press_mention`). Columns: `snake_case`. Indexes/constraints: `idx_`/`uq_`/`fk_`/`chk_` prefixes.

## API (unchanged — API Standards §"Resource Naming"/"Field Naming")
Routes: plural, kebab-case-safe nouns (`/works`, `/press-mentions`). JSON fields: camelCase (`titleAr`, `workType`).

## TypeScript/Code
- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for React components.
- Variables/functions: `camelCase`. Types/interfaces: `PascalCase`.
- Constants that mirror a database `check`-constrained value set (e.g. status values) are defined once, in `packages/content`, as a single shared type/list — never re-typed as a string literal in more than one place (Coding Standards, Milestone 1).

## Components
Component names match their entry in `16 - Components Library.md` exactly (`EntityCard`, not `EntityCardComponent` or `Card`) — the UI/UX Specification's component index is the source of truth for names, not whatever a developer initially calls a new file.

## Branches and Commits
Per `docs/branching-strategy.md` (Milestone 1): `feature/<milestone>-<short-description>`, commit messages prefixed `[<milestone-id>]`.

## Environment Variables
`NEXT_PUBLIC_*` prefix only for values safe to expose to the browser (matching `.env.example`, Milestone 1) — a value is never given the `NEXT_PUBLIC_` prefix "to make it easier to access" if it's actually a secret (e.g. `SUPABASE_SERVICE_ROLE_KEY` never gets this prefix).

## Rule

If a naming question isn't answered by this document, it's answered by whichever frozen document already owns that naming domain (Database Architecture, API Specification, UI/UX Specification) — this document is a router, not a second source of truth.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Database Architecture §2, API Standards, Coding Standards (Milestone 1), Components Library (UI/UX Specification 16)
