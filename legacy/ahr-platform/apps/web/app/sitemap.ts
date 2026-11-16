import type { MetadataRoute } from "next";
import { buildStaticSitemapEntries, buildDynamicSitemapEntries } from "@ahr/site";
import { genericList } from "@ahr/cms-core";
import { workDefinition, projectDefinition } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Implements: Milestone 8 §"SEO foundation" — sitemap.xml. Next.js's
 * `app/sitemap.ts` convention file (must live outside `[locale]`, per
 * Next.js's own routing rules for this special file).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createRouteHandlerSupabaseClient();

  const [{ data: works }, { data: projects }] = await Promise.all([
    genericList(
      workDefinition,
      { supabase: supabase as never, actorId: "" },
      {
        pagination: { page: 1, pageSize: 100 },
        filters: { status: "published", visibility: "public" },
      },
    ),
    genericList(
      projectDefinition,
      { supabase: supabase as never, actorId: "" },
      {
        pagination: { page: 1, pageSize: 100 },
        filters: { status: "published", visibility: "public" },
      },
    ),
  ]);

  const entries = [
    ...buildStaticSitemapEntries(BASE_URL),
    ...buildDynamicSitemapEntries(
      BASE_URL,
      "works",
      works.map((w) => ({ slug: String(w.public_id), updatedAt: String(w.updated_at) })),
    ),
    ...buildDynamicSitemapEntries(
      BASE_URL,
      "projects",
      projects.map((p) => ({ slug: String(p.public_id), updatedAt: String(p.updated_at) })),
    ),
  ];

  return entries;
}
