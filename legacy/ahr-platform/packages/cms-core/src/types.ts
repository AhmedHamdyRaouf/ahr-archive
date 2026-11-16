/**
 * Implements: Milestone 4 objective — "Build the generic CMS Foundation
 * that every future package will use." A ResourceDefinition describes the
 * SHAPE of an entity (its table name, fields, which fields are required,
 * whether it has a slug, etc.) generically — this file contains no
 * reference to `work`, `person`, or any other real table name. A future
 * Work package instantiates a ResourceDefinition for `work`; that
 * instantiation lives in that future package, not here (Out of Scope:
 * "Works, Artists, Albums...").
 */

export type FieldType =
  | "text"
  | "bilingual-text"
  | "textarea"
  | "bilingual-textarea"
  | "select"
  | "boolean"
  | "number"
  | "date"
  | "relation"
  | "media"; // Media Picker abstraction (see media-picker.ts) — no Media Library dependency

export interface FieldDefinition {
  /** Column name (snake_case, matching Database Architecture §2 naming). */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** For type: "select" — the fixed allowed values (mirrors a `check` constraint). */
  options?: readonly string[];
}

export interface ResourceDefinition {
  /** Must match an existing table in the Frozen v1 Database Architecture — never invented here. */
  tableName: string;
  /** Human-readable label, e.g. "Work" — used by generic UI (AdminTable title, etc.). */
  label: string;
  labelPlural: string;
  fields: readonly FieldDefinition[];
  /** Whether this resource has a `public_id` (slug) column (Database Architecture §5). */
  hasSlug: boolean;
  /** Which field to derive the slug from when hasSlug is true (slug.ts). */
  slugSourceField?: string;
  /** Whether this resource carries the shared status/visibility/verification_status columns. */
  hasLifecycle: boolean;
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

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  [field: string]: string | number | boolean | undefined;
}

export interface ListQueryParams {
  pagination: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
  /** Free-text search (CMS Search, admin-scoped — API Specification 10 - Search API, "CMS Search"). */
  search?: string;
  /** Fields searched when `search` is provided — caller-specified, since this module doesn't know field names for any real entity. */
  searchFields?: readonly string[];
}

export interface ListResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Matches API Standards' { data, error, meta } envelope (API Specification 01). */
export interface ApiResult<T> {
  data: T | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
  meta?: PaginationMeta;
}
