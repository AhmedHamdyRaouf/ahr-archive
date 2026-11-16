import { buildPageSeo, type Locale } from "@ahr/site";
import { getPublicSiteSettings } from "./public-site-settings";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * One shared function every public page's `generateMetadata` calls —
 * Coding Standards: "one place for a rule." Wraps `@ahr/site`'s
 * `buildPageSeo` with the actual settings read + this deployment's base URL.
 */
export async function buildPageMetadata(
  locale: Locale,
  path: string,
  pageTitle?: { ar: string; en: string },
  pageDescription?: { ar: string; en: string },
) {
  const settings = await getPublicSiteSettings();
  return buildPageSeo(
    {
      siteNameAr: settings.siteNameAr || "AHR Platform",
      siteNameEn: settings.siteNameEn || "AHR Platform",
      descriptionAr: settings.siteDescriptionAr,
      descriptionEn: settings.siteDescriptionEn,
    },
    { locale, path, pageTitle, pageDescription, baseUrl: BASE_URL },
  );
}
