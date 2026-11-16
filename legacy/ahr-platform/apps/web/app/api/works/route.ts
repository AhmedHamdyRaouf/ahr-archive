import { NextResponse, type NextRequest } from "next/server";
import { genericList } from "@ahr/cms-core";
import { workDefinition } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { getThumbnailUrlsForOwners } from "@/lib/entity-thumbnails";

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
] as const;

const SORTS: Record<string, { field: string; direction: "asc" | "desc" }> = {
  year_desc: { field: "year", direction: "desc" },
  year_asc: { field: "year", direction: "asc" },
  title_asc: { field: "title_en", direction: "asc" },
};

/**
 * Implements: Works Page editorial rebuild (data owner spec, 2026-07-24) —
 * public, unauthenticated pagination endpoint backing the archive grid's
 * infinite scroll. Deliberately separate from `/api/cms/[entityType]`
 * (Dashboard-only, gated behind `content:read`) — this route hardcodes
 * `status: published, visibility: public` server-side, exactly like the
 * public Work detail page's own direct `genericList`/`.from("work")` calls,
 * so a visitor can never see a draft/hidden Work regardless of query params.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(60, Math.max(1, Number(searchParams.get("pageSize") ?? "12") || 12));
  const q = searchParams.get("q")?.trim() || undefined;
  const typeParam = searchParams.get("type");
  const workType = typeParam && (WORK_TYPES as readonly string[]).includes(typeParam) ? typeParam : undefined;
  const sortParam = searchParams.get("sort") ?? "year_desc";
  const sort = SORTS[sortParam] ?? SORTS.year_desc;

  const supabase = createRouteHandlerSupabaseClient();

  const result = await genericList(
    workDefinition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page, pageSize },
      filters: { status: "published", visibility: "public", ...(workType ? { work_type: workType } : {}) },
      search: q,
      searchFields: ["title_ar", "title_en"],
      sort,
    },
  );

  const rows = result.data as Array<Record<string, unknown>>;
  const ids = rows.map((row) => String(row.id));
  const thumbnails = await getThumbnailUrlsForOwners(supabase, "work", ids);

  return NextResponse.json({
    data: rows.map((row) => ({ ...row, thumbnailUrl: thumbnails[String(row.id)] ?? null })),
    meta: result.meta,
  });
}
