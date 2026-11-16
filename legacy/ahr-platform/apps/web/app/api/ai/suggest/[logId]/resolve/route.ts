import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { errorToResponse } from "@/lib/api-error";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { resolveAiRecommendation } from "@/lib/ai-recommendation-log";

export const dynamic = "force-dynamic";

/**
 * Implements: Database Architecture Review Round item E3, activated
 * 2026-07-21 (docs/Program-Status/Decision-Log.md). Records what the
 * Administrator did with a suggestion previously returned by
 * `POST /api/ai/suggest` (which now returns a `logId` for exactly this
 * purpose). Same Administrator-only capability as the suggest endpoint —
 * this is not a new capability, it is the second half of the same action.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { logId: string } },
) {
  try {
    await requireCapability(nextCookieAdapter(), "ai:suggest");

    const body = (await request.json()) as { outcome?: string };
    if (body.outcome !== "accepted" && body.outcome !== "edited" && body.outcome !== "rejected") {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: 'outcome must be "accepted", "edited", or "rejected".',
          },
        },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();
    await resolveAiRecommendation(supabase, { logId: params.logId, outcome: body.outcome });

    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
