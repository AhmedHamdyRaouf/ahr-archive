import { describe, it, expect } from "vitest";
import { NoOpRevisionAdapter } from "../src/revision";

describe("revision — Revision-ready architecture (Milestone 4)", () => {
  it("NoOpRevisionAdapter resolves without persisting anything or throwing", async () => {
    const adapter = new NoOpRevisionAdapter();
    await expect(
      adapter.recordRevision({
        tableName: "sample_generic_entity",
        recordId: "id-1",
        snapshot: { title_en: "A" },
        changedBy: "admin-1",
        changedAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });
});
