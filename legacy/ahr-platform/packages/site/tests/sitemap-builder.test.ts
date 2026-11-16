import { describe, it, expect } from "vitest";
import {
  buildStaticSitemapEntries,
  buildDynamicSitemapEntries,
  getStaticRoutePath,
  STATIC_PUBLIC_ROUTES,
} from "../src/sitemap-builder";

describe("sitemap-builder — SEO foundation sitemap generation (Milestone 8)", () => {
  it("STATIC_PUBLIC_ROUTES matches the current Sitemap — no invented pages, no Search", () => {
    expect(STATIC_PUBLIC_ROUTES).toEqual([
      "",
      "about",
      "works",
      "voice-training",
      "projects",
      "media",
      "recognition",
      "contact",
    ]);
  });

  it("buildStaticSitemapEntries produces one entry per route per locale", () => {
    const entries = buildStaticSitemapEntries("https://example.com");
    expect(entries).toHaveLength(STATIC_PUBLIC_ROUTES.length * 2);
    expect(entries.map((e) => e.url)).toContain("https://example.com/ar");
    expect(entries.map((e) => e.url)).toContain("https://example.com/en/works");
  });

  it("Home gets the highest priority and most frequent change frequency", () => {
    const entries = buildStaticSitemapEntries("https://example.com");
    const home = entries.find((e) => e.url === "https://example.com/en");
    expect(home?.priority).toBe(1.0);
    expect(home?.changeFrequency).toBe("daily");
  });

  it("buildDynamicSitemapEntries produces one entry per slug per locale, for works/projects only", () => {
    const entries = buildDynamicSitemapEntries("https://example.com", "works", [
      { slug: "song-1", updatedAt: "2026-01-01T00:00:00Z" },
    ]);
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.url).sort()).toEqual([
      "https://example.com/ar/works/song-1",
      "https://example.com/en/works/song-1",
    ]);
  });

  it("getStaticRoutePath builds the Home path correctly (empty route segment)", () => {
    expect(getStaticRoutePath("ar", "")).toBe("/ar");
    expect(getStaticRoutePath("en", "about")).toBe("/en/about");
  });
});
