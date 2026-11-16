# @ahr/cms-core

**Status:** 🟢 Milestone 4 — CMS Foundation implemented and tested (49 passing unit tests).

Generic, entity-agnostic CMS engine — implements no business package (Work, Person, Organization, etc.). A future package supplies a `ResourceDefinition` describing its table/fields and calls the functions below; none of them know what a "Work" is.

## Modules

| File              | Responsibility                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status.ts`       | The shared `status`/`visibility`/`verification_status` enums and the exact transition graph Entity Lifecycles & State Transitions (Phase 6) documents — no invented transitions |
| `slug.ts`         | Public ID / slug generation (`slugify`, `generateUniqueSlug`)                                                                                                                   |
| `types.ts`        | `ResourceDefinition`, `FieldDefinition`, pagination/filter/sort/search types                                                                                                    |
| `validation.ts`   | Generic, ResourceDefinition-driven field validation (required fields, select options, bilingual pairs)                                                                          |
| `query.ts`        | Generic pagination/filter/sort/search query builder (page/pageSize, max 100 — API Standards)                                                                                    |
| `repository.ts`   | Generic CRUD: `genericList/Create/Update/TransitionStatus/SoftDelete/Restore/HardDelete`                                                                                        |
| `revision.ts`     | Revision-ready seam (`RevisionAdapter` interface + `NoOpRevisionAdapter`) — no revision table exists yet                                                                        |
| `media-picker.ts` | Media Picker seam (`MediaPickerAdapter` interface + `RawIdMediaPickerAdapter`) — no Media Library exists yet                                                                    |

## A Note on the Lifecycle Graph

Only the transitions explicitly documented in Entity Lifecycles & State Transitions (Phase 6) are implemented: Draft→Review→Verified→Published→Archived, plus the one documented restore path (Archived→Published). **No backward-correction path (e.g. Review→Draft) is included** — the frozen architecture never authorized one, and this milestone is not permitted to invent business rules. See `status.ts`'s comments.

## Soft Delete / Hard Delete

`genericSoftDelete` is exactly a transition to `archived` — never a row deletion. `genericHardDelete` is refused for anything that has ever left `draft`, matching Data Lifecycle's one documented exception (Phase 4) exactly.

## Bug Fix (Milestone 10): `entity_state_transition` Now Actually Gets Written

`genericTransitionStatus` used to carry a comment claiming a database trigger wrote to `entity_state_transition` automatically. **No such trigger was ever built in any migration** — the table was silently empty from this function's creation in Milestone 4 through Milestone 9. Discovered and fixed while building Milestone 10's audit integration (`@ahr/workflow`): the function now inserts the history row itself, directly, right after a successful transition. No schema change. See `packages/workflow/README.md` for the full account.

## Testing

```bash
npm run test --workspace=packages/cms-core        # 49 tests
npm run typecheck --workspace=packages/cms-core
```

Tests use a synthetic `sample_generic_entity` ResourceDefinition — deliberately not named after any real business entity, per this milestone's "no business packages" rule.
