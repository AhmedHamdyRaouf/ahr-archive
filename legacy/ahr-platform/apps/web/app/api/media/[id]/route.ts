import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import {
  updateMediaCaption,
  archiveMedia,
  getMediaAccessUrl,
  mediaAssetDefinition,
} from "@ahr/media";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaStorageAdapter } from "@/lib/media-storage";
import { createMediaActivityLogger } from "@/lib/media-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: Milestone 6 — Get Entity (with access URL resolved per
 * visibility), Update Metadata (caption only — see docs/blocked-metadata.md
 * §4), Delete (archive semantics, never a row deletion — same convention
 * as Media Library API, API Specification 09).
 */

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCapability(nextCookieAdapter(), "content:read");

    const supabase = createRouteHandlerSupabaseClient();
    const { data, error } = await supabase
      .from(mediaAssetDefinition.tableName)
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

    const accessUrl = await getMediaAccessUrl(
      { storage: createMediaStorageAdapter() },
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

    const updated = await updateMediaCaption(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaStorageAdapter(),
        activityLogger: createMediaActivityLogger(supabase),
      },
      params.id,
      { captionAr: body.captionAr, captionEn: body.captionEn },
    );

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentStatus = request.nextUrl.searchParams.get("currentStatus") ?? "published";
    const supabase = createRouteHandlerSupabaseClient();

    const result = await archiveMedia(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        storage: createMediaStorageAdapter(),
        activityLogger: createMediaActivityLogger(supabase),
      },
      params.id,
      currentStatus,
    );

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
