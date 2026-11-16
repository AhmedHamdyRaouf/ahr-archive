import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { listNotifications } from "@/lib/notification-inbox";
import { errorToResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/**
 * Implements: Database Architecture Review Round item E4, activated
 * 2026-07-21 (docs/Program-Status/Decision-Log.md). Lists the signed-in
 * Administrator's own notifications — RLS (`notification_recipient_read`,
 * recipient_id = auth.uid()) already guarantees this can never return
 * another user's rows, so this Route Handler doesn't need its own
 * capability check beyond "is anyone signed in" (matching the same
 * reasoning already used for the content_published notify call in
 * app/api/cms/[entityType]/[id]/transition/route.ts — a notification
 * inbox is inherently "your own data," not a capability-gated action).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(nextCookieAdapter());
    if (!session.authenticated) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 },
      );
    }

    const onlyUnread = request.nextUrl.searchParams.get("unread") === "true";
    const supabase = createRouteHandlerSupabaseClient();
    const notifications = await listNotifications(supabase, { onlyUnread });

    return NextResponse.json({ data: notifications, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
