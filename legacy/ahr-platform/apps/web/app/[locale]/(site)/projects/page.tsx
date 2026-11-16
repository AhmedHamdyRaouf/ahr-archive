import type { Metadata } from "next";
import { genericList } from "@ahr/cms-core";
import { projectDefinition } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import { EntityCard, SiteEmptyState, SiteBreadcrumbs } from "@/components/site";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/projects`, {
    ar: "المشاريع",
    en: "Projects",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/** Implements: Sitemap (Phase 3) — Projects (list). Published+public only, RLS-enforced. */
export default async function ProjectsListPage({
  params,
  searchParams,
}: {
  params: { locale: "ar" | "en" };
  searchParams: { page?: string };
}) {
  const supabase = createRouteHandlerSupabaseClient();
  const page = Number(searchParams.page ?? "1");

  const { data: projects, meta } = await genericList(
    projectDefinition,
    { supabase: supabase as never, actorId: "" },
    { pagination: { page, pageSize: 12 }, filters: { status: "published", visibility: "public" } },
  );

  return (
    <div className="mx-auto max-w-5xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[{ label: params.locale === "ar" ? "المشاريع" : "Projects" }]}
      />
      <div className="p-4">
        {projects.length === 0 ? (
          <SiteEmptyState
            message={
              params.locale === "ar" ? "لا توجد مشاريع منشورة بعد." : "No published projects yet."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((project) => (
              <EntityCard
                key={String(project.id)}
                href={`/${params.locale}/projects/${project.public_id}`}
                titleAr={String(project.title_ar ?? "")}
                titleEn={String(project.title_en ?? "")}
                locale={params.locale}
                verificationStatus={String(project.verification_status ?? "")}
              />
            ))}
          </div>
        )}
        <p className="mt-4 text-sm text-neutral">
          {params.locale === "ar" ? "صفحة" : "Page"} {meta.page} / {meta.totalPages}
        </p>
      </div>
    </div>
  );
}
