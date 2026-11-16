import { describe, it, expect } from "vitest";
import { listModerationReports, getModerationReport } from "../src/moderation-queries";
import type { SupabaseLikeClient, QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";

function makeQueryBuilder(result: ListQueryResult<unknown>): QueryBuilderLike {
  const builder: QueryBuilderLike = {
    range: () => builder,
    order: () => builder,
    eq: () => builder,
    or: () => builder,
    then: (onfulfilled) => Promise.resolve(result).then(onfulfilled as never),
  };
  return builder;
}

function createMockClient(result: ListQueryResult<unknown>): SupabaseLikeClient {
  return {
    from: () => ({
      select: () => makeQueryBuilder(result),
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: () => ({
        eq: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  } as unknown as SupabaseLikeClient;
}

describe("moderation-queries — read-side of the Moderation workflow (Milestone 10)", () => {
  it("listModerationReports returns data + pagination meta", async () => {
    const client = createMockClient({
      data: [{ id: "r1", status: "open" }],
      count: 1,
      error: null,
    });
    const result = await listModerationReports(client, { pagination: { page: 1, pageSize: 20 } });
    expect(result.data).toHaveLength(1);
    expect(result.meta.totalItems).toBe(1);
  });

  it("listModerationReports throws a clear error on failure", async () => {
    const client = createMockClient({ data: null, count: null, error: { message: "db down" } });
    await expect(
      listModerationReports(client, { pagination: { page: 1, pageSize: 20 } }),
    ).rejects.toThrow(/db down/);
  });

  it("getModerationReport returns the first matching row", async () => {
    const client = createMockClient({
      data: [{ id: "r1", status: "open" }],
      count: 1,
      error: null,
    });
    const result = await getModerationReport(client, "r1");
    expect(result?.id).toBe("r1");
  });

  it("getModerationReport returns null when no row matches", async () => {
    const client = createMockClient({ data: [], count: 0, error: null });
    const result = await getModerationReport(client, "missing-id");
    expect(result).toBeNull();
  });
});
