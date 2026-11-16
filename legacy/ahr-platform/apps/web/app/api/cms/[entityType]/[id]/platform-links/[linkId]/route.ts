import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { updatePlatformLink, removePlatformLink } from "@ahr/relationships";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { errorToResponse } from "@/lib/api-error";

/** Implements: data owner request 2026-07-25 — edit/remove a single platform link (url/display_order/is_visible). */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string; linkId: string } },
) {
  try {
    const session = await requireCapability(nextCookieAdapter(), "content:write");
    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const link = await updatePlatformLink(
      supabase as never,
      session.platformUserId,
      params.linkId,
      {
        url: typeof body.url === "string" ? body.url : undefined,
        displayOrder: typeof body.displayOrder === "number" ? body.displayOrder : undefined,
        isVisible: typeof body.isVisible === "boolean" ? body.isVisible : undefined,
      },
    );

    return NextResponse.json({ data: link, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { entityType: string; id: string; linkId: string } },
) {
  try {
    const session = await requireCapability(nextCookieAdapter(), "content:write");
    const supabase = createRouteHandlerSupabaseClient();

    await removePlatformLink(supabase as never, session.platformUserId, params.linkId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorToResponse(error);
  }
}
