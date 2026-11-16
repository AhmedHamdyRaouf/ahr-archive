import { NextResponse, type NextRequest } from "next/server";
import { uploadAsset } from "@ahr/media-library";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaLibraryStorageAdapter } from "@/lib/media-library-storage";
import { createMediaLibraryActivityLogger } from "@/lib/media-library-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Upload pipeline for the Asset Library — mirrors POST /api/media (Milestone 6). */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const imageKey = formData.get("imageKey");
    const titleAr = formData.get("titleAr");
    const titleEn = formData.get("titleEn");
    const altTextAr = formData.get("altTextAr");
    const altTextEn = formData.get("altTextEn");
    const captionAr = formData.get("captionAr");
    const captionEn = formData.get("captionEn");
    const tags = formData.get("tags");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "A file is required." } },
        { status: 422 },
      );
    }
    if (typeof imageKey !== "string" || imageKey.trim().length === 0) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "imageKey is required." } },
        { status: 422 },
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const supabase = createRouteHandlerSupabaseClient();

    const asset = await uploadAsset(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaLibraryStorageAdapter(),
        activityLogger: createMediaLibraryActivityLogger(supabase),
      },
      {
        imageKey: imageKey.trim(),
        file: { bytes, fileName: file.name, mimeType: file.type },
        titleAr: typeof titleAr === "string" ? titleAr : undefined,
        titleEn: typeof titleEn === "string" ? titleEn : undefined,
        altTextAr: typeof altTextAr === "string" ? altTextAr : undefined,
        altTextEn: typeof altTextEn === "string" ? altTextEn : undefined,
        captionAr: typeof captionAr === "string" ? captionAr : undefined,
        captionEn: typeof captionEn === "string" ? captionEn : undefined,
        tags:
          typeof tags === "string" && tags.trim().length > 0
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
            : undefined,
      },
    );

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}
