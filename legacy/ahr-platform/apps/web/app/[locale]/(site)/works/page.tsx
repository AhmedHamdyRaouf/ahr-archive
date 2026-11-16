import type { Metadata } from "next";
import Link from "next/link";
import { genericList } from "@ahr/cms-core";
import { workDefinition } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import { getThumbnailUrlsForOwners } from "@/lib/entity-thumbnails";
import { CuratedSelection } from "@/components/works/curated-selection";
import { WorksArchive } from "@/components/works/works-archive";
import type { WorkCardData } from "@/components/works/work-card";
import {
  WORKS_HERO_CONTENT,
  EDITORIAL_INTRO_CONTENT,
  FINAL_CTA_CONTENT,
} from "@/components/works/works-content";

const ARCHIVE_PAGE_SIZE = 12;
const CURATED_COUNT = 6;

const SORTS: Record<string, { field: string; direction: "asc" | "desc" }> = {
  year_desc: { field: "year", direction: "desc" },
  year_asc: { field: "year", direction: "asc" },
  title_asc: { field: "title_en", direction: "asc" },
};

const WORK_TYPES = [
  "song",
  "album",
  "theatre",
  "tv_series",
  "film",
  "soundtrack",
  "arrangement",
  "choir",
  "concert",
];

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/works`, {
    ar: "الأعمال",
    en: "Works",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

async function withThumbnails(
  supabase: ReturnType<typeof createRouteHandlerSupabaseClient>,
  rows: Array<Record<string, unknown>>,
): Promise<WorkCardData[]> {
  const ids = rows.map((row) => String(row.id));
  const thumbnails = await getThumbnailUrlsForOwners(supabase, "work", ids);
  return rows.map((row) => ({
    id: String(row.id),
    public_id: String(row.public_id),
    title_ar: (row.title_ar as string) ?? null,
    title_en: (row.title_en as string) ?? null,
    work_type: (row.work_type as string) ?? null,
    year: (row.year as number) ?? null,
    verification_status: (row.verification_status as string) ?? null,
    display_size: (row.display_size as string) ?? "medium",
    thumbnailUrl: thumbnails[String(row.id)] ?? null,
  }));
}

/**
 * Implements: Works Page editorial rebuild (data owner spec, 2026-07-24) —
 * supersedes the plain uniform-grid Works listing. Published+public only,
 * RLS-enforced (unchanged from the previous implementation). Reuses the
 * existing `work.is_featured` column for "Curated Selection" and the new
 * `work.display_size` column (migration 20260724140000, approved by data
 * owner) for masonry card sizing — both are the ONLY schema involvement,
 * everything else is presentation-layer only.
 */
export default async function WorksListPage({
  params,
  searchParams,
}: {
  params: { locale: "ar" | "en" };
  searchParams: { q?: string; type?: string; sort?: string; page?: string };
}) {
  const { locale } = params;
  const supabase = createRouteHandlerSupabaseClient();

  const q = searchParams.q?.trim() || undefined;
  const workType = searchParams.type && WORK_TYPES.includes(searchParams.type) ? searchParams.type : undefined;
  const sort = SORTS[searchParams.sort ?? "year_desc"] ?? SORTS.year_desc;
  const pagesLoaded = Math.max(1, Number(searchParams.page ?? "1") || 1);

  const [{ meta: totalMeta }, { data: curatedRows }, { data: archiveRows, meta: archiveMeta }] = await Promise.all([
    genericList(
      workDefinition,
      { supabase: supabase as never, actorId: "" },
      { pagination: { page: 1, pageSize: 1 }, filters: { status: "published", visibility: "public" } },
    ),
    genericList(
      workDefinition,
      { supabase: supabase as never, actorId: "" },
      {
        pagination: { page: 1, pageSize: CURATED_COUNT },
        filters: { status: "published", visibility: "public", is_featured: true },
        sort: { field: "year", direction: "desc" },
      },
    ),
    genericList(
      workDefinition,
      { supabase: supabase as never, actorId: "" },
      {
        pagination: { page: 1, pageSize: pagesLoaded * ARCHIVE_PAGE_SIZE },
        filters: { status: "published", visibility: "public", ...(workType ? { work_type: workType } : {}) },
        search: q,
        searchFields: ["title_ar", "title_en"],
        sort,
      },
    ),
  ]);

  const [curatedWorks, archiveWorks] = await Promise.all([
    withThumbnails(supabase, curatedRows as Array<Record<string, unknown>>),
    withThumbnails(supabase, archiveRows as Array<Record<string, unknown>>),
  ]);

  return (
    <div>
      <section className="works-hero">
        <div className="container">
          <p className="hero-sub">{WORKS_HERO_CONTENT.eyebrow[locale]}</p>
          <h1>{WORKS_HERO_CONTENT.title[locale]}</h1>
          <p>{WORKS_HERO_CONTENT.intro[locale]}</p>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat">
          <div className="stat-num">{totalMeta.totalItems}</div>
          <div className="stat-label">{WORKS_HERO_CONTENT.statLabel[locale]}</div>
        </div>
      </div>

      <section className="works-section">
        <div className="container">
          <div className="works-intro">
            <h2>{EDITORIAL_INTRO_CONTENT.heading[locale]}</h2>
            <p>{EDITORIAL_INTRO_CONTENT.body[locale]}</p>
          </div>
        </div>
      </section>

      <CuratedSelection works={curatedWorks} locale={locale} />

      <WorksArchive
        initialItems={archiveWorks}
        initialMeta={{ ...archiveMeta, page: pagesLoaded }}
        locale={locale}
      />

      <section className="works-section contact">
        <div className="container">
          <h2>{FINAL_CTA_CONTENT.heading[locale]}</h2>
          <p className="works-intro">{FINAL_CTA_CONTENT.body[locale]}</p>
          <div className="works-cta-buttons">
            <Link href={`/${locale}/projects`} className="btn gold">
              {FINAL_CTA_CONTENT.exploreProjects[locale]}
            </Link>
            <Link href={`/${locale}/about`} className="btn">
              {FINAL_CTA_CONTENT.meetAhmed[locale]}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
