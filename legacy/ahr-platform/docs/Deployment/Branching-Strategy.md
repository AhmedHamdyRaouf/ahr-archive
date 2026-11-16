# Branch Strategy

**Architectural reference:** Environment Strategy (Phase 9) — development → staging → production promotion path; Release & Deployment Strategy (Phase 9) — incremental, reversible releases.

## Branches

| Branch                                    | Maps to Environment | Purpose                                                                                         |
| ----------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| `main`                                    | Production          | Always deployable. Every merge here is a release candidate that has already passed staging.     |
| `staging`                                 | Staging             | Integration branch. Mirrors production configuration with non-production data.                  |
| `feature/<milestone>-<short-description>` | Development         | One branch per unit of work (e.g. `feature/m2-entity-catalog-schema`). Branched from `staging`. |
| `fix/<short-description>`                 | Development         | Bug fixes, same rules as `feature/*`.                                                           |

## Rules

1. **No direct commits to `main` or `staging`.** All changes arrive via pull request.
2. **One feature branch = one milestone unit of work**, traceable to a specific architecture document (Implementation Principles, Phase 9: "traceability from code back to architecture is mandatory").
3. **`staging` → `main` promotion only after the milestone's review is complete** (Testing Architecture, Phase 9), never partway through a milestone.
4. **No direct-to-production hotfixes** that skip staging, except for a documented, approved incident — logged as an exception per Platform Policies & Exception Handling (Phase 6) equivalent process.
5. **Branches are short-lived.** A feature branch is merged and deleted once its milestone unit is reviewed and accepted; it is not kept alive across multiple milestones.

## Commit Messages

Format: `[<milestone-id>] <short description>` — e.g. `[M1] add shared eslint/tsconfig packages`. This keeps every commit traceable to a Phase 10 milestone.
