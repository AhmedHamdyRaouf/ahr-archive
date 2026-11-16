import { NextResponse, type NextRequest } from "next/server";
import { transitionAssetStatus } from "@ahr/media-library";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaLibraryStorageAdapter } from "@/lib/media-library-storage";
import { createMediaLibraryActivityLogger } from "@/lib/media-library-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Status transition (Draft→Review→Verified→Published→Archived) for an Asset Library row. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { currentStatus, toStatus } = body;

    if (typeof currentStatus !== "string" || typeof toStatus !== "string") {
      return NextResponse.json(
        {
          data: null,
          error: { code: "VALIDATION_ERROR", message: "currentStatus and toStatus are required." },
        },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();

    const result = await transitionAssetStatus(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaLibraryStorageAdapter(),
        activityLogger: createMediaLibraryActivityLogger(supabase),
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
