# AHR Platform v1 — Architecture Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Audience:** Engineering team, all disciplines
**Scope:** Logical + physical system architecture actually adopted for AHR Platform Version 1. This document freezes what already exists; it does not reopen any decision recorded in the project's own architecture documents (Phases 1–9, Packages Specification, Database Architecture, Development Specification, and the codebase itself).

This document does not cover: database schema (→ `02-Database.md`), package-level backend implementation rules (→ `03-Backend.md`), the API contract (→ `07-API.md`), identity/access mechanics (→ `08-Authentication-and-Authorization.md`), or AI runtime detail (→ `14-AI-Integration.md`). It is the map that ties all of those together.

---

## 1. Product Scope for v1 (Reference Only)

Version 1 ships **Archive only**. AHR Academy and AHR Creative Network are out of scope for v1 in their entirety — no route, table, page, or package references either. This is a frozen scope decision (Final Build Manifest, §1–§2) and is not revisited by this document. Any Academy/Creative Network technical note in this deliverable set exists solely to confirm that v1's architecture does not block their future addition (see §7).

## 2. Frozen Technology Stack

| Layer | Decision | Status |
|---|---|---|
| Repository strategy | Monorepo, npm workspaces | 🔒 Frozen (ADR-0001) |
| Frontend framework | Next.js (App Router) | 🔒 Frozen |
| Styling | Tailwind CSS | 🔒 Frozen |
| Database / BaaS | Supabase (PostgreSQL) | 🔒 Frozen |
| Authentication | Supabase Auth | 🔒 Frozen |
| File storage | Supabase Storage | 🔒 Frozen |
| Hosting | Vercel | 🔒 Frozen |
| Source control | GitHub | 🔒 Frozen |
| API mechanism | Next.js Route Handlers + Server Actions (no separate backend service) | 🔒 Frozen |
| Bilingual routing | `/ar` and `/en` path segments (Next.js App Router locale segments) | 🔒 Frozen |
| AI provider | OpenAI only, behind a provider-agnostic abstraction layer | 🔒 Frozen |
| Language | TypeScript, `strict: true`, everywhere | 🔒 Frozen |

No alternative is evaluated by this document. Any future change to a row above is a new, explicit engineering decision following the same review process used for ADR-0001 — never an incidental side effect of another package's work.

## 3. Logical System Map

AHR Platform v1 is **one deployable application** (`apps/web`) that renders two distinct experiences from the same codebase and the same data:

```
                      ┌───────────────────────────┐
                      │        apps/web            │
                      │  (single Next.js app)       │
                      │                              │
                      │  Public Website  Admin Dashboard
                      │  /{locale}/(site)  /{locale}/dashboard
                      └───────────┬──────────────────┘
                                  │ calls in-process (Server Components)
                                  │ or via /api Route Handlers (external callers)
                                  ▼
        ┌─────────────────────────────────────────────────────────┐
        │                    packages/*  (domain logic)             │
        │  auth · cms-core · content · relationships · media ·      │
        │  search · workflow · notifications · site · database      │
        └───────────────────────────┬─────────────────────────────┘
                                     ▼
                      ┌───────────────────────────┐
                      │   Supabase (Postgres +      │
                      │   Auth + Storage)            │
                      └───────────────────────────┘
                                     │
                                     ▼
                      ┌───────────────────────────┐
                      │  OpenAI (behind abstraction) │
                      │  Email provider (behind       │
                      │  abstraction)                  │
                      └───────────────────────────┘
```

**Dependency direction is strictly one-way**: Experience (pages/components) → domain packages → Supabase. No domain package depends on `apps/web`; no package reaches into another package's internals (see `03-Backend.md` §2).

## 4. Logical Systems and Their Responsibility

| System | Realized by | Responsibility |
|---|---|---|
| Core Data System | `packages/database` + Supabase Postgres | Single source of truth for every entity; schema, migrations, RLS |
| Identity & Governance System | `packages/auth` | Resolves "who is making this request"; enforces role/ownership at the boundary |
| Content System | `packages/cms-core` + `packages/content` + `packages/relationships` | Entity CRUD, lifecycle, taxonomy, cross-entity relationships |
| Media System | `packages/media` | Upload, storage-path management, lifecycle, signed-URL access |
| Governance/Workflow System | `packages/workflow` | Moderation report lifecycle, audit integration |
| Discovery System | `packages/search` | Full-text-style search and ranking over published content |
| Notification System | `packages/notifications` | Bilingual notification dispatch (email channel today) |
| Public Experience System | `packages/site` + `apps/web/app/[locale]/(site)` | Bilingual routing, SEO, sitemap, public rendering logic |
| Admin Experience System | `apps/web/app/[locale]/dashboard` | Shell, navigation, settings, activity log, moderation queue UI |
| Intelligence System | *(planned, not yet built — see `14-AI-Integration.md`)* | Archive-scoped AI recommendation, human-reviewed only |

This table is the authoritative mapping from "logical system" (as framed in the platform's Technical Architecture Principles) to the actual package that implements it. If a new file doesn't fit a row above, that is a signal to update this document first — never a reason to place code wherever's convenient (Development Principles, rule carried forward unchanged).

## 5. Governing Architecture Principles (Carried Forward, Not Restated in Full)

These principles govern every deliverable in this set and are not re-derived per document:

1. **Separation of concerns** — one system, one responsibility; no overlap.
2. **Single source of truth per domain** — no concept (identity, content, decision) is stored authoritatively in more than one place.
3. **Rule enforcement at the boundary** — an approved rule (data integrity, business rule, AI boundary) is enforced at the point of entry, never left to caller discipline.
4. **Replaceability over rebuilding** — any component is replaceable behind its own contract without restructuring its neighbors.
5. **Full traceability** — every consequential action (publish, verify, moderate, AI output) is attributable and auditable end to end.
6. **Growth by addition** — new capability extends the existing systems; it does not require re-architecting them.

## 6. Route Groups and Application Shape

```
apps/web/app/[locale]/
  (site)/        — Public Website route group (fully public, no session check)
  login/         — Public sign-in / password reset
  dashboard/     — Authenticated route group (Administrator only)
```

`(site)` and `dashboard` are two registers of the same system, not two applications — a single `middleware.ts` gate protects the entire `/dashboard/*` prefix (see `08-Authentication-and-Authorization.md`). Full folder-level detail lives in `13-Deployment-and-DevOps.md` §2 (Project/Folder Structure); this document only fixes the two-route-group shape as an architectural fact.

## 7. Forward-Compatibility With Release 2 (Compatibility Check, Not a Plan)

Nothing in this architecture requires restructuring to add AHR Academy or AHR Creative Network later:

- `person` remains the shared identity anchor for any future module.
- `platform_user.role` is a constrained `text` value, not a fixed enum — new roles are an additive constraint change.
- `entity_state_transition`, `moderation_report`, and `activity_log` reference `(entity_table, entity_id)` generically — a future module's entities get history/audit/moderation for free.
- No v1 table holds a foreign key into a not-yet-existing Release 2 table.

No Release 2 table, route, or package is created by this document or any other v1 CTO deliverable.

## 8. Explicitly Out of Scope for This Document

- Database schema detail → `02-Database.md`
- Package-internal backend rules → `03-Backend.md`
- Frontend rendering/component rules → `04-Frontend.md`
- API wire contract → `07-API.md`
- Authentication/authorization mechanics → `08-Authentication-and-Authorization.md`
- External provider integration detail → `09-Integrations.md`
- Security control detail → `10-Security.md`
- Performance/observability detail → `11-Performance.md`
- Testing strategy → `12-Testing.md`
- Deployment/DevOps mechanics → `13-Deployment-and-DevOps.md`
- AI runtime detail → `14-AI-Integration.md`

## Backlog (Explicitly Out of v1 — Not to Be Implemented Now)

- Separate deployable applications for Website vs. Dashboard (only introduced if a genuine separate deployment target emerges).
- Multiple Postgres schemas (only introduced if Academy/Creative Network need true data isolation at build time).
- AHR Academy and AHR Creative Network logical systems in full.
- Mobile application (fully out of scope for v1).

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Technical Architecture Principles, System Architecture, Service Architecture, Integration Architecture (Phase 8); Final Build Manifest; Database Architecture (Frozen v1); Development Specification 01–03
