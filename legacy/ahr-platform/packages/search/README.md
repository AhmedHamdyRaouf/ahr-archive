# @ahr/search

**Status:** 🟢 Milestone 9 — Search Engine implemented and tested (25 passing unit tests). Built strictly against the Frozen v1 Database Architecture — no schema changes.

Implements Packages Specification Package 09 using `ILIKE` substring matching and a deterministic relevance heuristic. See [`docs/blocked-fts.md`](./docs/blocked-fts.md) first — PostgreSQL Full-Text Search (`tsvector`, GIN indexes, `ts_rank`) is **not part of the approved database architecture** for V1, even though Database Architecture §16 once described it as a future intention. No migration ever implemented it, and this milestone does not add one.

## Modules

| File                       | Responsibility                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entity-search-configs.ts` | Per-entity table/column mapping for the 5 entities Database Architecture §16 named (Person, Work, Project, Event, Organization)                                 |
| `relevance.ts`             | Deterministic scoring: exact match → prefix match → substring match, plus verified-status and recency tie-breakers                                              |
| `search-service.ts`        | `globalSearch`, `archiveSearch`, `organizationSearch`, `cmsSearch`, `mediaSearch` — matching API Specification 10 - Search API's 5 documented endpoints exactly |

## A Note on Global Search Pagination

Merging ranked results across 5 independent tables without a real search index means correct page-N pagination requires re-fetching each table from its start through the current page's end, then merging, re-sorting, and slicing. This is `O(page × pageSize)` per entity type rather than `O(pageSize)` — an honest, documented cost (see the comment on `globalSearch` in `search-service.ts`), not a hidden inefficiency or a silently-wrong later page.

## A Note on CMS Search Scope

`cmsSearch` only covers the 5 entities `@ahr/search` configures (matching Database Architecture §16). Award/Category/Tag/Press Mention/Contribution are not covered by this unified engine — they already have their own admin list search via `@ahr/cms-core`'s `q` filter (Milestone 5), which remains the correct tool for those five.

## Testing

```bash
npm run test --workspace=packages/search      # 25 tests
npm run typecheck --workspace=packages/search
```
