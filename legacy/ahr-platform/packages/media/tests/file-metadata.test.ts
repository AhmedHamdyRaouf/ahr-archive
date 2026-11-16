import { describe, it, expect } from "vitest";
import { extractTransientMetadata } from "../src/file-metadata";

/** Builds a minimal, valid PNG header (signature + IHDR) for a given width/height — no real image data needed to test dimension parsing. */
function buildMinimalPng(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  bytes.set(signature, 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width, false);
  view.setUint32(20, height, false);
  return bytes;
}

describe("file-metadata — transient (non-persisted) metadata extraction (Milestone 6)", () => {
  it("computes file size and MIME type for any file", () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    const result = extractTransientMetadata(bytes, "audio/mpeg");
    expect(result.fileSizeBytes).toBe(5);
    expect(result.mimeType).toBe("audio/mpeg");
  });

  it("extracts width/height from a PNG header", () => {
    const png = buildMinimalPng(1920, 1080);
    const result = extractTransientMetadata(png, "image/png");
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });

  it("returns null dimensions for a non-PNG image (no parser implemented — documented, not guessed)", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff]); // JPEG magic bytes, not parsed
    const result = extractTransientMetadata(bytes, "image/jpeg");
    expect(result.width).toBeNull();
    expect(result.height).toBeNull();
  });

  it("returns null duration for audio/video — no duration parser implemented", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const result = extractTransientMetadata(bytes, "audio/mpeg");
    expect(result.durationSeconds).toBeNull();
  });

  it("never persists anything — the return type has no id/table reference of any kind", () => {
    const result = extractTransientMetadata(new Uint8Array([1]), "image/png");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("mediaAssetId");
  });
});
