import { describe, it, expect } from "vitest";
import { extractFileExtension, buildStoragePath } from "../src/path";

describe("path — Storage path construction (Milestone 6, Database Architecture §11)", () => {
  it("extractFileExtension returns the lowercase extension", () => {
    expect(extractFileExtension("photo.JPG")).toBe("jpg");
    expect(extractFileExtension("song.mp3")).toBe("mp3");
  });

  it("extractFileExtension falls back to 'bin' when there is no extension", () => {
    expect(extractFileExtension("noextension")).toBe("bin");
    expect(extractFileExtension("trailing.")).toBe("bin");
  });

  it("buildStoragePath matches Database Architecture §11 exactly: {ownerType}/{ownerId}/{assetId}.{ext}", () => {
    const path = buildStoragePath("work", "work-123", "asset-456", "cover.png");
    expect(path).toBe("work/work-123/asset-456.png");
  });

  it("buildStoragePath is keyed by owner/asset id, never by a slug", () => {
    // No slug parameter exists in the function signature at all — this
    // test documents that guarantee rather than just asserting output.
    const path = buildStoragePath("person", "person-1", "asset-1", "bio.jpg");
    expect(path).not.toMatch(/slug/);
  });
});
