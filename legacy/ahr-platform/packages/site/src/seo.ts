/**
 * Implements: Milestone 8 §"SEO foundation." Pure functions — no Next.js
 * `Metadata` type dependency here, so this package stays framework-free;
 * `apps/web`'s `generateMetadata` functions call these and map the result
 * into Next.js's own `Metadata` shape.
 */

import type { Locale } from "./locale";

export interface SeoDefaults {
  siteNameAr: string;
  siteNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface PageSeoInput {
  locale: Locale;
  /** Page-specific title, e.g. a Work's title — omitted for pages that just use the site name (Home). */
  pageTitle?: { ar: string; en: string };
  /** Page-specific description — falls back to the site default when absent. */
  pageDescription?: { ar: string; en: string };
  path: string; // locale-prefixed, e.g. "/ar/works/some-slug"
  baseUrl: string; // e.g. "https://example.com" — configured per deployment, not hardcoded here
}

export interface BuiltSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  alternateUrls: Record<Locale, string>;
  ogLocale: string;
}

const OG_LOCALE: Record<Locale, string> = { ar: "ar_AR", en: "en_US" };

/**
 * Builds the title/description/canonical/alternate-locale metadata for a
 * single page. `alternateUrls` always includes BOTH locales (not just the
 * current one) — this is what lets a search engine understand the /ar and
 * /en versions are the same content in different languages (hreflang),
 * matching the bilingual-parity principle already established (Design
 * Principles §3, UI/UX Specification).
 */
export function buildPageSeo(defaults: SeoDefaults, input: PageSeoInput): BuiltSeo {
  const siteName = input.locale === "ar" ? defaults.siteNameAr : defaults.siteNameEn;
  const pageTitle = input.pageTitle
    ? input.locale === "ar"
      ? input.pageTitle.ar
      : input.pageTitle.en
    : null;
  const title = pageTitle ? `${pageTitle} — ${siteName}` : siteName;

  const description = input.pageDescription
    ? input.locale === "ar"
      ? input.pageDescription.ar
      : input.pageDescription.en
    : input.locale === "ar"
      ? defaults.descriptionAr
      : defaults.descriptionEn;

  const canonicalUrl = `${input.baseUrl}${input.path}`;

  // Build the alternate path by swapping the locale segment, for both locales.
  const segments = input.path.split("/");
  const pathWithoutLocale = segments.slice(2).join("/");
  const alternateUrls: Record<Locale, string> = {
    ar: `${input.baseUrl}/ar${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`,
    en: `${input.baseUrl}/en${pathWithoutLocale ? `/${pathWithoutLocale}` : ""}`,
  };

  return { title, description, canonicalUrl, alternateUrls, ogLocale: OG_LOCALE[input.locale] };
}
