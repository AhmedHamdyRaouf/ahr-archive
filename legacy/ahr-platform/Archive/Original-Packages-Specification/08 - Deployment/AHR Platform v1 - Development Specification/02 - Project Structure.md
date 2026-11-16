# AHR Platform v1 — Project Structure

**Status:** 🔒 Frozen

## Repository Strategy

Monorepo (ADR-0001, Milestone 1) — one repository, `apps/` for deployable applications, `packages/` for shared, non-deployable code. No package in this project is ever split into its own repository in V1.

## Top-Level Structure

```
ahr-platform/
├── apps/
│   └── web/              # The single Next.js application — hosts every package's
│                          # UI and Route Handlers/Server Actions (Website + Dashboard)
├── packages/
│   ├── config/            # Shared eslint/tsconfig
│   ├── database/           # Migrations, Data Foundation Conventions, smoke tests
│   ├── auth/                # Authentication package (Package 01)
│   ├── content/              # Archive domain layer (Package 04)
│   ├── governance/            # Verification & Moderation (part of Package 05/07 backend)
│   ├── search/                  # Search package (Package 09)
│   └── ai/                       # AI abstraction layer (Package 06)
├── docs/                          # Architecture Decision Records, this Development
│                                    Specification, and every frozen document's copy
└── package.json                    # npm workspaces root
```

## One Application, Many Packages

There is exactly **one deployable application** (`apps/web`) in V1 — Website (public) and Dashboard (admin) are both rendered by it, under different route groups, not split into separate apps. This matches the Final Build Manifest's single-Release-1 scope; a second app is only introduced if a genuinely separate deployment target is needed later (not speculated on here).

## Package-to-Business-Package Mapping

| Packages Specification package | Codebase location |
|---|---|
| 01 Authentication | `packages/auth` + `apps/web/app/[locale]/login`, `apps/web/middleware.ts` |
| 02 CMS | `apps/web/app/[locale]/dashboard/cms`, using `packages/content` |
| 03 Website | `apps/web/app/[locale]/(site)` |
| 04 Archive | `packages/content` |
| 05 Contacts & Organizations | `apps/web/app/[locale]/dashboard/contacts`, using `packages/content` |
| 06 AI | `packages/ai` |
| 07 Dashboard | `apps/web/app/[locale]/dashboard` (shell), `packages/governance` (moderation/settings logic) |
| 08 Media Library | `apps/web/app/[locale]/dashboard/media` |
| 09 Search | `packages/search` |
| 10 Notifications | Embedded in Dashboard shell — no dedicated package (per Packages Specification Package 10's minimal V1 scope) |

## Rule

A developer working on any package should be able to locate its code from this one table — if a new file doesn't fit anywhere in this mapping, that's a signal to update this document first, not to place the file wherever's convenient.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** ADR-0001 (Monorepo vs Polyrepo), Packages Specification, System/Service Architecture (Phase 8)
