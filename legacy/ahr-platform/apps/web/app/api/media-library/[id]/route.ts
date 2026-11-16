import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { updateAssetMetadata, deleteAsset, getAssetAccessUrl, mediaLibraryDefinition } from "@ahr/media-library";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaLibraryStorageAdapter } from "@/lib/media-library-storage";
import { createMediaLibraryActivityLogger } from "@/lib/media-library-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Get Asset (with access URL resolved per visibility), Update Metadata
 * (title/alt text/caption/tags), Delete (archive semantics unless the row
 * never left draft — see @ahr/media-library's service.ts) — mirrors
 * apps/web/app/api/media/[id]/route.ts's shape for media_asset.
 */

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCapability(nextCookieAdapter(), "media-library:manage");

    const supabase = createRouteHandlerSupabaseClient();
    const { data, error } = await supabase
      .from(mediaLibraryDefinition.tableName)
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Not found." } },
        { status: 404 },
      );
    }

    const accessUrl = await getAssetAccessUrl(
      { storage: createMediaLibraryStorageAdapter() },
      data as never,
    );

    return NextResponse.json({ data: { ...data, accessUrl }, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const updated = await updateAssetMetadata(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaLibraryStorageAdapter(),
        activityLogger: createMediaLibraryActivityLogger(supabase),
      },
      params.id,
      {
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        altTextAr: body.altTextAr,
        altTextEn: body.altTextEn,
        captionAr: body.captionAr,
        captionEn: body.captionEn,
        tags: Array.isArray(body.tags) ? body.tags : undefined,
        visibility: typeof body.visibility === "string" ? body.visibility : undefined,
        focalX: typeof body.focalX === "number" ? body.focalX : undefined,
        focalY: typeof body.focalY === "number" ? body.focalY : undefined,
      },
    );

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentStatus = request.nextUrl.searchParams.get("currentStatus") ?? "published";
    const storagePath = request.nextUrl.searchParams.get("storagePath");
    if (!storagePath) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "storagePath is required." } },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();

    const result = await deleteAsset(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaLibraryStorageAdapter(),
        activityLogger: createMediaLibraryActivityLogger(supabase),
      },
      params.id,
      currentStatus,
      storagePath,
    );

    if (result === null) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
