import { describe, it, expect } from "vitest";
import { buildPageSeo, type SeoDefaults } from "../src/seo";

const defaults: SeoDefaults = {
  siteNameAr: "أحمد حمدي رؤوف",
  siteNameEn: "Ahmed Hamdy Raouf",
  descriptionAr: "الأرشيف الرسمي",
  descriptionEn: "The official archive",
};

describe("seo — page metadata building (Milestone 8)", () => {
  it("uses the site name alone when no page title is given (Home)", () => {
    const result = buildPageSeo(defaults, {
      locale: "en",
      path: "/en",
      baseUrl: "https://example.com",
    });
    expect(result.title).toBe("Ahmed Hamdy Raouf");
  });

  it("builds 'Page — Site Name' when a page title is given", () => {
    const result = buildPageSeo(defaults, {
      locale: "en",
      pageTitle: { ar: "الأعمال", en: "Works" },
      path: "/en/works",
      baseUrl: "https://example.com",
    });
    expect(result.title).toBe("Works — Ahmed Hamdy Raouf");
  });

  it("selects the Arabic title/description for locale=ar", () => {
    const result = buildPageSeo(defaults, {
      locale: "ar",
      pageTitle: { ar: "الأعمال", en: "Works" },
      path: "/ar/works",
      baseUrl: "https://example.com",
    });
    expect(result.title).toBe("الأعمال — أحمد حمدي رؤوف");
  });

  it("falls back to the site default description when no page description is given", () => {
    const result = buildPageSeo(defaults, {
      locale: "en",
      path: "/en",
      baseUrl: "https://example.com",
    });
    expect(result.description).toBe("The official archive");
  });

  it("builds alternateUrls for BOTH locales, not just the current one (hreflang)", () => {
    const result = buildPageSeo(defaults, {
      locale: "en",
      path: "/en/works/song-1",
      baseUrl: "https://example.com",
    });
    expect(result.alternateUrls.ar).toBe("https://example.com/ar/works/song-1");
    expect(result.alternateUrls.en).toBe("https://example.com/en/works/song-1");
  });

  it("maps locale to the correct Open Graph locale code", () => {
    expect(
      buildPageSeo(defaults, { locale: "ar", path: "/ar", baseUrl: "https://x.com" }).ogLocale,
    ).toBe("ar_AR");
    expect(
      buildPageSeo(defaults, { locale: "en", path: "/en", baseUrl: "https://x.com" }).ogLocale,
    ).toBe("en_US");
  });
});
