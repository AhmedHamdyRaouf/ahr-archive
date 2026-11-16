/**
 * @ahr/site — public exports only (Coding Standards: "no deep imports
 * from outside a package's public exports").
 */

export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  getDirection,
  getOppositeLocale,
  replacePathLocale,
  buildLocalizedPath,
} from "./locale";
export type { Locale } from "./locale";

export { buildPageSeo } from "./seo";
export type { SeoDefaults, PageSeoInput, BuiltSeo } from "./seo";

export {
  STATIC_PUBLIC_ROUTES,
  buildStaticSitemapEntries,
  buildDynamicSitemapEntries,
  getStaticRoutePath,
} from "./sitemap-builder";
export type { SitemapEntry, DynamicEntitySlug } from "./sitemap-builder";

export { PUBLIC_SETTINGS_KEYS, parsePublicSiteSettings } from "./site-settings";
export type { PublicSiteSettings } from "./site-settings";

export {
  COLOR_TOKENS,
  SPACING_TOKENS,
  RADIUS_TOKENS,
  buildThemeCssVariables,
} from "./theme-tokens";
export type { ColorToken, SpacingToken, RadiusToken } from "./theme-tokens";

export { PRIMARY_NAV_ITEMS, getNavLabel, getNavHref } from "./navigation";
export type { NavItem } from "./navigation";
