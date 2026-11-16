import { NextResponse, type NextRequest } from "next/server";
import { isEntityType, restoreEntity } from "@ahr/content";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createActivityLogger } from "@/lib/activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: Milestone 5 §"Restore" — the documented archived→published
 * path (Database Architecture §7). A thin, explicit convenience wrapper
 * over the same transition mechanism `/transition` uses — not a second
 * implementation of restore logic (Non-Negotiable Rule #5: no duplicated
 * CRUD logic).
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

    const result = await restoreEntity(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      params.id,
    );

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
