# AHR Platform

Monorepo for the AHR Platform. Built on the architecture approved and locked in Phases 1–9 — see `docs/architecture/` for the full approved baseline (14 architecture/specification documents + the AI Integration implementation addendum).

**Current state:** all 11 Development milestones plus AI Integration are implemented and tested (see `DEVELOPMENT-STATUS.md`), and this codebase has been independently re-verified end-to-end as part of a Phase 1 Platform Implementation audit — see `docs/phase-1/Phase-1-Implementation-Audit-Report.md` for the full, reproducible account (clean install, lint, typecheck, 350/350 tests, production build, and both database smoke-test suites against a real PostgreSQL 16 instance).

**Since that audit:** the three Design-to-Development integration gaps it identified (Media Upload UI, AI Suggestion Panel, Dashboard Overview) have been closed — see the git log for the exact commits, each cited against its source wireframe file.

## Status

🔒 **Milestone 1 — Project Foundation: Approved & Locked**
🟢 **Milestone 2 — Data Foundation: all 20 tables from Database Architecture (Frozen v1) migrated and validated**
🟢 **Milestone 3 — Identity & Access: Authentication, role-aware Authorization, route protection, and the shared Dashboard Shell are implemented and tested**
🟢 **Milestone 4 — CMS Foundation: generic, entity-agnostic CMS engine implemented and tested** (patched in Milestone 10 — see below)
🟢 **Milestone 5 — Content Domain Packages: all 10 Archive entities implemented on top of the generic engine**
🟢 **Milestone 6 — Media Library: independent, reusable package implemented and tested, strictly against the frozen schema**
🟢 **Milestone 7 — Relationships & Metadata: cross-entity relationship and metadata services implemented and tested, strictly against the frozen schema**
🟢 **Milestone 8 — Public Website: application shell, routing, navigation, theme system, localization, SEO, and accessibility foundation implemented and tested**
🟢 **Milestone 9 — Search Engine: unified Search API implemented and tested, strictly against the frozen schema**
🟢 **Milestone 10 — Workflow Engine: Moderation Report review/resolution workflow implemented and tested, strictly against the frozen schema**
🟢 **Milestone 11 — Notifications: provider abstraction, email delivery, event-driven dispatch, and a fixed-default preference model implemented and tested, strictly against the frozen schema** (see `packages/notifications/`)

Milestone 11 delivers a `NotificationProvider` abstraction, a real working `HttpEmailProvider` (reading `platform_settings.email_configuration`, seeded empty since Milestone 2 and never used until now), bilingual notification templates, event-driven dispatch wired to real trigger points (Milestone 10's Moderation workflow, Milestone 4/5's content publish), and a preference domain model with one fixed policy for V1. A persisted notification inbox and persisted per-user preferences are both documented as blocked by the frozen schema (`packages/notifications/docs/blocked-notifications.md`) — not worked around. In-app awareness remains a live, derived indicator (the Moderation Badge pattern, now formalized as a reusable interface).

## Repository Structure

```
ahr-platform/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx              # redirects "/" → "/ar"
│       │   ├── not-found.tsx         # global 404
│       │   ├── sitemap.ts             # SEO foundation — sitemap.xml (Milestone 8)
│       │   ├── robots.ts              # SEO foundation — robots.txt (Milestone 8)
│       │   └── [locale]/             # /ar, /en (frozen bilingual routing decision)
│       │       ├── layout.tsx         # locale validation + dir/lang sync
│       │       ├── loading.tsx        # Global Loading
│       │       ├── error.tsx          # Error Boundary
│       │       ├── (site)/            # Milestone 8 — public Website route group
│       │       │   ├── layout.tsx      # SiteHeader + SiteFooter + SkipLink
│       │       │   ├── page.tsx        # Home
│       │       │   ├── about/, works/, works/[slug]/, projects/, projects/[slug]/, media/, recognition/, contact/
│       │       │   ├── loading.tsx     # public-specific card-grid skeleton
│       │       │   └── not-found.tsx   # public-specific 404 (keeps SiteHeader/Footer)
│       │       ├── login/             # Sign In, Forgot/Reset Password
│       │       ├── unauthorized/      # 401-equivalent page
│       │       ├── forbidden/         # 403-equivalent page
│       │       └── dashboard/         # Dashboard Shell (Sidebar/TopBar/Breadcrumbs)
│       ├── components/dashboard/       # Sidebar, TopBar, UserMenu, Breadcrumbs, ModerationBadge
│       ├── components/site/             # Milestone 8 — SiteHeader, SiteFooter, LocaleSwitcher, EntityCard, etc.
│       ├── components/cms/                # Milestone 4 — generic CMS Foundation UI
│       │   ├── fields/                     # TextField, BilingualTextField, SelectField, ToggleField, MediaPickerField
│       │   ├── admin-table.tsx, list-view.tsx, detail-view.tsx, form-layout.tsx
│       │   ├── action-bar.tsx, bulk-actions-bar.tsx, confirm-dialog.tsx, toast.tsx, states.tsx
│       ├── components/shared/           # ThemeProvider, LocaleDirSync
│       ├── lib/                          # cookies.ts, moderation.ts, page-seo.ts, public-site-settings.ts, notification-config.ts, notification-dispatch.ts
│       └── middleware.ts                  # centralized route protection
├── packages/
│   ├── config/              # Shared eslint preset + base tsconfig
│   ├── auth/                 # Milestone 3 — Authentication + role-aware Authorization
│   ├── cms-core/              # Milestone 4 — generic CMS engine (CRUD, validation, slugs, lifecycle, query)
│   ├── content/                # Milestone 5 — ResourceDefinitions + business rules for all 10 Archive entities
│   ├── media/                   # Milestone 6 — Media Library (Storage abstraction, upload pipeline, lifecycle)
│   ├── relationships/             # Milestone 7 — taxonomy joins, cross-entity queries, metadata services
│   ├── search/                     # Milestone 9 — unified Search Engine (ILIKE + relevance heuristic)
│   ├── site/                       # Milestone 8 — locale/SEO/sitemap/theme-token/nav foundation logic
│   ├── workflow/                    # Milestone 10 — Moderation Report workflow + content workflow formalization
│   ├── notifications/                # Milestone 11 — provider abstraction, email delivery, dispatch, preferences
│   ├── ai/                            # AI Integration (14-AI-Integration.md) — provider-agnostic AiClient,
│   │                                    category/tag + summary suggestions, POST /api/ai/suggest
│   └── database/                    # Archive entity migrations + data foundation conventions
│       ├── docs/data-foundation-conventions.md, local-rls-verification.md
│       ├── migrations/         # 19 migrations: extensions → shared functions → 20 tables → Row Level Security
│       └── tests/smoke-test.sql, rls-smoke-test.sql
├── docs/
│   ├── architecture/         # The 14 approved architecture/specification documents + AI Integration addendum
│   ├── phase-1/               # Phase 1 Platform Implementation audit report
│   ├── decisions/            # Architecture Decision Records (ADRs)
│   ├── branching-strategy.md
│   ├── coding-standards.md
│   ├── deployment-guide.md
│   ├── production-readiness-checklist.md
│   ├── release-checklist.md
│   └── rollback-plan.md
├── .github/workflows/ci.yml  # format check, lint, typecheck, test + coverage, build, plus a separate
│                               database-verify job (migrations + both smoke tests against Postgres 16)
├── .env.example
└── package.json              # npm workspaces root
```

## Engineering Decisions

- [ADR-0001: Monorepo vs Polyrepo](./docs/decisions/0001-monorepo-vs-polyrepo.md) — Monorepo approved.
- Stack: Next.js, Tailwind CSS, Supabase, Vercel, GitHub, Cursor (approved for Phase 10).

## Getting Started (local development)

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

## Milestone Roadmap

All 11 planned Development milestones (Project Foundation through Notifications) plus AI Integration are complete — see the Status section above and `DEVELOPMENT-STATUS.md` for the full completion audit, including exactly what was verified and how. `BACKLOG.md` lists everything explicitly deferred past v1.0 — nothing there is authorized for implementation without its own review.

## Verifying This Delivery Yourself

```bash
npm install
npm run format:check
npm run lint
npm run typecheck
npm run test --workspaces --if-present
npm run build
```

For the database layer, see `packages/database/docs/local-rls-verification.md` for how to apply all 19 migrations and run both smoke tests against a disposable local PostgreSQL instance. All of the above was independently re-run and confirmed clean as of `docs/phase-1/Phase-1-Implementation-Audit-Report.md`.

## Traceability

Every module in this repository traces back to an approved architecture document from Phases 1–9. See `docs/coding-standards.md` for how that traceability is expressed in code.
