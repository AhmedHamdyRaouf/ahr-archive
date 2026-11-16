import { NextResponse, type NextRequest } from "next/server";
import { forceDeleteMedia } from "@ahr/media";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaStorageAdapter } from "@/lib/media-storage";
import { createMediaActivityLogger } from "@/lib/media-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Implements: data owner decision, 2026-07-25 — "Delete Permanently" for Media Library (media_asset). */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const storagePath = body.storagePath;
    if (typeof storagePath !== "string" || storagePath.length === 0) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "storagePath is required." } },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();

    await forceDeleteMedia(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaStorageAdapter(),
        activityLogger: createMediaActivityLogger(supabase),
      },
      params.id,
      storagePath,
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorToResponse(error);
  }
}
