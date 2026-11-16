import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { markNotificationRead } from "@/lib/notification-inbox";
import { errorToResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/**
 * Implements: Database Architecture Review Round item E4, activated
 * 2026-07-21. Marks one of the signed-in Administrator's own
 * notifications as read — RLS (`notification_recipient_update`) already
 * guarantees this can never touch another user's row, matching the same
 * reasoning as GET /api/notifications.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(nextCookieAdapter());
    if (!session.authenticated) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();
    await markNotificationRead(supabase, params.id);

    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
