import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import {
  getCategoriesForEntity,
  getTagsForEntity,
  setCategoriesForEntity,
  setTagsForEntity,
} from "@ahr/relationships";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: API Specification 03 - CMS API — "Assign Taxonomy." Only
 * `works`/`projects` are valid `entityType` values here — every other
 * value returns 404, matching that document's own documented behavior.
 */

function isTaxonomyEntityType(value: string): value is "works" | "projects" {
  return value === "works" || value === "projects";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isTaxonomyEntityType(params.entityType)) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Taxonomy is not supported for this entity type." },
        },
        { status: 404 },
      );
    }

    await requireCapability(nextCookieAdapter(), "content:read");
    const supabase = createRouteHandlerSupabaseClient();

    const [categoryIds, tagIds] = await Promise.all([
      getCategoriesForEntity(supabase as never, params.entityType, params.id),
      getTagsForEntity(supabase as never, params.entityType, params.id),
    ]);

    return NextResponse.json({ data: { categoryIds, tagIds }, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isTaxonomyEntityType(params.entityType)) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "Taxonomy is not supported for this entity type." },
        },
        { status: 404 },
      );
    }

    await requireCapability(nextCookieAdapter(), "content:write");
    const body = await request.json();
    const { categories, tagIds } = body as {
      categories: Array<{ id: string; domain: string }>;
      tagIds: string[];
    };
    const supabase = createRouteHandlerSupabaseClient();

    await setCategoriesForEntity(supabase as never, params.entityType, params.id, categories ?? []);
    await setTagsForEntity(supabase as never, params.entityType, params.id, tagIds ?? []);

    return NextResponse.json({
      data: { categoryIds: (categories ?? []).map((c) => c.id), tagIds: tagIds ?? [] },
      error: null,
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
