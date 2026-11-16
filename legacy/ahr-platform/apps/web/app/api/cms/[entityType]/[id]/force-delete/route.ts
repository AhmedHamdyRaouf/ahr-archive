import { NextResponse, type NextRequest } from "next/server";
import { isEntityType, forceDeleteEntity } from "@ahr/content";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createActivityLogger } from "@/lib/activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: data owner decision, 2026-07-25 — "Delete Permanently."
 * A dedicated action endpoint (mirrors /transition and /restore's shape)
 * rather than overloading DELETE further — DELETE on this same resource
 * already means "archive" (Milestone 5), and this is a deliberately
 * distinct, far more consequential action.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();

    await forceDeleteEntity(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      params.id,
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorToResponse(error);
  }
}
