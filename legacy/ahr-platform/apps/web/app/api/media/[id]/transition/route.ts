import { NextResponse, type NextRequest } from "next/server";
import { transitionMediaStatus } from "@ahr/media";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaStorageAdapter } from "@/lib/media-storage";
import { createMediaActivityLogger } from "@/lib/media-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Implements: Milestone 6 — File lifecycle (Draft→Review→Verified→Published→Archived). */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { currentStatus, toStatus } = body as { currentStatus: string; toStatus: string };
    const supabase = createRouteHandlerSupabaseClient();

    const result = await transitionMediaStatus(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaStorageAdapter(),
        activityLogger: createMediaActivityLogger(supabase),
      },
      params.id,
      currentStatus,
      toStatus,
    );

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
