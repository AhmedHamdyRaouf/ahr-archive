import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import {
  listPlatformLinksForEntity,
  createPlatformLink,
  reorderPlatformLinks,
  type PlatformLinkOwnerType,
} from "@ahr/relationships";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: data owner request 2026-07-25 — attach/list/reorder an
 * entity's external platform links. Same shape as the existing
 * `/taxonomy` Route Handler for the same `[entityType]/[id]` resource —
 * only Person/Organization/Project/Work are valid here (the four owner
 * columns `entity_external_link` actually has).
 */

const OWNER_TYPE_BY_ENTITY_TYPE: Record<string, PlatformLinkOwnerType> = {
  persons: "person",
  organizations: "organization",
  projects: "project",
  works: "work",
};

function ownerTypeFor(entityType: string): PlatformLinkOwnerType | null {
  return OWNER_TYPE_BY_ENTITY_TYPE[entityType] ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    const ownerType = ownerTypeFor(params.entityType);
    if (!ownerType) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Platform links are not supported for this entity type.",
          },
        },
        { status: 404 },
      );
    }

    await requireCapability(nextCookieAdapter(), "content:read");
    const supabase = createRouteHandlerSupabaseClient();
    const links = await listPlatformLinksForEntity(supabase as never, ownerType, params.id);

    return NextResponse.json({ data: links, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    const ownerType = ownerTypeFor(params.entityType);
    if (!ownerType) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Platform links are not supported for this entity type.",
          },
        },
        { status: 404 },
      );
    }

    const session = await requireCapability(nextCookieAdapter(), "content:write");
    const body = await request.json();
    const supabase = createRouteHandlerSupabaseClient();

    const link = await createPlatformLink(
      supabase as never,
      session.platformUserId,
      ownerType,
      params.id,
      {
        platformId: body.platformId,
        url: body.url,
        displayOrder: typeof body.displayOrder === "number" ? body.displayOrder : undefined,
        isVisible: typeof body.isVisible === "boolean" ? body.isVisible : undefined,
      },
    );

    return NextResponse.json({ data: link }, { status: 201 });
  } catch (error) {
    return errorToResponse(error);
  }
}

/** Reorder — persists a new display_order for every link id in the given order. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { entityType: string; id: string } },
) {
  try {
    const ownerType = ownerTypeFor(params.entityType);
    if (!ownerType) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Platform links are not supported for this entity type.",
          },
        },
        { status: 404 },
      );
    }

    const session = await requireCapability(nextCookieAdapter(), "content:write");
    const body = await request.json();
    const orderedIds = Array.isArray(body.orderedIds) ? (body.orderedIds as string[]) : null;
    if (!orderedIds) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "orderedIds is required." } },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();
    await reorderPlatformLinks(supabase as never, session.platformUserId, orderedIds);

    return NextResponse.json({ data: { reordered: true }, error: null });
  } catch (error) {
    return errorToResponse(error);
  }
}
