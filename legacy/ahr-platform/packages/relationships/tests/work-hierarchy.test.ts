import { describe, it, expect } from "vitest";
import { getChildWorks, getWorkAncestors } from "../src/work-hierarchy";
import { createMockQueryClient, makeQueryBuilder } from "./mock-query-client";
import type { RelationshipQueryClient } from "../src/types";
import type { ListQueryResult } from "@ahr/cms-core";

describe("work-hierarchy — compound-work self-reference queries (Milestone 7)", () => {
  it("getChildWorks queries work by parent_work_id", async () => {
    const client = createMockQueryClient({
      work: { data: [{ id: "track1", parent_work_id: "album1" }], count: 1, error: null },
    });
    const result = await getChildWorks(client, "album1");
    expect(result).toHaveLength(1);
  });

  it("getWorkAncestors walks parent_work_id up to the root", async () => {
    // work A (id-A) -> parent B (id-B) -> parent C (id-C, no further parent)
    const byId: Record<string, Record<string, unknown>> = {
      "id-A": { id: "id-A", parent_work_id: "id-B" },
      "id-B": { id: "id-B", parent_work_id: "id-C" },
      "id-C": { id: "id-C", parent_work_id: null },
    };

    const client: RelationshipQueryClient = {
      from: () => ({
        select: () => ({
          eq: (_field: string, value: unknown) => {
            const row = byId[value as string];
            const result: ListQueryResult<unknown> = {
              data: row ? [row] : [],
              count: row ? 1 : 0,
              error: null,
            };
            return makeQueryBuilder(result);
          },
        }),
      }),
    } as unknown as RelationshipQueryClient;

    const ancestors = await getWorkAncestors(client, "id-A");
    expect(ancestors.map((w) => w.id)).toEqual(["id-B", "id-C"]);
  });

  it("getWorkAncestors returns an empty list for a work with no parent", async () => {
    const client = createMockQueryClient({
      work: { data: [{ id: "solo-work", parent_work_id: null }], count: 1, error: null },
    });
    const ancestors = await getWorkAncestors(client, "solo-work");
    expect(ancestors).toEqual([]);
  });
});
