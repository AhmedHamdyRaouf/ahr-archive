# @ahr/content

**Status:** 🟢 Milestone 5 — Content Domain Packages implemented and tested (40 passing unit tests).

Implements Packages Specification Package 04 (Archive) — one `ResourceDefinition` per frozen entity, using `@ahr/cms-core`'s generic engine exclusively. **No duplicated CRUD logic**: every entity's list/create/update/transition/delete/restore goes through the same handful of generic functions.

## Entities Covered

Person, Organization, Work, Project, Event, Award, Category, Tag, Press Mention, Contribution — exactly the 10 entities in Entity Catalog (Phase 4) that have a real table in the Frozen v1 Database Architecture.

## "External Links" — Scope Note

Requested as a domain package, but no `external_link` entity exists in the Frozen v1 Database Architecture, and none is invented here. The only external-link-shaped data that actually exists is `press_mention.url` — covered as a field on the Press Mention definition, not a separate package.

## Modules

| File                 | Responsibility                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `definitions/*.ts`   | One `ResourceDefinition` per entity, copied verbatim from the frozen `check` constraints (work_type, project_type, contribution role, category domain)                                          |
| `business-rules.ts`  | Entity-specific rules `@ahr/cms-core` can't express generically: Contribution's "at least one target," Press Mention's "exactly one subject," Work's "at least one Contribution before publish" |
| `taxonomy.ts`        | Category `domain` scoping (work_type→Work, project_type→Project only)                                                                                                                           |
| `media-relations.ts` | Media Picker abstraction integration — list/attach `media_asset` rows by id, no upload/browsing UI (Media Library is a later milestone)                                                         |
| `service.ts`         | The one integration point every Route Handler calls: permission check (`@ahr/auth`) → business rule → generic repository call → activity log                                                    |

## A Note on Scope Discipline

`assertHasContributionBeforePublish` (the "Work needs a Contribution" rule) is wired to **`works` only** — not `projects`/`events`, even though they share the same relational shape with Contribution. Data Integrity Rules (Phase 4) only states this requirement for Work; extending it further would be inventing a stricter rule the frozen architecture never authorized (the same category of mistake caught and reverted in Milestone 4's status-transition graph).

## Testing

```bash
npm run test --workspace=packages/content        # 40 tests
npm run typecheck --workspace=packages/content
```
