import { NextResponse, type NextRequest } from "next/server";
import { organizationSearch } from "@ahr/search";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { parseSearchParams } from "@/lib/search-params";
import { errorToResponse } from "@/lib/api-error";

// This route reads request-time data (query params/cookies) on every call,
// so it is inherently dynamic. Declared explicitly to avoid Next.js's
// static-optimization probing (and its noisy build-time error log) for a
// route that was never a static-generation candidate. Fixed per Milestone 1
// Bootstrap Verification (Phase 2 CTO Audit) -- no behavior change.
export const dynamic = "force-dynamic";

/** Implements: API Specification 10 - Search API, "Organization Search." Public — no authentication. */
export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
    const params = parseSearchParams(request, locale);

    if (params.query.trim().length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "VALIDATION_ERROR", message: "Query parameter 'q' is required." },
        },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();
    const result = await organizationSearch(supabase as never, params);

    return NextResponse.json({ data: result.data, error: null, meta: result.meta });
  } catch (error) {
    return errorToResponse(error);
  }
}
