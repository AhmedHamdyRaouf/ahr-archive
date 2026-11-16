import { describe, it, expect } from "vitest";
import { RawIdMediaPickerAdapter } from "../src/media-picker";

describe("media-picker — Media Picker abstraction (Milestone 4)", () => {
  it("RawIdMediaPickerAdapter echoes the id back as a placeholder label", async () => {
    const adapter = new RawIdMediaPickerAdapter();
    const result = await adapter.describeSelection({ mediaAssetId: "asset-123" });
    expect(result.label).toBe("asset-123");
  });
});
