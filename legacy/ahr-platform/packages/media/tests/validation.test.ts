import { describe, it, expect } from "vitest";
import {
  deriveMediaType,
  assertFileSizeWithinLimit,
  assertExactlyOneOwner,
  ownerTypeToColumn,
  MediaValidationError,
} from "../src/validation";

describe("validation — media type derivation, size limits, owner constraint (Milestone 6)", () => {
  it("derives 'image' from image/* MIME types", () => {
    expect(deriveMediaType("image/png")).toBe("image");
    expect(deriveMediaType("image/jpeg")).toBe("image");
  });

  it("derives 'audio' and 'video' correctly", () => {
    expect(deriveMediaType("audio/mpeg")).toBe("audio");
    expect(deriveMediaType("video/mp4")).toBe("video");
  });

  it("rejects application/pdf (Documents) — the frozen check constraint has no 'document' value", () => {
    expect(() => deriveMediaType("application/pdf")).toThrow(MediaValidationError);
    try {
      deriveMediaType("application/pdf");
    } catch (err) {
      expect((err as MediaValidationError).code).toBe("UNSUPPORTED_MEDIA_TYPE");
      expect((err as MediaValidationError).message).toMatch(/blocked-metadata/);
    }
  });

  it("rejects any other unrecognized MIME category", () => {
    expect(() => deriveMediaType("text/plain")).toThrow(MediaValidationError);
  });

  it("assertFileSizeWithinLimit passes for a normal file", () => {
    expect(() => assertFileSizeWithinLimit(1024)).not.toThrow();
  });

  it("assertFileSizeWithinLimit rejects a file over the limit", () => {
    expect(() => assertFileSizeWithinLimit(200 * 1024 * 1024, 100 * 1024 * 1024)).toThrow(
      /exceeds/,
    );
  });

  it("assertFileSizeWithinLimit rejects an empty file", () => {
    expect(() => assertFileSizeWithinLimit(0)).toThrow(/empty/i);
  });

  it("assertExactlyOneOwner passes with exactly one owner set", () => {
    expect(() => assertExactlyOneOwner({ work_id: "w1" })).not.toThrow();
  });

  it("assertExactlyOneOwner throws with zero owners", () => {
    expect(() => assertExactlyOneOwner({})).toThrow(/exactly one owner/);
  });

  it("assertExactlyOneOwner throws with two owners", () => {
    expect(() => assertExactlyOneOwner({ work_id: "w1", person_id: "p1" })).toThrow(
      /exactly one owner/,
    );
  });

  it("ownerTypeToColumn maps every owner type to its real column name", () => {
    expect(ownerTypeToColumn("person")).toBe("person_id");
    expect(ownerTypeToColumn("work")).toBe("work_id");
    expect(ownerTypeToColumn("project")).toBe("project_id");
    expect(ownerTypeToColumn("event")).toBe("event_id");
  });
});
