import { NextResponse, type NextRequest } from "next/server";
import { genericList } from "@ahr/cms-core";
import { createEntity, getDefinition, isEntityType } from "@ahr/content";
import { requireCapability } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createActivityLogger } from "@/lib/activity-logger";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: API Specification 03 - CMS API — "List Entities" (GET),
 * "Create Entity" (POST). One Route Handler for every entityType (API
 * Conventions doc 15's "generic entity family") — no per-entity route file.
 */

export async function GET(request: NextRequest, { params }: { params: { entityType: string } }) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");
    const status = searchParams.get("status") ?? undefined;
    const q = searchParams.get("q") ?? undefined;

    // Dashboard UX Enhancement Backlog #2 — "Activate Sort," same
    // allow-listing rule as the server-rendered list page: only a real
    // field on this resource (or "status" for lifecycle entities) may be
    // used as a sort column, never an arbitrary client-supplied string
    // passed straight to `.order()`.
    const sortableFields = new Set(definition.fields.map((f) => f.name));
    if (definition.hasLifecycle) sortableFields.add("status");
    const sortParam = searchParams.get("sort") ?? undefined;
    const sortField = sortParam && sortableFields.has(sortParam) ? sortParam : undefined;
    const direction = searchParams.get("direction") === "desc" ? "desc" : "asc";

    const result = await genericList(
      definition,
      { supabase: supabase as never, actorId: "" },
      {
        pagination: { page, pageSize },
        filters: status ? { status } : undefined,
        search: q,
        searchFields: definition.fields
          .filter((f) => f.type === "bilingual-text")
          .flatMap((f) => [`${f.name}_ar`, `${f.name}_en`]),
        sort: sortField ? { field: sortField, direction } : undefined,
      },
    );

    return NextResponse.json({ data: result.data, error: null, meta: result.meta });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { entityType: string } }) {
  try {
    if (!isEntityType(params.entityType)) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Unknown entity type." } },
        { status: 404 },
      );
    }

    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const created = await createEntity(
      {
        cookies: nextCookieAdapter(),
        supabase: supabase as never,
        activityLogger: createActivityLogger(supabase),
      },
      params.entityType,
      body,
    );

    return NextResponse.json({ data: created, error: null }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}
