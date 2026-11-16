import { NextResponse, type NextRequest } from "next/server";
import { uploadMedia, MEDIA_OWNER_TYPES, type MediaOwnerType } from "@ahr/media";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaStorageAdapter } from "@/lib/media-storage";
import { createMediaActivityLogger } from "@/lib/media-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Implements: Milestone 6 — Upload pipeline, exposed as a Route Handler. */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ownerType = formData.get("ownerType");
    const ownerId = formData.get("ownerId");
    const captionAr = formData.get("captionAr");
    const captionEn = formData.get("captionEn");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "A file is required." } },
        { status: 422 },
      );
    }
    if (typeof ownerType !== "string" || !MEDIA_OWNER_TYPES.includes(ownerType as MediaOwnerType)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: `ownerType must be one of: ${MEDIA_OWNER_TYPES.join(", ")}.`,
          },
        },
        { status: 422 },
      );
    }
    if (typeof ownerId !== "string" || ownerId.length === 0) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "ownerId is required." } },
        { status: 422 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const supabase = createRouteHandlerSupabaseClient();

    const result = await uploadMedia(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaStorageAdapter(),
        activityLogger: createMediaActivityLogger(supabase),
      },
      {
        ownerType: ownerType as MediaOwnerType,
        ownerId,
        file: { bytes, fileName: file.name, mimeType: file.type },
        captionAr: typeof captionAr === "string" ? captionAr : undefined,
        captionEn: typeof captionEn === "string" ? captionEn : undefined,
      },
    );

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}
