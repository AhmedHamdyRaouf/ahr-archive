/**
 * Implements: Milestone 4 — Pagination, Filtering, Sorting, Search.
 * API Specification 01 - API Standards: "page (default 1), pageSize
 * (default 20, max 100)."
 *
 * Generic: takes a Supabase query builder and a ListQueryParams, returns
 * the same builder with pagination/sort/filter/search applied. Does not
 * know what table it's querying.
 */

import type { ListQueryParams, PaginationMeta } from "./types";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizePagination(pagination: { page?: number; pageSize?: number }): {
  page: number;
  pageSize: number;
} {
  const page = pagination.page && pagination.page > 0 ? Math.floor(pagination.page) : 1;
  const rawPageSize =
    pagination.pageSize && pagination.pageSize > 0
      ? Math.floor(pagination.pageSize)
      : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(rawPageSize, MAX_PAGE_SIZE);
  return { page, pageSize };
}

export function buildPaginationMeta(
  pagination: { page: number; pageSize: number },
  totalItems: number,
): PaginationMeta {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pagination.pageSize)),
  };
}

export interface ListQueryResult<T> {
  data: T[] | null;
  count: number | null;
  error: { message: string } | null;
}

/**
 * Minimal shape of the subset of a Supabase/PostgREST query builder this
 * module needs — kept narrow and structural (not the full SDK type) so
 * this package doesn't need @supabase/supabase-js as a runtime dependency,
 * only whatever object happens to implement this shape (real client in
 * production, a simple mock in tests). Extends PromiseLike because
 * Supabase's real query builder is directly awaitable (it resolves to
 * { data, count, error } once you `await` the chain) — this mirrors that
 * exactly rather than inventing a different calling convention.
 */
export interface QueryBuilderLike<T = unknown> extends PromiseLike<ListQueryResult<T>> {
  range(from: number, to: number): QueryBuilderLike<T>;
  order(field: string, options: { ascending: boolean }): QueryBuilderLike<T>;
  eq(field: string, value: unknown): QueryBuilderLike<T>;
  or(filterString: string): QueryBuilderLike<T>;
}

/**
 * Applies pagination + sort + filters + search to a query builder. Returns
 * the same (chained) builder — callers still `await` it themselves,
 * since this module doesn't know what shape the eventual result takes.
 */
export function applyListQuery<T>(
  builder: QueryBuilderLike<T>,
  params: ListQueryParams,
): QueryBuilderLike<T> {
  const { page, pageSize } = normalizePagination(params.pagination);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = builder.range(from, to);

  if (params.sort) {
    query = query.order(params.sort.field, { ascending: params.sort.direction === "asc" });
  }

  // Every table has a uuid `id` primary key (Data Foundation Conventions,
  // 🔒 locked) — chaining it as an always-present secondary sort gives
  // Postgres a fully deterministic row order for `range()`/offset
  // pagination. Without this, sorting by a field with ties (or not
  // sorting at all) lets ties resolve in a different relative order on
  // each query execution, so consecutive pages can silently overlap or
  // skip rows — found via the Works page's infinite scroll returning
  // duplicate Works when sorting by `year` (frequently null/tied).
  query = query.order("id", { ascending: true });

  if (params.filters) {
    for (const [field, value] of Object.entries(params.filters)) {
      if (value !== undefined) {
        query = query.eq(field, value);
      }
    }
  }

  if (params.search && params.searchFields && params.searchFields.length > 0) {
    // PostgREST `or` filter syntax — generic, caller supplies which columns
    // to search (this module has no per-entity knowledge of field names).
    const orExpression = params.searchFields
      .map((field) => `${field}.ilike.%${params.search}%`)
      .join(",");
    query = query.or(orExpression);
  }

  return query;
}
