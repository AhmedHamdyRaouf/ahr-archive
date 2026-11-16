import type { Metadata } from "next";
import { globalSearch } from "@ahr/search";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import {
  SiteBreadcrumbs,
  EntityCard,
  SiteEmptyState,
  VerificationBadge,
  SearchBar,
} from "@/components/site";

/**
 * Only Works and Projects have a real detail page today (Milestone 8's
 * scope). Person/Event/Organization results are shown, but not linked to
 * a page that doesn't exist yet — Milestone 8 built no Person/Event/
 * Organization detail routes. This is a documented gap for a future
 * content-page milestone, not something to paper over with a broken link.
 */
const LINKABLE_ENTITY_TYPES: Record<string, string> = {
  works: "works",
  projects: "projects",
};

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/search`, {
    ar: "نتائج البحث",
    en: "Search Results",
  });
  return { title: seo.title, description: seo.description };
}

/**
 * Implements: Sitemap (Phase 3) — Search; API Specification 10 - Search
 * API "Global Search." Ranking is a deterministic heuristic, not
 * PostgreSQL full-text search — see `@ahr/search`'s
 * `docs/blocked-fts.md`. Not included in `sitemap.xml` (a search results
 * page is not a canonical, indexable destination).
 */
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: "ar" | "en" };
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q ?? "";
  const page = Number(searchParams.page ?? "1");
  const supabase = createRouteHandlerSupabaseClient();

  const result =
    query.trim().length > 0
      ? await globalSearch(supabase as never, {
          query,
          locale: params.locale,
          pagination: { page, pageSize: 20 },
        })
      : null;

  return (
    <div className="mx-auto max-w-5xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[{ label: params.locale === "ar" ? "نتائج البحث" : "Search Results" }]}
      />
      <div className="p-4">
        <div className="mb-6">
          <SearchBar locale={params.locale} defaultValue={query} />
        </div>

        {!result ? (
          <SiteEmptyState
            message={params.locale === "ar" ? "اكتب كلمة للبحث." : "Enter a search term."}
          />
        ) : result.data.length === 0 ? (
          <SiteEmptyState
            message={
              params.locale === "ar"
                ? "لا توجد نتائج. جرّب تصفح التصنيفات بدلاً من ذلك."
                : "No results. Try browsing by category instead."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {result.data.map((item) => {
              const linkableSegment = LINKABLE_ENTITY_TYPES[item.entityType];
              if (linkableSegment) {
                return (
                  <EntityCard
                    key={`${item.entityType}-${item.id}`}
                    href={`/${params.locale}/${linkableSegment}/${item.slug}`}
                    titleAr={item.titleAr}
                    titleEn={item.titleEn}
                    locale={params.locale}
                    verificationStatus={item.verificationStatus}
                  />
                );
              }
              return (
                <div key={`${item.entityType}-${item.id}`} className="rounded-md border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">
                      {params.locale === "ar" ? item.titleAr : item.titleEn}
                    </h3>
                    <VerificationBadge verificationStatus={item.verificationStatus} />
                  </div>
                  <p className="mt-1 text-xs text-neutral">{item.entityType}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
