# @ahr/workflow

**Status:** 🟢 Milestone 10 — Workflow Engine implemented and tested (25 passing unit tests). Built strictly against the Frozen v1 Database Architecture — no schema changes.

## A Real Bug Found and Fixed First (Milestone 4, `@ahr/cms-core`)

Before writing any new code, this milestone's own scope ("Audit integration using the existing architecture") required checking whether `entity_state_transition` actually gets written to. **It never did.** Every migration from Milestone 2 onward was checked directly — no migration ever created a database trigger for this table. But `@ahr/cms-core`'s `genericTransitionStatus` (Milestone 4) carried a comment claiming _"The transition itself is logged to entity_state_transition by the shared database trigger mechanism established in Milestone 2."_ That trigger was never built. **`entity_state_transition` has been silently empty since Milestone 4** — every status transition made through Milestones 4–9 succeeded, but none of them left an audit trail.

**The fix:** `genericTransitionStatus` now inserts the history row itself, directly, right after a successful transition — no schema change, no new migration, just application code doing what the (false) comment always claimed already happened. Two new tests were added to `@ahr/cms-core`'s own test suite proving the row is written, and that a history-write failure never blocks the transition itself (Observability principle, Phase 8). See the diff in `packages/cms-core/src/repository.ts` and its tests.

## What This Package Adds

| File                    | Responsibility                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `moderation-graph.ts`   | The Moderation Report's own lifecycle — `open → in_review → escalated/resolved`, entirely distinct from content `status`                                                              |
| `validation.ts`         | `resolutionNotes` required when resolving; a non-empty `reason` required to open a report                                                                                             |
| `moderation-service.ts` | `openModerationReport`, `transitionModerationReport`, `assignModerationReport` — the first real "approval and review flow" in this platform                                           |
| `moderation-queries.ts` | List/get moderation reports — read-side, never implemented until now (Milestone 3 only ever read the open _count_ for the Top Bar badge)                                              |
| `content-workflow.ts`   | A thin re-export of `@ahr/cms-core`'s content status graph and `@ahr/relationships`' history reads — formalizes "workflow definitions" for content without duplicating either package |

## Why `moderation_report` Doesn't Use the Generic CMS Engine

It has no `draft` status (starts at `open`), no `visibility`/`verification_status`/`source`/`owner_id` columns, and its own transition graph. Forcing it through `@ahr/cms-core`'s `genericCreate`/`genericTransitionStatus` would violate `chk_moderation_report_status` or weaken those functions' guarantees for every other entity. Bespoke, tested code — same reasoning as Milestone 7's taxonomy join-table services.

## Testing

```bash
npm run test --workspace=packages/workflow      # 25 tests
npm run test --workspace=packages/cms-core       # 51 tests (49 + 2 new, covering the bug fix)
npm run typecheck --workspace=packages/workflow
```
