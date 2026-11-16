import { NextResponse, type NextRequest } from "next/server";
import { isEntityType, bulkTransitionEntityStatus, type BulkTransitionItem } from "@ahr/content";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createActivityLogger } from "@/lib/activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: Dashboard UX Enhancement Backlog #1 — "Wire up Bulk Actions
 * for real." One Route Handler for bulk status transitions across every
 * entityType (same "generic entity family, one Route Handler" convention
 * as the rest of /api/cms/[entityType] — API Conventions doc 15), mirroring
 * /api/cms/[entityType]/[id]/transition but for many ids at once.
 *
 * Request body: { items: { id: string; currentStatus: string }[], toStatus: string }
 * Response: { data: { id: string; ok: boolean; error?: string }[], error: null }
 * — always 200 on a well-formed request; failures are per-item, not
 * per-request (see bulkTransitionEntityStatus's own note on partial success).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { entityType: string } },
) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { items, toStatus } = body as { items: BulkTransitionItem[]; toStatus: string };

    if (!Array.isArray(items) || items.length === 0 || typeof toStatus !== "string") {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Body must include a non-empty `items` array and a `toStatus` string.",
          },
        },
        { status: 400 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();

    const results = await bulkTransitionEntityStatus(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      items,
      toStatus,
    );

    return NextResponse.json({ data: results, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
