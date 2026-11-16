import { NextResponse, type NextRequest } from "next/server";
import { transitionModerationReport } from "@ahr/workflow";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createWorkflowActivityLogger } from "@/lib/workflow-activity-logger";
import { notifyEvent } from "@/lib/notification-dispatch";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: API Specification 08 - Dashboard API, "Transition
 * Moderation Report"; Milestone 11 §"Event-driven notification dispatch."
 * On escalation/resolution, notifies whoever is accountable for the
 * report (`assigned_to`, falling back to `reported_by`) — the events
 * `@ahr/notifications`' templates already cover (Milestone 11).
 *
 * NOTE: `recipientEmail` is intentionally left unresolved here — mapping
 * a `platform_user.id` to an email address requires the Supabase Admin
 * API (`auth.admin.getUserById`), a real integration this milestone does
 * not wire up. `HttpEmailProvider` already handles a missing email
 * gracefully (a captured "failed" dispatch result, not a thrown error
 * that would block the transition response) — this is an honest, narrow
 * gap, not a silent one.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { currentStatus, toStatus, resolutionNotes, assignedTo } = body as {
      currentStatus: string;
      toStatus: string;
      resolutionNotes?: string;
      assignedTo?: string;
    };
    const supabase = createRouteHandlerSupabaseClient();

    const report = await transitionModerationReport(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        activityLogger: createWorkflowActivityLogger(supabase),
      },
      params.id,
      currentStatus,
      toStatus,
      { resolutionNotes, assignedTo },
    );

    const recipientPlatformUserId = report.assigned_to ?? report.reported_by;
    if (toStatus === "escalated") {
      await notifyEvent({
        type: "moderation_report_escalated",
        recipientPlatformUserId,
        data: { reportId: report.id, entityTable: "moderation_report", entityId: report.id },
        supabase,
      });
    } else if (toStatus === "resolved") {
      await notifyEvent({
        type: "moderation_report_resolved",
        recipientPlatformUserId,
        data: {
          reportId: report.id,
          resolutionNotes: report.resolution_notes ?? "",
          entityTable: "moderation_report",
          entityId: report.id,
        },
        supabase,
      });
    }

    return NextResponse.json({ data: report, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
