import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { getDefinition, isEntityType } from "@ahr/content";
import { getStateHistory } from "@ahr/relationships";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: Milestone 7 — reads `entity_state_transition` (Archive
 * Model, Phase 4), which every entity has been writing to since Milestone
 * 2/4/5/6, but which no Route Handler exposed until now.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    await requireCapability(nextCookieAdapter(), "content:read");
    const definition = getDefinition(params.entityType);
    const supabase = createRouteHandlerSupabaseClient();

    const history = await getStateHistory(supabase as never, definition.tableName, params.id);

    return NextResponse.json({ data: history, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
