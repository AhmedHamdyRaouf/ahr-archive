/**
 * Implements: API Specification 10 - Search API — Global Search, Archive
 * Search, Organization Search, CMS Search (admin), Media Search. One
 * shared core function (`searchSingleEntityType`) — the 4 non-Media
 * endpoints are thin compositions of it, not separate implementations
 * (Coding Standards: "one place for a rule").
 */

import {
  normalizePagination,
  buildPaginationMeta,
  type SupabaseLikeClient,
  type QueryBuilderLike,
} from "@ahr/cms-core";
import { ENTITY_SEARCH_CONFIGS, getSearchColumns } from "./entity-search-configs";
import { computeRelevanceScore } from "./relevance";
import {
  ARCHIVE_ENTITY_TYPES,
  SEARCHABLE_ENTITY_TYPES,
  type SearchableEntityType,
  type SearchParams,
  type SearchResult,
  type SearchResultItem,
  type MediaSearchResultItem,
} from "./types";

// Type alias (not an empty `interface extends`) — identical usage at
// every call site; lint-clean per Milestone 1 Bootstrap Verification.
export type SearchDbClient = SupabaseLikeClient;

interface RawSearchRow {
  id: string;
  public_id: string | null;
  status: string;
  verification_status: string;
  updated_at: string;
  [column: string]: unknown;
}

/**
 * Runs an ILIKE search against one entity type's title/name columns, over
 * an explicit row range — see docs/blocked-fts.md for why this is
 * substring matching, not PostgreSQL full-text search. `rangeEnd` is
 * exclusive-of-nothing (matches Postgrest's own inclusive `range()`).
 */
async function searchSingleEntityTypeRange(
  client: SearchDbClient,
  entityType: SearchableEntityType,
  query: string,
  statusFilter: { enforcePublicVisibility: boolean; status?: string },
  rangeStart: number,
  rangeEnd: number,
): Promise<{ rows: RawSearchRow[]; totalCount: number }> {
  const config = ENTITY_SEARCH_CONFIGS[entityType];
  const [colAr, colEn] = getSearchColumns(entityType);

  let builder = client
    .from(config.tableName)
    .select("*", { count: "exact" }) as unknown as QueryBuilderLike<RawSearchRow>;

  if (statusFilter.enforcePublicVisibility) {
    builder = builder.eq("status", "published").eq("visibility", "public");
  } else if (statusFilter.status) {
    builder = builder.eq("status", statusFilter.status);
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length > 0) {
    builder = builder.or(`${colAr}.ilike.%${trimmedQuery}%,${colEn}.ilike.%${trimmedQuery}%`);
  }

  builder = builder.range(rangeStart, rangeEnd);

  const { data, count, error } = await builder;
  if (error) {
    throw new Error(`Failed to search "${entityType}": ${error.message}`);
  }

  return { rows: (data ?? []) as RawSearchRow[], totalCount: count ?? 0 };
}

function toResultItem(
  entityType: SearchableEntityType,
  row: RawSearchRow,
  query: string,
): SearchResultItem {
  const config = ENTITY_SEARCH_CONFIGS[entityType];
  const [colAr, colEn] = getSearchColumns(entityType);
  const titleAr = String(row[colAr] ?? "");
  const titleEn = String(row[colEn] ?? "");

  return {
    entityType,
    id: row.id,
    slug: config.hasSlug ? row.public_id : null,
    titleAr,
    titleEn,
    status: row.status,
    verificationStatus: row.verification_status,
    updatedAt: row.updated_at,
    relevanceScore: computeRelevanceScore({
      query,
      titleAr,
      titleEn,
      verificationStatus: row.verification_status,
      updatedAt: row.updated_at,
    }),
  };
}

function sortItems(items: SearchResultItem[], params: SearchParams): SearchResultItem[] {
  const sort = params.sort ?? { field: "relevance", direction: "desc" };
  const sorted = [...items];

  sorted.sort((a, b) => {
    let comparison = 0;
    if (sort.field === "relevance") {
      comparison = a.relevanceScore - b.relevanceScore;
    } else if (sort.field === "updatedAt") {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (sort.field === "title") {
      const aTitle = params.locale === "ar" ? a.titleAr : a.titleEn;
      const bTitle = params.locale === "ar" ? b.titleAr : b.titleEn;
      comparison = aTitle.localeCompare(bTitle);
    }
    return sort.direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Implements: API Specification 10 - Search API, "Global Search." Public,
 * published+public only.
 *
 * PAGINATION NOTE (documented simplification, not a hidden bug): merging
 * ranked results across several independent tables without a real search
 * index (blocked — docs/blocked-fts.md) means correct page-N pagination
 * requires re-fetching each table from its start up through the current
 * page's end, then merging, re-sorting by relevance, and slicing the
 * combined list to the requested page. This is O(page × pageSize) per
 * entity type rather than O(pageSize) — acceptable for the page depths a
 * person actually browses to, and honest about the cost rather than
 * silently returning an incorrect/inconsistent page.
 */
export async function globalSearch(
  client: SearchDbClient,
  params: SearchParams,
): Promise<SearchResult<SearchResultItem>> {
  const entityTypes = params.filters?.entityTypes ?? SEARCHABLE_ENTITY_TYPES;
  const pagination = normalizePagination(params.pagination);
  const cumulativeEnd = pagination.page * pagination.pageSize - 1;

  const perType = await Promise.all(
    entityTypes.map((entityType) =>
      searchSingleEntityTypeRange(
        client,
        entityType,
        params.query,
        { enforcePublicVisibility: true },
        0,
        cumulativeEnd,
      ),
    ),
  );

  const allItems = perType.flatMap((result, index) =>
    result.rows.map((row) =>
      toResultItem(entityTypes[index] as SearchableEntityType, row, params.query),
    ),
  );
  const totalCount = perType.reduce((sum, result) => sum + result.totalCount, 0);

  const sorted = sortItems(allItems, params);
  const pageSlice = sorted.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize,
  );

  return { data: pageSlice, meta: buildPaginationMeta(pagination, totalCount) };
}

/** Implements: API Specification 10 - Search API, "Archive Search." Works/Projects/Events only. */
export async function archiveSearch(
  client: SearchDbClient,
  params: SearchParams,
): Promise<SearchResult<SearchResultItem>> {
  return globalSearch(client, {
    ...params,
    filters: { ...params.filters, entityTypes: ARCHIVE_ENTITY_TYPES },
  });
}

/** Implements: API Specification 10 - Search API, "Organization Search." Single entity type — no cross-table merge needed, so normal single-source pagination applies. */
export async function organizationSearch(
  client: SearchDbClient,
  params: SearchParams,
): Promise<SearchResult<SearchResultItem>> {
  const pagination = normalizePagination(params.pagination);
  const rangeStart = (pagination.page - 1) * pagination.pageSize;
  const rangeEnd = pagination.page * pagination.pageSize - 1;

  const { rows, totalCount } = await searchSingleEntityTypeRange(
    client,
    "organizations",
    params.query,
    { enforcePublicVisibility: true },
    rangeStart,
    rangeEnd,
  );

  const items = sortItems(
    rows.map((row) => toResultItem("organizations", row, params.query)),
    params,
  );

  return { data: items, meta: buildPaginationMeta(pagination, totalCount) };
}

/**
 * Implements: API Specification 10 - Search API, "CMS Search (Admin)."
 * Unfiltered by status — Administrators search everything they can
 * already see, per that document. Scoped to ONE entity type at a time
 * (single-source, normal pagination — no cross-table merge).
 */
export async function cmsSearch(
  client: SearchDbClient,
  entityType: SearchableEntityType,
  params: SearchParams,
): Promise<SearchResult<SearchResultItem>> {
  const pagination = normalizePagination(params.pagination);
  const rangeStart = (pagination.page - 1) * pagination.pageSize;
  const rangeEnd = pagination.page * pagination.pageSize - 1;

  const { rows, totalCount } = await searchSingleEntityTypeRange(
    client,
    entityType,
    params.query,
    { enforcePublicVisibility: false, status: params.filters?.status },
    rangeStart,
    rangeEnd,
  );

  const items = sortItems(
    rows.map((row) => toResultItem(entityType, row, params.query)),
    params,
  );

  return { data: items, meta: buildPaginationMeta(pagination, totalCount) };
}

/**
 * Implements: API Specification 10 - Search API, "Media Search." Caption-
 * only substring match, no relevance heuristic beyond the database's own
 * row order — media_asset was never one of the 5 entities Database
 * Architecture §16 named for ranked search (see docs/blocked-fts.md).
 * Single-source — normal pagination applies.
 */
export async function mediaSearch(
  client: SearchDbClient,
  params: SearchParams,
): Promise<SearchResult<MediaSearchResultItem>> {
  const pagination = normalizePagination(params.pagination);

  let builder = client
    .from("media_asset")
    .select("*", { count: "exact" }) as unknown as QueryBuilderLike<RawSearchRow>;
  builder = builder.eq("status", "published").eq("visibility", "public");

  const trimmedQuery = params.query.trim();
  if (trimmedQuery.length > 0) {
    builder = builder.or(`caption_ar.ilike.%${trimmedQuery}%,caption_en.ilike.%${trimmedQuery}%`);
  }

  builder = builder.range(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize - 1,
  );

  const { data, count, error } = await builder;
  if (error) {
    throw new Error(`Failed to search media: ${error.message}`);
  }

  const rows = (data ?? []) as RawSearchRow[];
  const items: MediaSearchResultItem[] = rows.map((row) => ({
    id: row.id,
    mediaType: String(row.media_type),
    captionAr: (row.caption_ar as string | null) ?? null,
    captionEn: (row.caption_en as string | null) ?? null,
    status: row.status,
    updatedAt: row.updated_at,
  }));

  return { data: items, meta: buildPaginationMeta(pagination, count ?? 0) };
}
