# AHR Platform v1 — Branch Strategy

**Status:** 🔒 Frozen

This is the frozen branch model itself (unchanged from Milestone 1's `docs/branching-strategy.md`), reproduced here so the Development Specification is self-contained for a new developer who hasn't yet found that earlier document.

## Branches

| Branch | Maps to Environment | Purpose |
|---|---|---|
| `main` | Production | Always deployable; every merge here already passed staging |
| `staging` | Staging | Integration branch, mirrors production configuration |
| `feature/<milestone>-<short-description>` | Development | One branch per unit of work, branched from `staging` |
| `fix/<short-description>` | Development | Bug fixes, same rules as `feature/*` |

## Rules

1. No direct commits to `main` or `staging` — Pull Request only.
2. One feature branch = one milestone unit of work, traceable to a specific architecture document.
3. `staging` → `main` promotion only after the milestone's full review is complete.
4. No direct-to-production hotfixes that skip staging, except a documented, approved incident.
5. Branches are short-lived — merged and deleted once reviewed and accepted, not kept alive across multiple milestones.

## Relationship to Milestones

Every branch name's `<milestone>` segment corresponds to a Build Manifest Package/Milestone (e.g. `m4-content-services`, `m9-legacy-migration`) — this is what lets `16 - Git Workflow`'s traceability rule be checked by simply reading branch names in the repository's history.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Git Workflow (16), Build Manifest (Package Execution Order)
