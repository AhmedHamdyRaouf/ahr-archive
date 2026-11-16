# Project Structure

This document explains every top-level folder in `AHR-Platform/` and how to navigate it.

```
AHR-Platform/
├── apps/web/                 Next.js application (public site + Administrator dashboard) — the only deployable artifact
├── packages/                 12 independent, tested TypeScript packages + database migrations
├── .github/                  CI workflow (lint, typecheck, test, build, plus the two SQL behavioral test suites)
├── docs/                     All documentation — see breakdown below
├── content/                  Real content data, import templates, and the import pipeline
├── Archive/                  Superseded source material — historical reference only, never authoritative
├── assets/                   Reserved for binary brand assets (currently empty — see Blocking Issue B10)
├── package.json, package-lock.json, .env.example, .nvmrc, .editorconfig, .prettierrc.json, .gitignore
├── README.md                 Start here
├── MASTER_INDEX.md            Index of every document in the repository
├── PROJECT_STRUCTURE.md       This file
├── CONSOLIDATION_REPORT.md    How this repository was assembled
└── CHANGELOG.md               Log of consolidation-level changes (not feature history — see Git log for that)
```

## `apps/web/`

The Next.js 14 App Router application.

- `app/[locale]/(site)/` — public pages: home, about, works, projects, media, recognition, contact, search. Bilingual via the `[locale]` segment (`/ar`, `/en`).
- `app/[locale]/dashboard/` — the Administrator interface: generic CMS screens for all 10 Archive entities, plus dedicated Media, Moderation, Settings, and Activity screens.
- `app/[locale]/login`, `unauthorized`, `forbidden` — auth-related pages.
- `app/api/` — Route Handlers (content CRUD, media, moderation, search, AI tasks).
- `components/` — organized by concern: `cms/`, `site/`, `dashboard/`, `media/`, `relationships/`, `ai/`, `shared/`.

## `packages/`

Each package is `@ahr/<name>`, independently testable via its own `package.json`.

| Package | Responsibility |
|---|---|
| `database` | SQL migrations (19), data foundation conventions, behavioral test suites |
| `auth` | Identity resolution, authorization, session handling |
| `cms-core` | Generic entity engine: lifecycle, validation, pagination |
| `content` | The 10 Archive entity definitions and their business rules |
| `media` | Storage abstraction and upload pipeline |
| `relationships` | Taxonomy joins and cross-entity queries |
| `search` | Unified search (`ILIKE` + relevance heuristic) |
| `workflow` | Moderation report workflow |
| `notifications` | Notification provider abstraction and dispatch |
| `ai` | AI provider abstraction (OpenAI) and stateless AI tasks |
| `site` | Locale, SEO, and navigation foundation for the public website |
| `config` | Shared ESLint/TypeScript configuration |

## `docs/`

| Folder | What's in it |
|---|---|
| `Architecture/` | Foundational definition of AHR (`Foundational/`), Brand Architecture (`Brand/`), Information Architecture (`Information-Architecture/`, Phase 3), Technical Architecture Principles (`Technical-Architecture-Principles/`, Phase 8), the as-built system architecture, and Architecture Decision Records (`Decision-Records/`) |
| `Business/` | Business Bible, Business Rules, Entity Specifications, Naming Convention, CMS Rules |
| `Knowledge/` | Terminology, Standards, AI Knowledge reference material |
| `Experience/` | Every Experience & Design deliverable — Brand Identity, Design System, Design Tokens, Wireframes, User Flows/Journeys, Personas, UX Research, plus UX Architecture (`UX-Architecture/`, Phase 7) |
| `Database/` | Database architecture (the authoritative, CTO-finalized version), data foundation conventions, domain model |
| `API/` | Full API Specification and API architecture notes |
| `Deployment/` | Deployment guide, security/performance/testing architecture, production readiness and release checklists, QA report |
| `Guides/` | Administrator Handbook, Visitor Guide, Coding Standards, Authentication guide |
| `Development/` | Engineering-facing planning docs: build manifest, backend/frontend/CMS/dashboard/integrations/AI architecture notes, phase implementation audit, backlog, development status, plus Delivery Planning (`Delivery-Planning/`, Phase 9) |
| `Program-Status/` | Cross-cutting, point-in-time reports: Gap Analysis, Roadmap, Completion/Status/Validation/Integration/Product/Version reports, Release Notes, and the full CTO Review set (`CTO-Reviews/`, split into the Phase 2 and Phase 3 review cycles) |

## `content/`

- `Master-Content-Dataset/` — actual CSV content records (people, works, projects, organizations, events, awards, media, press, categories, tags, relationships), plus validation and summary reports. `12-Source-Files/` holds the original legacy exports this dataset was derived from, including the **unresolved** press-archive conflict — see `content/Master-Content-Dataset/12-Source-Files/Excel-Sheets/CONFLICT-NOTE.md`.
- `Import-Templates/` — blank CSV templates matching the schema, per entity.
- `Import-Pipeline/` — the validation script and its documentation.

## `Archive/`

Everything here is superseded, pre-integration, or historical material, kept only so no original content is lost. Nothing in `Archive/` should be treated as current or authoritative — if a document exists both here and in `docs/`, the `docs/` copy is the one to use. See `CONSOLIDATION_REPORT.md` for exactly what was archived and why.

## `assets/`

Empty by design. See `assets/README.md`.
