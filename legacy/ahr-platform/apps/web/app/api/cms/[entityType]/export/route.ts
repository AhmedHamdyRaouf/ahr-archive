import { NextResponse, type NextRequest } from "next/server";
import { genericList } from "@ahr/cms-core";
import { requireCapability } from "@ahr/auth";
import { isEntityType, getDefinition } from "@ahr/content";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { errorToResponse } from "@/lib/api-error";

/**
 * Implements: Dashboard UX Enhancement Backlog #13 — "Data export
 * (CSV/Excel)." CSV only, not a real .xlsx binary — CSV opens directly in
 * Excel and needs no new dependency (no xlsx/SheetJS package exists in
 * this project today); a true .xlsx export is a contained follow-up if
 * ever specifically needed, not a different design.
 *
 * Honors the SAME `status`/`field_*`/`q` query params the list page
 * itself uses (same allow-listing rule as `page.tsx` — only a real field
 * on this resource, with a value among its declared options, ever reaches
 * a raw `.eq()` filter), so "export what I'm currently looking at" is
 * exactly what this returns, not always-everything.
 */

const EXPORT_PAGE_SIZE = 100;

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(
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

    await requireCapability(nextCookieAdapter(), "content:read");

    const definition = getDefinition(params.entityType);
    const supabase = createRouteHandlerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status") ?? undefined;
    const q = searchParams.get("q") ?? undefined;

    const selectFields = definition.fields.filter((f) => f.type === "select");
    const fieldFilters: Record<string, string> = {};
    for (const field of selectFields) {
      const value = searchParams.get(`field_${field.name}`);
      if (value && field.options?.includes(value)) {
        fieldFilters[field.name] = value;
      }
    }

    const exportableFields = definition.fields.filter(
      (f) => f.type !== "relation" && f.type !== "media",
    );
    const columns: string[] = [];
    if (definition.hasLifecycle) columns.push("status");
    for (const field of exportableFields) {
      if (field.type === "bilingual-text" || field.type === "bilingual-textarea") {
        columns.push(`${field.name}_ar`, `${field.name}_en`);
      } else {
        columns.push(field.name);
      }
    }

    const rows: Record<string, unknown>[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const result = await genericList(
        definition,
        { supabase: supabase as never, actorId: "" },
        {
          pagination: { page, pageSize: EXPORT_PAGE_SIZE },
          filters: { ...(status ? { status } : undefined), ...fieldFilters },
          search: q,
          searchFields: definition.fields
            .filter((f) => f.type === "bilingual-text")
            .flatMap((f) => [`${f.name}_ar`, `${f.name}_en`]),
        },
      );
      rows.push(...(result.data as Record<string, unknown>[]));
      totalPages = result.meta.totalPages;
      page += 1;
    } while (page <= totalPages);

    const lines = [
      columns.join(","),
      ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
    ];
    const csv = lines.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${params.entityType}.csv"`,
      },
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
