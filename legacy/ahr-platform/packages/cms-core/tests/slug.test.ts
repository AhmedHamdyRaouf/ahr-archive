import { describe, it, expect } from "vitest";
import { slugify, generateSlugBase, generateUniqueSlug } from "../src/slug";

describe("slug — Slug Generation (Milestone 4)", () => {
  it("slugifies a simple English string", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("collapses repeated separators and trims leading/trailing dashes", () => {
    expect(slugify("  --Hello   World--  ")).toBe("hello-world");
  });

  it("preserves non-Latin letters (e.g. Arabic) rather than stripping them to nothing", () => {
    const result = slugify("مرحبا بالعالم");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/[^\p{L}\p{N}-]/u);
  });

  it("generateSlugBase falls back to a secondary source if the preferred one is empty", () => {
    expect(generateSlugBase("", "Fallback Title")).toBe("fallback-title");
  });

  it("generateSlugBase prefers the primary source when present", () => {
    expect(generateSlugBase("Primary Title", "Fallback Title")).toBe("primary-title");
  });

  it("generateUniqueSlug returns the base when it's not taken", async () => {
    const result = await generateUniqueSlug("hello-world", async () => false);
    expect(result).toBe("hello-world");
  });

  it("generateUniqueSlug appends -2, -3, ... until an untaken candidate is found", async () => {
    const taken = new Set(["hello-world", "hello-world-2", "hello-world-3"]);
    const result = await generateUniqueSlug("hello-world", async (candidate) =>
      taken.has(candidate),
    );
    expect(result).toBe("hello-world-4");
  });

  it("generateUniqueSlug throws for an empty base rather than looping forever", async () => {
    await expect(generateUniqueSlug("", async () => false)).rejects.toThrow(/non-empty/);
  });
});
