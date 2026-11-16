import { describe, it, expect } from "vitest";
import { PRIMARY_NAV_ITEMS, getNavLabel, getNavHref } from "../src/navigation";

describe("navigation — public primary navigation (Milestone 8)", () => {
  it("matches the current Sitemap exactly, in order, with no invented pages", () => {
    expect(PRIMARY_NAV_ITEMS.map((i) => i.route)).toEqual([
      "",
      "about",
      "works",
      "voice-training",
      "media",
      "recognition",
      "contact",
    ]);
  });

  it("does not include a Projects nav item — the route/entity still exists, it is just unlinked", () => {
    expect(PRIMARY_NAV_ITEMS.some((i) => i.route === "projects")).toBe(false);
  });

  it("does not include a Search nav item — Search is a SearchBar in SiteHeader, not a Sitemap page", () => {
    expect(PRIMARY_NAV_ITEMS.some((i) => i.route === "search")).toBe(false);
  });

  it("getNavLabel returns the correct language label", () => {
    const works = PRIMARY_NAV_ITEMS.find((i) => i.route === "works")!;
    expect(getNavLabel(works, "en")).toBe("Works");
    expect(getNavLabel(works, "ar")).toBe("الأعمال");
  });

  it("getNavHref builds the Home href correctly (empty route)", () => {
    const home = PRIMARY_NAV_ITEMS.find((i) => i.route === "")!;
    expect(getNavHref(home, "ar")).toBe("/ar");
  });

  it("getNavHref builds a non-Home href correctly", () => {
    const about = PRIMARY_NAV_ITEMS.find((i) => i.route === "about")!;
    expect(getNavHref(about, "en")).toBe("/en/about");
  });
});
