import { describe, it, expect } from "vitest";
import {
  getCategoriesForEntity,
  getTagsForEntity,
  setCategoriesForEntity,
  setTagsForEntity,
} from "../src/taxonomy-service";
import { createMockQueryClient, createMockWriteClient } from "./mock-query-client";

describe("taxonomy-service — Work/Project category & tag join tables (Milestone 7)", () => {
  it("getCategoriesForEntity reads work_category and returns category ids", async () => {
    const client = createMockQueryClient({
      work_category: {
        data: [{ category_id: "cat-1" }, { category_id: "cat-2" }],
        count: 2,
        error: null,
      },
    });
    const result = await getCategoriesForEntity(client, "works", "w1");
    expect(result).toEqual(["cat-1", "cat-2"]);
  });

  it("getTagsForEntity reads project_tag for projects", async () => {
    const client = createMockQueryClient({
      project_tag: { data: [{ tag_id: "tag-1" }], count: 1, error: null },
    });
    const result = await getTagsForEntity(client, "projects", "p1");
    expect(result).toEqual(["tag-1"]);
  });

  it("rejects an entity type with no taxonomy support (e.g. persons)", async () => {
    const client = createMockQueryClient({});
    // @ts-expect-error — intentionally passing an unsupported entity type to prove the runtime guard
    await expect(getCategoriesForEntity(client, "persons", "p1")).rejects.toThrow(
      /does not support taxonomy/,
    );
  });

  it("setCategoriesForEntity validates each category's domain before writing anything", async () => {
    const client = createMockWriteClient();
    await expect(
      setCategoriesForEntity(client, "works", "w1", [{ id: "cat-1", domain: "project_type" }]),
    ).rejects.toThrow(/TAXONOMY_DOMAIN_MISMATCH|domain/);
    expect(client.insertedRows).toHaveLength(0);
    expect(client.deletedFrom).toHaveLength(0);
  });

  it("setCategoriesForEntity clears the existing set then inserts the new one (full replacement)", async () => {
    const client = createMockWriteClient();
    await setCategoriesForEntity(client, "works", "w1", [{ id: "cat-1", domain: "work_type" }]);
    expect(client.deletedFrom).toContain("work_category");
    expect(client.insertedRows).toEqual([{ work_id: "w1", category_id: "cat-1" }]);
  });

  it("setCategoriesForEntity with an empty array clears the set and inserts nothing", async () => {
    const client = createMockWriteClient();
    await setCategoriesForEntity(client, "works", "w1", []);
    expect(client.deletedFrom).toContain("work_category");
    expect(client.insertedRows).toHaveLength(0);
  });

  it("setTagsForEntity has no domain restriction — any tag id is accepted", async () => {
    const client = createMockWriteClient();
    await setTagsForEntity(client, "projects", "proj1", ["tag-1", "tag-2"]);
    expect(client.deletedFrom).toContain("project_tag");
    expect(client.insertedRows).toEqual([
      { project_id: "proj1", tag_id: "tag-1" },
      { project_id: "proj1", tag_id: "tag-2" },
    ]);
  });
});
