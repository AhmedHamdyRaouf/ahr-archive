import type { QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";
import type { SearchDbClient } from "../src/search-service";

/**
 * A configurable mock — returns a fixed row set + count per table,
 * regardless of the specific filter chain applied (eq/or/range are all
 * accepted and simply return the same chainable builder). Good enough to
 * test search-service's query CONSTRUCTION indirectly (via call recording)
 * and its RESULT MAPPING/merging/sorting logic directly.
 */
export function createMockSearchClient(
  resultsByTable: Record<
    string,
    { rows: Array<Record<string, unknown>>; count: number; error?: { message: string } | null }
  >,
): SearchDbClient & { calls: Array<{ table: string; method: string; args: unknown[] }> } {
  const calls: Array<{ table: string; method: string; args: unknown[] }> = [];

  function makeBuilder(table: string): QueryBuilderLike {
    const result = resultsByTable[table] ?? { rows: [], count: 0 };
    const listResult: ListQueryResult<unknown> = {
      data: result.error ? null : result.rows,
      count: result.error ? null : result.count,
      error: result.error ?? null,
    };

    const builder: QueryBuilderLike = {
      range: (...args) => {
        calls.push({ table, method: "range", args });
        return builder;
      },
      order: (...args) => {
        calls.push({ table, method: "order", args });
        return builder;
      },
      eq: (...args) => {
        calls.push({ table, method: "eq", args });
        return builder;
      },
      or: (...args) => {
        calls.push({ table, method: "or", args });
        return builder;
      },
      then: (onfulfilled) => Promise.resolve(listResult).then(onfulfilled as never),
    };
    return builder;
  }

  const client = {
    calls,
    from: (table: string) => ({
      select: () => makeBuilder(table),
    }),
  };
  return client as unknown as SearchDbClient & typeof client;
}
