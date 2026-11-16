import "../../site-legacy.css";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { SiteHeader, SiteFooter, SiteEffects, SkipLink, PageTransition, GalleryCursor } from "@/components/site";
import type { Locale } from "@ahr/site";

/**
 * Implements: Milestone 8 — Application shell / Global layout for the
 * public Website. Corrects a Milestone 3 deviation: the Development
 * Specification's own folder structure (doc 03) calls for a `(site)`
 * route group; Home was placed directly under `app/[locale]/page.tsx`
 * instead. Moved here — URLs are unaffected by route groups.
 *
 * Updated 2026-07-21: wrapped in `.site-theme` (globals.css) to apply the
 * ratified brand identity (gold-on-dark, Playfair Display headings) to
 * every public page — previously this layout rendered with the generic
 * placeholder tokens (`#111827` etc.) that were still in `:root` despite
 * Brand Identity/Color System/Typography all having been ratified
 * earlier (Decision Log item B10/C1) — the decision was recorded but
 * never actually wired into the stylesheet. The Dashboard is deliberately
 * NOT wrapped in this class — see globals.css's own note on why.
 *
 * Also updated 2026-07-21: imports `site-legacy.css` — a scoped copy of
 * the live site's own CSS (see that file's header comment) — and renders
 * `SiteEffects` for the loader/scroll-progress/back-to-top behaviors the
 * live site has, matching it structurally, not just in color/type.
 *
 * Updated 2026-07-24 (Global Experience & Intro Screen, Final Direction):
 * added `PageTransition` (simple fade + scroll-to-top on navigation) and
 * `GalleryCursor` (the circular "View" cursor over gallery/artwork
 * images) — both site-wide, both additive to this same shared shell.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const settings = await getPublicSiteSettings();
  const siteName = params.locale === "ar" ? settings.siteNameAr : settings.siteNameEn;
  const tagline =
    params.locale === "ar"
      ? "مؤلف موسيقي • منتج • مدرب أصوات"
      : "Composer • Music Producer • Vocal Coach";

  return (
    <div className="site-theme" dir={params.locale === "ar" ? "rtl" : "ltr"}>
      <SiteEffects siteName={siteName || "Ahmed Hamdy Raouf"} tagline={tagline} locale={params.locale} />
      <GalleryCursor label={params.locale === "ar" ? "عرض" : "View"} />
      <SkipLink label={params.locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"} />
      <SiteHeader locale={params.locale} siteName={siteName || "AHR Platform"} />
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter locale={params.locale} settings={settings} />
    </div>
  );
}
