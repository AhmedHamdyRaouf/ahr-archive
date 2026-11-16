import { describe, it, expect } from "vitest";
import {
  isLocale,
  getDirection,
  getOppositeLocale,
  replacePathLocale,
  buildLocalizedPath,
  DEFAULT_LOCALE,
} from "../src/locale";

describe("locale — bilingual routing utilities (Milestone 8)", () => {
  it("DEFAULT_LOCALE matches platform_settings.default_language seed ('ar')", () => {
    expect(DEFAULT_LOCALE).toBe("ar");
  });

  it("isLocale accepts only ar/en", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("getDirection returns rtl for ar and ltr for en", () => {
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
  });

  it("getOppositeLocale toggles correctly", () => {
    expect(getOppositeLocale("ar")).toBe("en");
    expect(getOppositeLocale("en")).toBe("ar");
  });

  it("replacePathLocale swaps only the locale segment, preserving the rest of the path", () => {
    expect(replacePathLocale("/ar/works/some-slug", "en")).toBe("/en/works/some-slug");
  });

  it("replacePathLocale handles the bare root path", () => {
    expect(replacePathLocale("/ar", "en")).toBe("/en");
  });

  it("buildLocalizedPath prefixes a path with the locale", () => {
    expect(buildLocalizedPath("en", "/works/some-slug")).toBe("/en/works/some-slug");
    expect(buildLocalizedPath("ar", "/")).toBe("/ar");
  });
});
