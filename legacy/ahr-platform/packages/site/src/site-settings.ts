/**
 * Implements: Database Architecture (Frozen v1) §8 — "only the publicly-
 * readable platform_settings keys are ever exposed" (Website API §"Get
 * Contact Info," carried forward here). This module defines the shape and
 * safe-default parsing of exactly that subset — `aiConfiguration`/
 * `emailConfiguration` never appear anywhere in this file, by design.
 *
 * NOTE — `site_name`/`site_description` are seeded (Milestone 2) as a
 * single JSON string each, not a bilingual `{ar, en}` pair like every
 * other content field in this platform. This module surfaces the same
 * single value for both `siteNameAr`/`siteNameEn` rather than inventing a
 * bilingual structure the frozen schema doesn't actually have — a minor,
 * documented limitation of `platform_settings` itself, not something to
 * silently work around.
 */

export interface PublicSiteSettings {
  siteNameAr: string;
  siteNameEn: string;
  siteDescriptionAr: string;
  siteDescriptionEn: string;
  contactInformation: Record<string, unknown>;
  socialMediaLinks: Record<string, unknown>;
  seoDefaults: Record<string, unknown>;
  maintenanceMode: boolean;
}

/** The ONLY platform_settings keys this module will ever read — an explicit allowlist, not a denylist. */
export const PUBLIC_SETTINGS_KEYS = [
  "site_name",
  "site_description",
  "contact_information",
  "social_media_links",
  "seo_defaults",
  "maintenance_mode",
] as const;

/**
 * Parses raw `platform_settings` rows (key/value pairs, as migrated in
 * Milestone 2) into a typed, safely-defaulted shape. Missing or
 * malformed values fall back to empty/neutral defaults rather than
 * throwing — a missing setting should degrade the page gracefully, not
 * break it (public pages must never 500 because of an admin
 * configuration gap).
 */
export function parsePublicSiteSettings(
  rows: Array<{ key: string; value: unknown }>,
): PublicSiteSettings {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const siteName = byKey.get("site_name");
  const description = byKey.get("site_description");

  return {
    siteNameAr: typeof siteName === "string" ? siteName : "",
    siteNameEn: typeof siteName === "string" ? siteName : "",
    siteDescriptionAr: typeof description === "string" ? description : "",
    siteDescriptionEn: typeof description === "string" ? description : "",
    contactInformation: asRecord(byKey.get("contact_information")),
    socialMediaLinks: asRecord(byKey.get("social_media_links")),
    seoDefaults: asRecord(byKey.get("seo_defaults")),
    maintenanceMode: byKey.get("maintenance_mode") === true,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
