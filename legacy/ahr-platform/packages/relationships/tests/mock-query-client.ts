import type { QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";
import type { RelationshipQueryClient, RelationshipWriteClient } from "../src/types";

/** A minimal QueryBuilderLike mock — chainable AND awaitable, matching the real Postgrest query builder shape. */
export function makeQueryBuilder(result: ListQueryResult<unknown>): QueryBuilderLike {
  const builder: QueryBuilderLike = {
    range: () => builder,
    order: () => builder,
    eq: () => builder,
    or: () => builder,
    then: (onfulfilled) => Promise.resolve(result).then(onfulfilled as never),
  };
  return builder;
}

/** A read-only mock client returning the same result for any table/query — enough for single-query-per-call functions. */
export function createMockQueryClient(
  resultsByTable: Record<string, ListQueryResult<unknown>>,
): RelationshipQueryClient {
  return {
    from: (table: string) => ({
      select: () => makeQueryBuilder(resultsByTable[table] ?? { data: [], count: 0, error: null }),
    }),
  };
}

export function createMockWriteClient(
  overrides: {
    selectResult?: ListQueryResult<unknown>;
    insertError?: { message: string } | null;
    deleteError?: { message: string } | null;
  } = {},
): RelationshipWriteClient & { insertedRows: Record<string, unknown>[]; deletedFrom: string[] } {
  const insertedRows: Record<string, unknown>[] = [];
  const deletedFrom: string[] = [];

  return {
    insertedRows,
    deletedFrom,
    from: (table: string) => ({
      select: () => makeQueryBuilder(overrides.selectResult ?? { data: [], count: 0, error: null }),
      insert: async (rows: Record<string, unknown>[]) => {
        insertedRows.push(...rows);
        return { error: overrides.insertError ?? null };
      },
      delete: () => ({
        eq: async () => {
          deletedFrom.push(table);
          return { error: overrides.deleteError ?? null };
        },
      }),
    }),
  };
}
