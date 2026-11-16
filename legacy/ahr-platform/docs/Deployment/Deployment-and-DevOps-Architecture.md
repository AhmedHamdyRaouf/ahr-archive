# AHR Platform v1 — Deployment & DevOps Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)

---

## 1. Repository Strategy

Monorepo, npm workspaces (ADR-0001, decided against polyrepo at Milestone 1). One repository, hosted on GitHub. No package in v1 is ever split into its own repository.

```
ahr-platform/
├── apps/
│   └── web/                # The single deployable application
├── packages/
│   ├── config/              # Shared eslint/tsconfig
│   ├── database/             # Migrations, conventions, smoke tests
│   ├── auth/                  # Package 01 — Authentication
│   ├── cms-core/                # Generic CMS engine
│   ├── content/                   # Package 04 — Archive domain layer
│   ├── media/                       # Package 08 — Media Library
│   ├── relationships/                 # Cross-entity + taxonomy services
│   ├── workflow/                        # Moderation report lifecycle
│   ├── search/                            # Package 09 — Search
│   ├── notifications/                       # Package 10 — Notifications
│   └── site/                                  # Public routing/SEO utilities
├── docs/                                        # ADRs, this spec's source documents
└── package.json                                  # npm workspaces root
```

## 2. Folder Structure Rules (`apps/web`)

```
apps/web/
├── app/
│   └── [locale]/                  # 'ar' | 'en'
│       ├── (site)/                 # Public Website route group
│       ├── login/
│       │   └── reset/
│       └── dashboard/               # Authenticated route group
│           ├── cms/[entityType]/[id]/
│           ├── media/[id]/
│           ├── moderation/[id]/
│           ├── activity/
│           └── settings/
├── app/api/                          # Route Handlers
├── components/                        # Shared UI components
├── middleware.ts                       # Route protection
└── package.json
```

Every `packages/<name>` follows the same internal shape: `src/index.ts` (public exports only), internal modules not exported directly, `package.json`, `README.md` documenting what the package owns. `[entityType]` folders implement one generic entity family — never one folder per entity type duplicating identical logic.

## 3. Environments and Promotion Path

| Environment | Purpose |
|---|---|
| Development | Build and initial test; trial data only, never representing real users |
| Staging | Full production simulation for pre-launch verification; realistic but isolated data |
| Production | The live environment real users and their documented data interact with |

**Full isolation:** production data is never used in development or staging without being stripped of sensitive information first.
**Fixed promotion order:** development → staging → production. No change is ever deployed directly to production, bypassing staging, regardless of how small it appears — except a documented, explicitly approved incident hotfix (an exception, logged, not a routine path).
**Environment parity:** staging mirrors production's logical structure as closely as possible (not necessarily its data volume), so a passing staging test is a reliable signal for production.

## 4. Branch Strategy

| Branch | Maps to environment | Purpose |
|---|---|---|
| `main` | Production | Always deployable; every merge is a release candidate that already passed staging |
| `staging` | Staging | Integration branch, mirrors production configuration with non-production data |
| `feature/<milestone>-<short-description>` | Development | One branch per unit of work, branched from `staging` |
| `fix/<short-description>` | Development | Bug fixes, same rules as `feature/*` |

Rules: no direct commits to `main` or `staging` — every change arrives via pull request; one feature branch traces to one specific unit of work; `staging → main` promotion only after that unit's full review is complete, never mid-milestone; branches are short-lived, deleted once merged; commit messages use `[<milestone-id>] <short description>` for traceability back to the build plan.

## 5. Continuous Integration

Every pull request and push to `staging`/`main` runs, in order: dependency install → format check (Prettier) → lint (shared ESLint preset) → typecheck (TypeScript strict, all workspaces) → test (all workspaces) → build. A failure at any step blocks the merge — there is no manual override path documented for a failing CI run.

## 6. Release & Deployment Principles

1. **Incremental rollout over big-bang** — a substantive change ships to a limited scope first where a unified experience allows it, not to every user simultaneously.
2. **Immediate rollback capability** — every release has a fast rollback path to the previous version without losing data entered during it (No Hard Delete extends this guarantee to deployments, not just content).
3. **Mandatory approval gate before production** — no release reaches production without passing every Testing Architecture layer (`12-Testing.md`) and receiving explicit Delivery Governance approval (§8).
4. **No implicit rule changes** — any release touching Business Rules or Data Integrity Rules requires a documented architecture review before shipping, never as an incidental part of a routine technical release.

## 7. Definition of Done — Version 1

Version 1 is done when all of the following are simultaneously true:

1. **Scope purity** — no code, route, table, or reference to Academy or Creative Network exists anywhere in the codebase.
2. **All twelve build packages (P1–P12) are complete** and have passed the project's review cycle.
3. **The Administrator Dashboard is the only interface used** to create, verify, publish, and moderate content — no direct database/API access required for normal operation.
4. **Every Testing Architecture layer passes** (`12-Testing.md` §2).
5. **The Archive is fully populated** from the legacy sources identified in the pre-build audit, every migrated record traceable to its original source (§8 below).
6. **Security is enforced by default** (RLS active on every table) and **observability is live** (every state transition and AI output logged).
7. **Operational Readiness is formally signed off** by the Platform Owner (§9).
8. **The production release has been deployed**, and the Platform Owner has given explicit Delivery Governance approval (§10).

**Code-complete is not the same as publicly launchable.** Two items can leave v1 code-complete while still blocking public launch specifically: final visual identity values (colors, typography, logo — a product/design decision, not an engineering one) and the legal/compliance procedure for a permanent-deletion exception request (only blocks sign-off if a real deletion request arises before it's resolved).

## 8. Legacy Data Migration Strategy

1. **Consolidate before migrating.** Any source with multiple conflicting versions (e.g., legacy CRM exports, old site page copies) is resolved to one approved version *before* migration begins, never decided arbitrarily mid-migration.
2. **No data loss.** Anything without a direct home in the current Entity Catalog is preserved as a legacy reference rather than dropped or ignored.
3. **Cautious initial verification state.** Every migrated entity starts at `self_reported` or `pending` verification status — never automatically `verified` merely for having existed in the legacy archive.
4. **Staged by entity priority.** Core entities (Person, Work, Organization) migrate before secondary content (Press, supporting Media).
5. **Source preservation.** Every migrated entity retains a reference to its original legacy source for later traceability.
6. **Conflicts are a governance decision, not an automatic pick.** Any conflict discovered mid-migration (two legacy sources disagreeing) is escalated for an explicit decision, never resolved by an arbitrary default.

## 9. Operational Readiness Checklist (Categories)

| Category | Readiness condition |
|---|---|
| Data readiness | Core-entity migration layers complete without loss; known conflicts resolved |
| Security readiness | Security Architecture principles active by default across every service, not partially |
| Observability readiness | Core system health is observable before the first real user arrives |
| Governance readiness | Delivery Governance path is active; the Platform Owner can approve or halt any release |
| Recovery readiness | A rollback path has been actually tested, not just documented as theoretically possible |
| Support readiness | Clear, named ownership for who follows up on any operational issue immediately post-launch |

**No inconsistent partial launch:** no public-facing component ships until every readiness category above is satisfied for its scope, even if that component looks functionally complete on its own.

## 10. Delivery Governance

Final production-release approval authority rests with the Platform Owner. Approval path:

```
① Every Testing Architecture layer passes
② Operational Readiness is confirmed for the release's scope
③ Architecture review for any unexpected structural impact
④ Explicit Platform Owner approval
⑤ Release, per §6
```

Passing technical tests alone never constitutes approval — explicit Platform Owner sign-off is always a separate, mandatory step. Changes touching Data Integrity Rules or Business Rules directly, any AI capability expansion approaching AI Decision Boundaries, or any expansion of the frozen v1 scope each require an additional architecture review before that sign-off.

## Backlog

- Automated blue/green or canary deployment tooling (current rollout is not yet automated beyond the CI gate above).
- Formal legal/compliance procedure for the permanent-deletion exception (blocks only that specific scenario at sign-off, not general readiness).
- A second deployable application, if a genuinely separate deployment target is ever needed.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Solution Decomposition, Development Boundaries, Environment Strategy, Testing Architecture, Release and Deployment Strategy, Migration Strategy, Operational Readiness, Delivery Governance (Phase 9); Final Build Manifest; Project/Folder Structure (Development Specification 02–03); branching-strategy.md; ci.yml
