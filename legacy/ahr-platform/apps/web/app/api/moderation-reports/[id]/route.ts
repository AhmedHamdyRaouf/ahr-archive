import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { getModerationReport } from "@ahr/workflow";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { errorToResponse } from "@/lib/api-error";

/** Implements: API Specification 08 - Dashboard API, "Get Moderation Report." */
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCapability(nextCookieAdapter(), "moderation:manage");

    const supabase = createRouteHandlerSupabaseClient();
    const report = await getModerationReport(supabase as never, params.id);

    if (!report) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Not found." } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: report, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
