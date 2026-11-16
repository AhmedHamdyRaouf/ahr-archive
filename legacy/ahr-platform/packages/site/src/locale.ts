/**
 * Implements: bilingual routing decision (/ar, /en via App Router —
 * Database Architecture header, "Bilingual Strategy"; introduced in
 * Milestone 3, formalized here as shared, tested logic rather than
 * inline constants scattered across page files).
 */

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar"; // matches platform_settings.default_language seed value (Milestone 2)

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/**
 * Rewrites a path's leading locale segment to a different locale, e.g.
 * `/ar/works/some-slug` + "en" -> `/en/works/some-slug`. Used by the
 * public LocaleSwitcher so switching language preserves the current page
 * rather than always bouncing to Home.
 */
export function replacePathLocale(path: string, newLocale: Locale): string {
  const segments = path.split("/");
  if (segments.length > 1 && isLocale(segments[1] ?? "")) {
    segments[1] = newLocale;
    return segments.join("/");
  }
  // No locale segment found (e.g. bare "/") — prefix instead of guessing further.
  return `/${newLocale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildLocalizedPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}
