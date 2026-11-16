/**
 * Implements: Milestone 9 §"Search result models"; API Specification 10
 * - Search API. See `../docs/blocked-fts.md` for what is intentionally
 * absent (PostgreSQL Full-Text Search) and why.
 */

/**
 * The 5 entities Database Architecture §16 named for search readiness —
 * unchanged by this milestone's ILIKE-based implementation; only the
 * matching TECHNIQUE differs from what §16 originally envisioned, not
 * which entities are searchable.
 */
export const SEARCHABLE_ENTITY_TYPES = [
  "persons",
  "works",
  "projects",
  "events",
  "organizations",
] as const;
export type SearchableEntityType = (typeof SEARCHABLE_ENTITY_TYPES)[number];

/** Entities reachable through Archive Search (API Specification 10) — Work/Project/Event only, excluding Person/Organization. */
export const ARCHIVE_ENTITY_TYPES = ["works", "projects", "events"] as const;
export type ArchiveEntityType = (typeof ARCHIVE_ENTITY_TYPES)[number];

export interface SearchResultItem {
  entityType: SearchableEntityType;
  id: string;
  slug: string | null; // public_id
  titleAr: string;
  titleEn: string;
  status: string;
  verificationStatus: string;
  updatedAt: string;
  relevanceScore: number;
}

export interface MediaSearchResultItem {
  id: string;
  mediaType: string;
  captionAr: string | null;
  captionEn: string | null;
  status: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type SortField = "relevance" | "updatedAt" | "title";
export type SortDirection = "asc" | "desc";

export interface SearchSort {
  field: SortField;
  direction: SortDirection;
}

export interface SearchFilters {
  /** Restrict results to specific entity types (Global Search only — a no-op for single-entity searches). */
  entityTypes?: readonly SearchableEntityType[];
  /** Admin-only (CMS Search) — restrict to a specific lifecycle status. Never applied to public search. */
  status?: string;
}

export interface SearchParams {
  query: string;
  locale: "ar" | "en";
  pagination: PaginationParams;
  sort?: SearchSort;
  filters?: SearchFilters;
}

export interface SearchResult<T> {
  data: T[];
  meta: PaginationMeta;
}
