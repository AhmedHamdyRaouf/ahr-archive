import { describe, it, expect } from "vitest";
import {
  ownerTypeToColumn,
  listPlatformLinksForEntity,
  createPlatformLink,
  updatePlatformLink,
  removePlatformLink,
  reorderPlatformLinks,
  PlatformLinkValidationError,
} from "../src/platform-link-service";
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

function createMockDb(
  overrides: {
    listResult?: ListQueryResult<unknown>;
    insertResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    updateResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    deleteError?: { message: string } | null;
  } = {},
): SupabaseLikeClient & { updateCalledWith: Record<string, unknown>[] } {
  const updateCalledWith: Record<string, unknown>[] = [];
  const client = {
    from: () => ({
      select: () => makeQueryBuilder(overrides.listResult ?? { data: [], count: 0, error: null }),
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () =>
            overrides.insertResult ?? { data: { id: "link-1", ...row }, error: null },
        }),
      }),
      update: (row: Record<string, unknown>) => {
        updateCalledWith.push(row);
        return {
          eq: () => ({
            select: () => ({
              single: async () =>
                overrides.updateResult ?? { data: { id: "existing-id", ...row }, error: null },
            }),
          }),
        };
      },
      delete: () => ({ eq: async () => ({ error: overrides.deleteError ?? null }) }),
    }),
    updateCalledWith,
  };
  return client as unknown as SupabaseLikeClient & typeof client;
}

describe("platform-link-service (data owner request, 2026-07-25)", () => {
  it("ownerTypeToColumn maps every owner type to its real column name", () => {
    expect(ownerTypeToColumn("person")).toBe("person_id");
    expect(ownerTypeToColumn("organization")).toBe("organization_id");
    expect(ownerTypeToColumn("project")).toBe("project_id");
    expect(ownerTypeToColumn("work")).toBe("work_id");
  });

  it("listPlatformLinksForEntity filters by the correct owner column and sorts by display_order", async () => {
    const db = createMockDb({
      listResult: {
        data: [{ id: "link-1", display_order: 0 }],
        count: 1,
        error: null,
      },
    });
    const result = await listPlatformLinksForEntity(db, "person", "p1");
    expect(result).toEqual([{ id: "link-1", display_order: 0 }]);
  });

  it("createPlatformLink sets the correct owner column and platform_id", async () => {
    const db = createMockDb();
    const result = await createPlatformLink(db, "admin-1", "organization", "org-1", {
      platformId: "plat-1",
      url: "https://facebook.com/example",
    });
    expect(result).toMatchObject({
      organization_id: "org-1",
      platform_id: "plat-1",
      url: "https://facebook.com/example",
      created_by: "admin-1",
    });
  });

  it("createPlatformLink surfaces a clear PlatformLinkValidationError on a duplicate assignment", async () => {
    const db = createMockDb({
      insertResult: {
        data: null,
        error: {
          message:
            'duplicate key value violates unique constraint "uq_entity_external_link_person"',
        },
      },
    });
    await expect(
      createPlatformLink(db, "admin-1", "person", "p1", {
        platformId: "plat-1",
        url: "https://spotify.com/example",
      }),
    ).rejects.toThrow(PlatformLinkValidationError);
  });

  it("updatePlatformLink only sends the fields provided", async () => {
    const db = createMockDb();
    await updatePlatformLink(db, "admin-1", "link-1", { url: "https://x.com/new" });
    expect(db.updateCalledWith[0]).toMatchObject({ url: "https://x.com/new" });
    expect(db.updateCalledWith[0]).not.toHaveProperty("display_order");
    expect(db.updateCalledWith[0]).not.toHaveProperty("is_visible");
  });

  it("removePlatformLink performs a real delete (no lifecycle to protect here)", async () => {
    const db = createMockDb();
    await expect(removePlatformLink(db, "admin-1", "link-1")).resolves.toBeUndefined();
  });

  it("reorderPlatformLinks writes each link's new index as its display_order", async () => {
    const db = createMockDb();
    await reorderPlatformLinks(db, "admin-1", ["link-a", "link-b", "link-c"]);
    const orders = db.updateCalledWith.map((row) => row.display_order);
    expect(orders.sort()).toEqual([0, 1, 2]);
  });
});
