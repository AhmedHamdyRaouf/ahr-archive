# ADR-0001: Monorepo vs Polyrepo

**Status:** Approved
**Phase:** Phase 10 — Development (pre-Milestone 1)
**Approved By:** Ahmed Hamdy Raouf

## Question

Should the AHR Platform be implemented as a single repository (Monorepo) or multiple independent repositories (Polyrepo)?

## Evaluation Against the Approved Architecture

| Criterion                                                                          | Monorepo                                                                                                                              | Polyrepo                                                                                                                    | Architectural Reference                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Single source of truth for shared types/contracts across services                  | ✅ One shared package, no drift between services                                                                                      | ❌ Contracts must be duplicated or published/versioned separately                                                           | Service Architecture — "no service accesses another's internal data directly, only via a defined contract" (Phase 8) |
| Enforcing Data Integrity Rules and Business Rules consistently across all services | ✅ Shared validation package guarantees identical enforcement everywhere                                                              | ❌ Risk of divergent implementations of the same rule across repos                                                          | Data Integrity Rules (Phase 4), Business Rules (Phase 6)                                                             |
| Incremental, milestone-based delivery (one module maturing before the next)        | ✅ Easy to add Academy/Creative Network later as new packages/apps in the same repo, per Solution Decomposition's layered build order | ✅ Also possible, but requires repo bootstrapping overhead per new module                                                   | Solution Decomposition (Phase 9)                                                                                     |
| Small team / single owner (current project reality)                                | ✅ Lower coordination overhead — one CI pipeline, one review flow                                                                     | ❌ Higher overhead for a single-owner project; benefits of Polyrepo (independent release cadence per team) don't apply here | Delivery Governance (Phase 9) — single approver, single pipeline is sufficient                                       |
| Traceability from code back to architecture documents                              | ✅ One `docs/` tree can map every module to its architecture reference                                                                | ❌ Traceability map must be maintained across repos, higher risk of drift                                                   | Implementation Principles — "traceability from code back to architecture is mandatory" (Phase 9)                     |
| Future technology substitution (Future Technical Evolution, Phase 8)               | ✅ Swapping a package's internal implementation doesn't require repo migration                                                        | ✅ Also possible, roughly neutral                                                                                           | Future Technical Evolution (Phase 8)                                                                                 |

## Decision

**Monorepo.**

No compelling architectural reason favors Polyrepo for AHR at this stage. The project has a single owner, a single approval authority (Delivery Governance — Phase 9), and a strict requirement for one enforced source of truth for shared rules and contracts across Archive, Academy, Creative Network, and the AI layer as they come online. A Monorepo directly serves the "no service accesses another's internal data directly" and "single source of truth per domain" principles (Phase 1, Phase 8) with the least operational overhead.

## Consequence

The repository will use a package-based structure (`apps/` for deployable applications, `packages/` for shared, non-deployable code), so that future modules (Academy, Creative Network) are added as new workspace packages rather than new repositories.
