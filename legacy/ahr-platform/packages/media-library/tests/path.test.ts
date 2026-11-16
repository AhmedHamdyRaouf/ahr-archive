import { describe, it, expect } from "vitest";
import { buildLibraryStoragePath } from "../src/path";

describe("path — Storage path construction for unowned assets", () => {
  it("builds a library/{assetId}.{ext} path, never owner-scoped", () => {
    const path = buildLibraryStoragePath("asset-123", "hero.png");
    expect(path).toBe("library/asset-123.png");
  });

  it("is keyed only by asset id, never by image_key or a slug", () => {
    const path = buildLibraryStoragePath("asset-1", "home-hero.jpg");
    expect(path).not.toMatch(/slug/);
    expect(path).not.toContain("home-hero");
  });

  it("lowercases the extension", () => {
    const path = buildLibraryStoragePath("asset-1", "photo.JPG");
    expect(path).toBe("library/asset-1.jpg");
  });
});
