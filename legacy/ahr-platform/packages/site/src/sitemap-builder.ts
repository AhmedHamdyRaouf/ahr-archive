/**
 * Implements: Milestone 8 §"SEO foundation" — sitemap.xml generation.
 * Static routes matched EXACTLY to Sitemap (Phase 3) — no invented pages.
 */

import { SUPPORTED_LOCALES, type Locale } from "./locale";

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Every static public route, per Sitemap (Phase 3): Home, About, Works,
 * Media, Recognition, Contact, plus Voice Training and Projects. The
 * Search results page (Milestone 9) is deliberately absent — a
 * query-driven results page is not a canonical, indexable destination in
 * its own right, matching how it was never listed as a page in the
 * frozen Sitemap either.
 *
 * Updated 2026-07-26: "Projects" was removed from the primary nav (see
 * navigation.ts) but its route is still live and public, so it stays
 * indexable here — this list tracks crawlable routes, not nav links.
 * "voice-training" added alongside it as the new primary nav page.
 */
export const STATIC_PUBLIC_ROUTES = [
  "",
  "about",
  "works",
  "voice-training",
  "projects",
  "media",
  "recognition",
  "contact",
] as const;

export function buildStaticSitemapEntries(baseUrl: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const route of STATIC_PUBLIC_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      entries.push({
        url: `${baseUrl}${path}`,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.7,
      });
    }
  }
  return entries;
}

export interface DynamicEntitySlug {
  slug: string;
  updatedAt: string;
}

/**
 * Builds sitemap entries for a published+public entity type's detail
 * pages (Works, Projects — the only two Sitemap detail-page types with a
 * slug, per Identifier Strategy/Database Architecture §5). Callers supply
 * already-filtered (published+public) slugs; this function does not
 * query the database itself, keeping it framework/dependency-free.
 */
export function buildDynamicSitemapEntries(
  baseUrl: string,
  routeSegment: "works" | "projects",
  slugs: DynamicEntitySlug[],
): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const { slug, updatedAt } of slugs) {
    for (const locale of SUPPORTED_LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/${routeSegment}/${slug}`,
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}

export function getStaticRoutePath(
  locale: Locale,
  route: (typeof STATIC_PUBLIC_ROUTES)[number],
): string {
  return route ? `/${locale}/${route}` : `/${locale}`;
}
