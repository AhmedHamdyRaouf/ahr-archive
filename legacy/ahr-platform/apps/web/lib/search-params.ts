import type { NextRequest } from "next/server";
import type { SearchParams, SortField } from "@ahr/search";

const VALID_SORT_FIELDS: readonly SortField[] = ["relevance", "updatedAt", "title"];

function parseSortField(value: string | null): SortField {
  return VALID_SORT_FIELDS.includes(value as SortField) ? (value as SortField) : "relevance";
}

/**
 * Implements: API Specification 01 - API Standards (pagination), 10 -
 * Search API. One shared parser — every search Route Handler uses this
 * rather than re-parsing `searchParams` inline.
 */
export function parseSearchParams(request: NextRequest, locale: "ar" | "en"): SearchParams {
  const sp = request.nextUrl.searchParams;
  return {
    query: sp.get("q") ?? "",
    locale,
    pagination: {
      page: Number(sp.get("page") ?? "1"),
      pageSize: Number(sp.get("pageSize") ?? "20"),
    },
    sort: sp.get("sortField")
      ? {
          field: parseSortField(sp.get("sortField")),
          direction: sp.get("sortDirection") === "asc" ? "asc" : "desc",
        }
      : undefined,
  };
}
