# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

AHR Platform is the single source of truth for AHR — architecture, business rules, design specs, source code, content, and every governing decision made about the project. It is a monorepo with one deployable artifact (`apps/web`, a Next.js 14 app) backed by 12 independent `@ahr/*` packages and a Supabase/Postgres database. The current build covers the **Archive** product only (Academy, Creative Network, and the AI Platform layer are future modules referenced in docs but not yet built beyond `@ahr/ai`'s minimal suggestion feature).

Read `README.md` and `PROJECT_STRUCTURE.md` first if you need the full top-level map — this file only covers what isn't obvious from browsing the tree.

## Commands

```bash
npm install                          # install all workspaces
npm run dev                          # apps/web dev server
npm run build                        # apps/web production build
npm run lint                         # eslint across all workspaces
npm run typecheck                    # tsc --noEmit across all workspaces
npm run test                         # vitest run, per package, --if-present
npm run test:coverage                # vitest run --coverage, per package
npm run format / format:check        # prettier, repo root
```

Run a single package's checks directly instead of through the workspace-wide scripts:

```bash
npm run test --workspace=packages/content
npx vitest run tests/validation.test.ts --workspace=packages/content   # single test file
npm run lint --workspace=packages/cms-core
```

`apps/web` has no `test` script — all automated tests live in the `@ahr/*` packages; `apps/web` is checked via `lint`, `typecheck`, and `build`.

Local setup requires `cp .env.example apps/web/.env.local` with real Supabase project values before `npm run dev` will do anything beyond serve static/public pages — see `.env.example` for what each variable does and which milestone introduced it.

### Database

- Migrations: `packages/database/migrations/*.sql`, applied in filename order. There is no migration CLI/ORM wired up in this repo — CI applies them with raw `psql` against a disposable Postgres 16 container (see `.github/workflows/ci.yml`), which is the closest thing to a canonical "apply migrations" recipe.
- Two SQL suites gate every push/PR in CI, applied the same way: `packages/database/tests/smoke-test.sql` (structural integrity) and `packages/database/tests/rls-smoke-test.sql` (Row-Level Security behavior). Run these locally against a scratch Postgres 16 database when changing a migration or an RLS policy.
- CI provisions a minimal shim (`auth.uid()`, `anon`/`authenticated`/`service_role` roles) to exercise RLS without a live Supabase project — see `packages/database/docs/local-rls-verification.md` for reproducing that locally.

## Architecture

### Monorepo layout

- `apps/web/` — the only deployable artifact. Next.js 14 App Router, bilingual via a `[locale]` (`ar`/`en`) route segment.
- `packages/*` — each is `@ahr/<name>`, independently versioned/tested, importable only through its `index.ts` public exports (see Structure Rules below). `database` holds only SQL migrations and SQL test suites, not TypeScript.
- `content/` — the actual Archive content dataset (CSV), import templates, and the validation pipeline — not application code.
- `docs/` — the full governing specification set (Architecture, Business, Database, API, Deployment, Guides, Development, Program-Status). Treat anything here that a change touches as something to keep in sync, not just a code-review artifact.
- `Archive/` — superseded material kept for traceability only; never authoritative. If the same document exists in both `Archive/` and `docs/`, `docs/` wins.

### Structure rules (from `docs/Guides/Coding-Standards.md`, enforced by convention not tooling)

1. **One package = one responsibility.** A package doing two unrelated things should be split, not extended.
2. **No package reaches into another's internals.** Cross-package imports go through the target package's `index.ts` only — never deep file imports (e.g. `@ahr/cms-core/src/repository` from another package).
3. **Business rules live in exactly one place** — implemented once in the package that owns that domain, imported everywhere else, never re-implemented per call site.
4. Files implementing a rule/entity/flow from the approved architecture carry a short header comment naming the source doc, e.g. `// Implements: Data Integrity Rules (Phase 4) — "A Work cannot exist without at least one Contribution."` This is expected on anything touching business rules, data integrity, or AI decision boundaries — follow the pattern already visible in most package source files.
5. TypeScript `strict: true` everywhere (`packages/config/tsconfig.base.json`); no `any` without an inline comment explaining why. Shared ESLint rules live in `packages/config` (`@ahr/eslint-config`) and are extended, not overridden, per package.

### CMS engine pattern

`@ahr/cms-core` is a generic, entity-agnostic engine (CRUD, validation, slugs, status lifecycle, query building, revision/media-picker abstractions) — it implements no business package itself. Each entity in `@ahr/content` (`packages/content/src/definitions/*.ts` — person, work, project, organization, event, contribution, award, media, press-mention, category, tag) supplies one `ResourceDefinition` consumed by cms-core's generic functions (`genericList`, `genericCreate`, `genericUpdate`, `genericTransitionStatus`, `genericSoftDelete`, `genericRestore`). Adding a new entity or field means adding/editing a `ResourceDefinition`, not writing new CRUD logic. The dashboard's generic CMS screens (`apps/web/app/[locale]/dashboard/cms/[entityType]/`) and the generic API routes (`apps/web/app/api/cms/[entityType]/`) both drive off these same definitions — there is one implementation of entity CRUD, not one per entity.

### Database conventions (`docs/Database/Data-Foundation-Conventions.md` — 🔒 locked standard)

- `snake_case`, singular table names matching the Entity Catalog (`person`, `work`, ... with `media_asset` and `press_mention` as the two deliberate renames for clarity).
- Every table: `id uuid primary key default gen_random_uuid()`, `created_at`/`updated_at timestamptz` (the latter maintained by one shared `set_updated_at()` trigger, never reimplemented per table), plus the shared audit columns `status`, `visibility`, `verification_status`, `source`, `owner_id`, `created_by`, `updated_by`.
- **No hard delete, ever, for a published entity.** Removal is `status = 'archived'` only; there is no `deleted_at` column. All state transitions are recorded in one shared append-only `entity_state_transition` table, not per-table history shadow tables. Physical row deletion is permitted only for rows that never left `draft` and were entered in error.
- `status` follows one fixed sequence for every table: `draft → review → verified → published → archived`. No table-specific status values — a genuinely different lifecycle is an architecture change to Data Lifecycle (Phase 4) first, never a silent per-table divergence.
- Foreign keys are named `<referenced_table>_id`, default `ON DELETE RESTRICT` (cascade only for denormalized tables with no independent lifecycle, and only if stated explicitly in the migration comment). Every FK is indexed.
- Naming: `idx_<table>_<column>`, `uq_<table>_<column>`, `fk_<table>_<referenced_table>`, `chk_<table>_<column>`.

### Auth and route protection

`apps/web/middleware.ts` is the **single** place route protection is decided app-wide: it matches `/(ar|en)/dashboard/:path*`, checks for a valid Supabase session, and redirects to `/{locale}/login` if absent. This is intentionally a shallow, fast, edge-friendly check only — the fuller `platform_user`/role resolution chain (including provisioning-error handling) lives in `@ahr/auth` (`session.ts`, `policy.ts`) and is re-checked in-process by every Server Component/Route Handler that resolves the session server-side (deliberate defense in depth). Individual dashboard pages/routes do not re-implement authentication checks — they call into `@ahr/auth`.

### Bilingual content

Content is bilingual (`ar`/`en`) end-to-end: the route segment (`app/[locale]/...`), CMS fields (see `apps/web/components/cms/fields/bilingual-text-field.tsx`), and the underlying bilingual columns search queries run against (`@ahr/search` uses `ILIKE` plus a deterministic relevance heuristic over these columns — Postgres full-text search was deliberately not adopted, see `packages/database/docs/blocked-fts.md` if present).

### AI integration

`@ahr/ai` provides a provider-agnostic `aiClient` abstraction (OpenAI-backed) for Archive-scoped, human-reviewed-only suggestions — Category/Tag assignment and draft summary/description text for Work/Project entities. AI never writes autonomously to governed platform state; every suggestion is surfaced through `apps/web/app/api/ai/suggest/` for human accept/reject via `apps/web/components/ai/ai-suggestion-panel.tsx`, and decisions are recorded via `apps/web/lib/ai-recommendation-log.ts` (backed by the `ai_recommendation_log` table). Requires `OPENAI_API_KEY` server-side only; every other route in the app functions without it.

## Where to look for "why"

This repo treats `docs/` as authoritative for intent, not just code comments:
- Current honest state of the project / what's left: `docs/Program-Status/Gap-Analysis-and-Remaining-Work.md`
- What was decided and when: `docs/Program-Status/Decision-Log.md`
- Full API contract: `docs/API/API-Specification/`
- Entity business rules: `docs/Business/Entity-Specifications/`, `docs/Business/Business-Rules/`

If a change touches a business rule, entity lifecycle, or API contract, check whether the corresponding doc in `docs/` needs updating alongside the code — this codebase's convention is that architecture docs and code stay in sync, not that docs are historical snapshots.
