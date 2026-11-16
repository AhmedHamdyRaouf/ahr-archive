import { NextResponse, type NextRequest } from "next/server";
import { assignModerationReport } from "@ahr/workflow";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createWorkflowActivityLogger } from "@/lib/workflow-activity-logger";
import { errorToResponse } from "@/lib/api-error";

/** Implements: Milestone 10 — reassigning a moderation report to a different Administrator. */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const report = await assignModerationReport(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        activityLogger: createWorkflowActivityLogger(supabase),
      },
      params.id,
      body.assignedTo,
    );

    return NextResponse.json({ data: report, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
