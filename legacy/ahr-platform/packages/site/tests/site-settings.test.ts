import { describe, it, expect } from "vitest";
import { parsePublicSiteSettings, PUBLIC_SETTINGS_KEYS } from "../src/site-settings";

describe("site-settings — public-readable platform_settings subset (Milestone 8)", () => {
  it("never includes ai_configuration or email_configuration in its allowlist", () => {
    expect(PUBLIC_SETTINGS_KEYS).not.toContain("ai_configuration");
    expect(PUBLIC_SETTINGS_KEYS).not.toContain("email_configuration");
  });

  it("parses a fully-populated settings set", () => {
    const result = parsePublicSiteSettings([
      { key: "site_name", value: "Ahmed Hamdy Raouf" },
      { key: "site_description", value: "The official archive" },
      { key: "contact_information", value: { email: "hello@example.com" } },
      { key: "social_media_links", value: { instagram: "https://instagram.com/x" } },
      { key: "seo_defaults", value: { keywords: "music, composer" } },
      { key: "maintenance_mode", value: false },
    ]);

    expect(result.siteNameEn).toBe("Ahmed Hamdy Raouf");
    expect(result.contactInformation).toEqual({ email: "hello@example.com" });
    expect(result.maintenanceMode).toBe(false);
  });

  it("degrades gracefully to safe defaults when settings are entirely missing", () => {
    const result = parsePublicSiteSettings([]);
    expect(result.siteNameEn).toBe("");
    expect(result.contactInformation).toEqual({});
    expect(result.maintenanceMode).toBe(false);
  });

  it("degrades gracefully when a value is malformed (e.g. contact_information is a string, not an object)", () => {
    const result = parsePublicSiteSettings([
      { key: "contact_information", value: "not an object" },
    ]);
    expect(result.contactInformation).toEqual({});
  });

  it("uses the same site_name value for both siteNameAr and siteNameEn (schema has no bilingual pair here)", () => {
    const result = parsePublicSiteSettings([{ key: "site_name", value: "Single Value" }]);
    expect(result.siteNameAr).toBe("Single Value");
    expect(result.siteNameEn).toBe("Single Value");
  });
});
