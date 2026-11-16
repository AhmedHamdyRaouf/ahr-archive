import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { getDefinition, isEntityType, updateEntity, deleteEntity } from "@ahr/content";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createActivityLogger } from "@/lib/activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: API Specification 03 - CMS API — "Get Entity" (GET),
 * "Update Entity" (PATCH). Milestone 5 also exposes soft delete here as
 * DELETE (archive semantics, never a row deletion — see Media Library
 * API's identical precedent for why DELETE is documented explicitly
 * rather than left implicit).
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

    const { data, error } = await supabase
      .from(definition.tableName)
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

    return NextResponse.json({ data, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const updated = await updateEntity(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      params.id,
      body,
    );

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    const currentStatus = request.nextUrl.searchParams.get("currentStatus") ?? "published";
    const supabase = createRouteHandlerSupabaseClient();

    const result = await deleteEntity(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      params.id,
      currentStatus,
    );

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
