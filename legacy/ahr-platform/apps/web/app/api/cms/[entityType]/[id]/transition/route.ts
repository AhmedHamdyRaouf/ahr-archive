import { NextResponse, type NextRequest } from "next/server";
import { isEntityType, transitionEntityStatus } from "@ahr/content";
import { getSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createActivityLogger } from "@/lib/activity-logger";
import { notifyEvent } from "@/lib/notification-dispatch";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: API Specification 03 - CMS API — "Transition Status";
 * Milestone 11 §"Event-driven notification dispatch" — a confirmation
 * notification to the actor when content reaches `published` (there is
 * no clear "owner to notify" designation beyond the actor themselves in
 * the frozen schema for this event — see the moderation transition Route
 * Handler's own note on the same class of gap).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { currentStatus, toStatus } = body as { currentStatus: string; toStatus: string };
    const supabase = createRouteHandlerSupabaseClient();

    const result = await transitionEntityStatus(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      params.id,
      currentStatus,
      toStatus,
    );

    if (toStatus === "published") {
      const session = await getSession(nextCookieAdapter());
      if (session.authenticated) {
        const record = result as Record<string, unknown>;
        const title = String(
          record.title_en ?? record.name_en ?? record.title_ar ?? record.name_ar ?? "",
        );
        await notifyEvent({
          type: "content_published",
          recipientPlatformUserId: session.platformUserId,
          data: { entityTable: params.entityType, title, entityId: String(record.id) },
          supabase,
        });
      }
    }

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
