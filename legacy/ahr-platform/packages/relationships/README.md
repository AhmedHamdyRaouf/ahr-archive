# @ahr/relationships

**Status:** 🟢 Milestone 7 — Relationships & Metadata implemented and tested (33 passing unit tests). Built strictly against the Frozen v1 Database Architecture — no schema changes.

Cross-entity relationship services and shared metadata services, built entirely on relationships and columns that already existed in the Milestone 2 schema — several of which (the taxonomy join tables, `entity_state_transition` as a read source) were migrated back then but never exposed as a service until now.

## Why This Is a Separate Package From `@ahr/cms-core`'s Generic Engine

The taxonomy join tables (`work_category`, `work_tag`, `project_category`, `project_tag`) have a **composite primary key and no `id`/audit/status columns** — they cannot go through `@ahr/cms-core`'s `genericCreate`/`genericList` (which assume an `id` primary key and lifecycle columns). `taxonomy-service.ts` is bespoke, tested code for exactly that structural reason, not an oversight or a deviation from "reuse the generic engine wherever possible."

## Modules

| File                       | Responsibility                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `taxonomy-service.ts`      | Full-replacement Category/Tag assignment for Work/Project (`work_category`/`work_tag`/`project_category`/`project_tag`)                           |
| `contribution-queries.ts`  | Cross-entity queries via the Person↔Work/Project/Event Contribution relationship                                                                  |
| `press-mention-queries.ts` | Cross-entity queries via Press Mention's "exactly one subject" relationship                                                                       |
| `award-queries.ts`         | Cross-entity queries via Award's Organization/Person relationships                                                                                |
| `work-hierarchy.ts`        | Compound-work self-reference (`parent_work_id`) — children and cycle-safe ancestor walk                                                           |
| `category-hierarchy.ts`    | Category self-reference (`parent_id`), domain-scoped                                                                                              |
| `state-history-service.ts` | Reads `entity_state_transition` — every entity's lifecycle history, written since Milestone 2/4/5/6, exposed as a read service for the first time |
| `metadata-service.ts`      | Updates the shared metadata fields (`visibility`, `verification_status`, `owner_id`, `source`) every content table carries                        |

## A Note on `verification_status`

Unlike `status` (which has a documented, enforced transition graph — Milestone 4), **no transition sequence for `verification_status` exists anywhere in the frozen architecture.** `updateVerificationStatus` therefore accepts any value from the frozen `verified | self_reported | pending | archived` set directly, with no enforced ordering. Inventing a sequencing rule here would repeat the same category of mistake already caught and reverted once in Milestone 4 (the status-transition graph) — extending the architecture beyond what was actually approved.

## A Note on Duplicated Validation Logic

`taxonomy-service.ts` imports `@ahr/content`'s `assertCategoryDomainMatches` directly rather than re-implementing it — this package is new (Milestone 7), so depending on an existing, already-tested check from `@ahr/content` doesn't violate "do not modify Milestones 1–6." This is different from Milestone 6's situation, where `@ahr/media` duplicated a small check instead of introducing a new cross-package dependency; here, reuse was the more direct option and no frozen package needed to change.

## Testing

```bash
npm run test --workspace=packages/relationships       # 33 tests
npm run typecheck --workspace=packages/relationships
```
