import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import { SiteBreadcrumbs, VerificationBadge, EntityCard } from "@/components/site";

async function getWork(slug: string) {
  const supabase = createRouteHandlerSupabaseClient();
  const { data } = await supabase.from("work").select("*").eq("public_id", slug).maybeSingle();
  return data;
}

/**
 * Implements: Phase 2 AI backlog item 5 ("similar content" generator,
 * reusing item 4's embeddings). Deliberately read-only — this never calls
 * OpenAI itself (14-AI-Integration.md §7 — every AI call is triggered by
 * an explicit Administrator action, never a public visitor loading a
 * page). It only reads whatever `search_embedding` an Administrator has
 * already generated via the Dashboard's "Check for similar Works" button
 * (Phase 2 item 4); a Work with no embedding yet simply shows no section
 * here. `match_similar_works` runs SECURITY INVOKER (the migration's
 * default — no explicit SECURITY DEFINER), so calling it with this
 * anon/session-scoped client applies the exact same RLS `work` policy the
 * rest of this public page relies on: an anonymous visitor only ever sees
 * published+public matches, never a draft/hidden Work.
 */
async function getSimilarWorks(workId: string, embedding: unknown) {
  if (typeof embedding !== "string" || embedding.length === 0) return [];
  const supabase = createRouteHandlerSupabaseClient();
  const { data } = await supabase.rpc("match_similar_works", {
    query_embedding: embedding,
    exclude_work_id: workId,
    match_count: 4,
  });
  return (data ?? []) as Array<{ id: string; public_id: string; title_ar: string; title_en: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en"; slug: string };
}): Promise<Metadata> {
  const work = await getWork(params.slug);
  if (!work) return {};

  const seo = await buildPageMetadata(
    params.locale,
    `/${params.locale}/works/${params.slug}`,
    { ar: work.title_ar, en: work.title_en },
    work.description_ar && work.description_en
      ? { ar: work.description_ar, en: work.description_en }
      : undefined,
  );
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/**
 * Implements: Sitemap (Phase 3) — Work Detail. Public+published only —
 * `maybeSingle()` returns null for a non-existent OR non-public/non-
 * published slug alike (RLS-enforced), which routes to notFound() either
 * way, matching the frozen "never confirm existence of non-public
 * content" rule (Website API §"Get Work Detail").
 */
export default async function WorkDetailPage({
  params,
}: {
  params: { locale: "ar" | "en"; slug: string };
}) {
  const work = await getWork(params.slug);
  if (!work) notFound();

  const title = params.locale === "ar" ? work.title_ar : work.title_en;
  const description = params.locale === "ar" ? work.description_ar : work.description_en;
  const similarWorks = await getSimilarWorks(work.id, work.search_embedding);

  return (
    <div className="mx-auto max-w-3xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[
          { label: params.locale === "ar" ? "الأعمال" : "Works", href: `/${params.locale}/works` },
          { label: title },
        ]}
      />
      <article className="p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <VerificationBadge verificationStatus={work.verification_status} />
        </div>
        {description ? <p className="mt-4 text-neutral">{description}</p> : null}
      </article>

      {similarWorks.length > 0 ? (
        <div className="p-4">
          <h2 className="mb-2 text-lg font-semibold">
            {params.locale === "ar" ? "أعمال مشابهة" : "Similar Works"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {similarWorks.map((match) => (
              <EntityCard
                key={match.id}
                href={`/${params.locale}/works/${match.public_id}`}
                titleAr={match.title_ar}
                titleEn={match.title_en}
                locale={params.locale}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
