import { NextResponse, type NextRequest } from "next/server";
import { forceDeleteAsset } from "@ahr/media-library";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaLibraryStorageAdapter } from "@/lib/media-library-storage";
import { createMediaLibraryActivityLogger } from "@/lib/media-library-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Implements: data owner decision, 2026-07-25 — "Delete Permanently" for the Asset Library. */
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

    await forceDeleteAsset(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaLibraryStorageAdapter(),
        activityLogger: createMediaLibraryActivityLogger(supabase),
      },
      params.id,
      storagePath,
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorToResponse(error);
  }
}
