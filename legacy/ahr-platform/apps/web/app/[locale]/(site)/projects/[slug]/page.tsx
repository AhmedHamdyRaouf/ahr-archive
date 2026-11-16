import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import { SiteBreadcrumbs, VerificationBadge } from "@/components/site";

async function getProject(slug: string) {
  const supabase = createRouteHandlerSupabaseClient();
  const { data } = await supabase.from("project").select("*").eq("public_id", slug).maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en"; slug: string };
}): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};

  const seo = await buildPageMetadata(params.locale, `/${params.locale}/projects/${params.slug}`, {
    ar: project.title_ar,
    en: project.title_en,
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/** Implements: Sitemap (Phase 3) — Project Detail. Public+published only, RLS-enforced. */
export default async function ProjectDetailPage({
  params,
}: {
  params: { locale: "ar" | "en"; slug: string };
}) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  const title = params.locale === "ar" ? project.title_ar : project.title_en;
  const description = params.locale === "ar" ? project.description_ar : project.description_en;

  return (
    <div className="mx-auto max-w-3xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[
          {
            label: params.locale === "ar" ? "المشاريع" : "Projects",
            href: `/${params.locale}/projects`,
          },
          { label: title },
        ]}
      />
      <article className="p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <VerificationBadge verificationStatus={project.verification_status} />
        </div>
        {description ? <p className="mt-4 text-neutral">{description}</p> : null}
      </article>
    </div>
  );
}
