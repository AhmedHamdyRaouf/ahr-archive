import { describe, it, expect } from "vitest";
import {
  assertImageMimeType,
  assertFileSizeWithinLimit,
  assertValidImageKey,
  MediaLibraryValidationError,
} from "../src/validation";

describe("validation — image-only MIME check, size limit, image_key format", () => {
  it("accepts any image/* MIME type", () => {
    expect(() => assertImageMimeType("image/png")).not.toThrow();
    expect(() => assertImageMimeType("image/webp")).not.toThrow();
  });

  it("rejects non-image MIME types (Asset Library V1 is images-only)", () => {
    expect(() => assertImageMimeType("video/mp4")).toThrow(MediaLibraryValidationError);
    expect(() => assertImageMimeType("application/pdf")).toThrow(/only accepts images/);
  });

  it("assertFileSizeWithinLimit passes for a normal file", () => {
    expect(() => assertFileSizeWithinLimit(1024)).not.toThrow();
  });

  it("assertFileSizeWithinLimit rejects a file over the limit", () => {
    expect(() => assertFileSizeWithinLimit(30 * 1024 * 1024)).toThrow(/exceeds/);
  });

  it("assertFileSizeWithinLimit rejects an empty file", () => {
    expect(() => assertFileSizeWithinLimit(0)).toThrow(/empty/i);
  });

  it("assertValidImageKey accepts lowercase, hyphenated, underscored keys", () => {
    expect(() => assertValidImageKey("home-hero-banner")).not.toThrow();
    expect(() => assertValidImageKey("about_intro_photo")).not.toThrow();
    expect(() => assertValidImageKey("logo2026")).not.toThrow();
  });

  it("assertValidImageKey rejects spaces, uppercase, and empty strings", () => {
    expect(() => assertValidImageKey("Home Hero")).toThrow(MediaLibraryValidationError);
    expect(() => assertValidImageKey("HERO")).toThrow(MediaLibraryValidationError);
    expect(() => assertValidImageKey("")).toThrow(MediaLibraryValidationError);
    expect(() => assertValidImageKey("-leading-hyphen")).toThrow(MediaLibraryValidationError);
  });
});
