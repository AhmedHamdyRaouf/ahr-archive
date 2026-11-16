import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { cmsSearch, SEARCHABLE_ENTITY_TYPES, type SearchableEntityType } from "@ahr/search";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { parseSearchParams } from "@/lib/search-params";
import { errorToResponse } from "@/lib/api-error";

// This route reads request-time data (query params/cookies) on every call,
// so it is inherently dynamic. Declared explicitly to avoid Next.js's
// static-optimization probing (and its noisy build-time error log) for a
// route that was never a static-generation candidate. Fixed per Milestone 1
// Bootstrap Verification (Phase 2 CTO Audit) -- no behavior change.
export const dynamic = "force-dynamic";

function isSearchableEntityType(value: string | null): value is SearchableEntityType {
  return (SEARCHABLE_ENTITY_TYPES as readonly string[]).includes(value ?? "");
}

/**
 * Implements: API Specification 10 - Search API, "CMS Search (Admin)."
 * Unfiltered by status. Scoped to the 5 entity types Database Architecture
 * §16 ever named for search (`entityType` required) — Award/Category/Tag/
 * Press Mention/Contribution are not covered by this unified engine; they
 * already have their own admin list search via `@ahr/cms-core`'s `q`
 * filter (CMS API "List Entities," Milestone 5), which remains the correct
 * tool for those five.
 */
export async function GET(request: NextRequest) {
  try {
    await requireCapability(nextCookieAdapter(), "content:read");

    const locale = request.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
    const entityTypeParam = request.nextUrl.searchParams.get("entityType");

    if (!isSearchableEntityType(entityTypeParam)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: `entityType must be one of: ${SEARCHABLE_ENTITY_TYPES.join(", ")}.`,
          },
        },
        { status: 422 },
      );
    }

    const params = parseSearchParams(request, locale);
    const statusParam = request.nextUrl.searchParams.get("status");

    const supabase = createRouteHandlerSupabaseClient();
    const result = await cmsSearch(supabase as never, entityTypeParam, {
      ...params,
      filters: { ...params.filters, status: statusParam ?? undefined },
    });

    return NextResponse.json({ data: result.data, error: null, meta: result.meta });
  } catch (error) {
    return errorToResponse(error);
  }
}
