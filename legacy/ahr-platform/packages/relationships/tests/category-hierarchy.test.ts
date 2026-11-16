import { describe, it, expect } from "vitest";
import { getChildCategories, getRootCategories } from "../src/category-hierarchy";
import { createMockQueryClient } from "./mock-query-client";

describe("category-hierarchy — Category self-reference queries (Milestone 7)", () => {
  it("getChildCategories queries by parent_id", async () => {
    const client = createMockQueryClient({
      category: {
        data: [{ id: "c1", parent_id: "root1", domain: "work_type" }],
        count: 1,
        error: null,
      },
    });
    const result = await getChildCategories(client, "root1");
    expect(result).toHaveLength(1);
  });

  it("getRootCategories filters to rows with parent_id === null within a domain", async () => {
    const client = createMockQueryClient({
      category: {
        data: [
          { id: "root1", parent_id: null, domain: "work_type" },
          { id: "child1", parent_id: "root1", domain: "work_type" },
        ],
        count: 2,
        error: null,
      },
    });
    const result = await getRootCategories(client, "work_type");
    expect(result.map((c) => c.id)).toEqual(["root1"]);
  });
});
