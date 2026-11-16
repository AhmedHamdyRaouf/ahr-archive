import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { listModerationReports, openModerationReport, isModerationStatus } from "@ahr/workflow";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createWorkflowActivityLogger } from "@/lib/workflow-activity-logger";
import { notifyEvent } from "@/lib/notification-dispatch";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: API Specification 08 - Dashboard API — "List Moderation
 * Reports" / (creation, not originally in that document's endpoint list
 * but necessary to actually open a report — Milestone 10 fills this gap).
 */

export async function GET(request: NextRequest) {
  try {
    await requireCapability(nextCookieAdapter(), "moderation:manage");

    const sp = request.nextUrl.searchParams;
    const statusParam = sp.get("status");
    const supabase = createRouteHandlerSupabaseClient();

    const result = await listModerationReports(supabase as never, {
      pagination: {
        page: Number(sp.get("page") ?? "1"),
        pageSize: Number(sp.get("pageSize") ?? "20"),
      },
      status: statusParam && isModerationStatus(statusParam) ? statusParam : undefined,
    });

    return NextResponse.json({ data: result.data, error: null, meta: result.meta });
  } catch (error) {
    return errorToResponse(error);
  }
}

/** Implements: Milestone 11 §"Event-driven notification dispatch" — a confirmation notification to whoever filed the report (see the transition Route Handler's own note on unresolved recipient email). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const report = await openModerationReport(
      {
        cookies: nextCookieAdapter(),
        db: supabase as never,
        activityLogger: createWorkflowActivityLogger(supabase),
      },
      { entityTable: body.entityTable, entityId: body.entityId, reason: body.reason },
    );

    await notifyEvent({
      type: "moderation_report_opened",
      recipientPlatformUserId: report.reported_by,
      data: { entityTable: report.entity_table, entityId: report.entity_id, reason: report.reason },
      supabase,
    });

    return NextResponse.json({ data: report, error: null }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}
