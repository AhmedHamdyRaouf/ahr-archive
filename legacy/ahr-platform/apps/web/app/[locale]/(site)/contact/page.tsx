import type { Metadata } from "next";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { buildPageMetadata } from "@/lib/page-seo";
import { SiteBreadcrumbs, SiteEmptyState } from "@/components/site";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/contact`, {
    ar: "تواصل",
    en: "Contact",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/**
 * Implements: Sitemap (Phase 3) — Contact; Website API §"Get Contact
 * Info" — read-only display data. No contact-form submission mechanism
 * exists (this gap was flagged in the API Specification and remains
 * unresolved — not invented here).
 */
export default async function ContactPage({ params }: { params: { locale: "ar" | "en" } }) {
  const settings = await getPublicSiteSettings();
  const entries = Object.entries(settings.contactInformation);

  return (
    <div className="mx-auto max-w-3xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[{ label: params.locale === "ar" ? "تواصل" : "Contact" }]}
      />
      <div className="p-4">
        {entries.length === 0 ? (
          <SiteEmptyState
            message={
              params.locale === "ar"
                ? "معلومات التواصل غير متاحة حاليًا."
                : "Contact information is not available yet."
            }
          />
        ) : (
          <ul className="space-y-2">
            {entries.map(([key, value]) => (
              <li key={key}>
                <span className="font-semibold">{key}: </span>
                {String(value)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
