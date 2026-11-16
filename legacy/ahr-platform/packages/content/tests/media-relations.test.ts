import { describe, it, expect } from "vitest";
import {
  listRelatedMedia,
  attachExistingMedia,
  type MediaRelationsClient,
} from "../src/media-relations";

function createMockClient(
  overrides: {
    listData?: unknown[];
    listError?: { message: string } | null;
    updateError?: { message: string } | null;
  } = {},
): MediaRelationsClient & { updateCalledWith?: Record<string, unknown> } {
  const state: { updateCalledWith?: Record<string, unknown> } = {};

  const client = {
    from: () => ({
      select: () => ({
        eq: async () => ({ data: overrides.listData ?? [], error: overrides.listError ?? null }),
      }),
      update: (row: Record<string, unknown>) => {
        state.updateCalledWith = row;
        return { eq: async () => ({ data: null, error: overrides.updateError ?? null }) };
      },
    }),
    get updateCalledWith() {
      return state.updateCalledWith;
    },
  };
  return client as MediaRelationsClient & typeof state;
}

describe("media-relations — Media Picker abstraction integration (Milestone 5)", () => {
  it("listRelatedMedia returns the media_asset rows for a given owner", async () => {
    const client = createMockClient({ listData: [{ id: "m1" }] });
    const result = await listRelatedMedia(client, "work", "w1");
    expect(result).toEqual([{ id: "m1" }]);
  });

  it("listRelatedMedia throws on a query error", async () => {
    const client = createMockClient({ listError: { message: "boom" } });
    await expect(listRelatedMedia(client, "work", "w1")).rejects.toThrow(/boom/);
  });

  it("attachExistingMedia sets the correct owner column for each owner type", async () => {
    const workClient = createMockClient();
    await attachExistingMedia(workClient, "m1", "work", "w1");
    expect(workClient.updateCalledWith).toEqual({ work_id: "w1" });

    const personClient = createMockClient();
    await attachExistingMedia(personClient, "m1", "person", "p1");
    expect(personClient.updateCalledWith).toEqual({ person_id: "p1" });
  });

  it("attachExistingMedia throws on an update error", async () => {
    const client = createMockClient({ updateError: { message: "constraint violation" } });
    await expect(attachExistingMedia(client, "m1", "event", "e1")).rejects.toThrow(
      /constraint violation/,
    );
  });
});
