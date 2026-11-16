import type { Metadata } from "next";
import { genericList } from "@ahr/cms-core";
import { awardDefinition } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import { SiteBreadcrumbs, SiteEmptyState } from "@/components/site";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/recognition`, {
    ar: "التكريمات",
    en: "Recognition",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/** Implements: Sitemap (Phase 3) — Recognition. Published+public Awards only, RLS-enforced. */
export default async function RecognitionPage({ params }: { params: { locale: "ar" | "en" } }) {
  const supabase = createRouteHandlerSupabaseClient();

  const { data: awards } = await genericList(
    awardDefinition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page: 1, pageSize: 50 },
      filters: { status: "published", visibility: "public" },
    },
  );

  return (
    <div className="mx-auto max-w-3xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[{ label: params.locale === "ar" ? "التكريمات" : "Recognition" }]}
      />
      <div className="p-4">
        {awards.length === 0 ? (
          <SiteEmptyState
            message={
              params.locale === "ar" ? "لا توجد تكريمات منشورة بعد." : "No published awards yet."
            }
          />
        ) : (
          <ul className="space-y-3">
            {awards.map((award) => (
              <li key={String(award.id)} className="border-b pb-3">
                <p className="font-semibold">
                  {String(params.locale === "ar" ? award.title_ar : award.title_en)}
                </p>
                {award.year ? <p className="text-sm text-neutral">{String(award.year)}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
