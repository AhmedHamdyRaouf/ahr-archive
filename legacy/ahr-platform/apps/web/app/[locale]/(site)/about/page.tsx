import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-seo";
import { getPublicAssetsByKeys } from "@/lib/asset-library";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { ABOUT_IMAGE_KEYS } from "@/components/about/about-content";
import { AboutExperience } from "@/components/about/about-experience";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/about`, {
    ar: "نبذة",
    en: "About",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/**
 * Implements: Sitemap (Phase 3) — About. Cinematic editorial rebuild (data
 * owner spec, 2026-07-23). Deliberately stays inside the shared `(site)`
 * route group — an earlier standalone-route attempt lost the shared
 * SiteHeader's real primary nav and SiteFooter's WhatsApp float button,
 * which the data owner confirmed this page must keep. AboutExperience
 * only adds the intro loader and persistent scroll timeline as extra,
 * page-scoped chrome on top of that shared layout. Supersedes the
 * previous CMS-driven `person.bio_ar/bio_en` render — every section here
 * is fixed narrative copy (about-content.ts); images fall back to elegant
 * placeholders until a real asset is published under the matching
 * `image_key` (Asset Library, wired up 2026-07-25 — see ABOUT_IMAGE_KEYS
 * in about-content.ts and lib/asset-library.ts).
 */
export default async function AboutPage({ params }: { params: { locale: "ar" | "en" } }) {
  const supabase = createRouteHandlerSupabaseClient();
  const assets = await getPublicAssetsByKeys(supabase, Object.values(ABOUT_IMAGE_KEYS));

  return <AboutExperience locale={params.locale} assets={assets} />;
}
