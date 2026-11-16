import { NextResponse, type NextRequest } from "next/server";
import { restoreMedia } from "@ahr/media";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaStorageAdapter } from "@/lib/media-storage";
import { createMediaActivityLogger } from "@/lib/media-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Implements: Milestone 6 — Restore (documented archived→published path). */
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerSupabaseClient();

    const result = await restoreMedia(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaStorageAdapter(),
        activityLogger: createMediaActivityLogger(supabase),
      },
      params.id,
    );

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
