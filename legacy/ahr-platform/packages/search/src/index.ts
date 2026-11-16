/**
 * @ahr/search — public exports only (Coding Standards: "no deep imports
 * from outside a package's public exports"). See docs/blocked-fts.md for
 * what is intentionally absent (PostgreSQL Full-Text Search) and why.
 */

export { SEARCHABLE_ENTITY_TYPES, ARCHIVE_ENTITY_TYPES } from "./types";
export type {
  SearchableEntityType,
  ArchiveEntityType,
  SearchResultItem,
  MediaSearchResultItem,
  PaginationParams,
  PaginationMeta,
  SortField,
  SortDirection,
  SearchSort,
  SearchFilters,
  SearchParams,
  SearchResult,
} from "./types";

export {
  computeMatchScore,
  computeVerificationBonus,
  computeRecencyBonus,
  computeRelevanceScore,
} from "./relevance";
export type { RelevanceInput } from "./relevance";

export { ENTITY_SEARCH_CONFIGS, getSearchColumns } from "./entity-search-configs";
export type { EntitySearchConfig } from "./entity-search-configs";

export {
  globalSearch,
  archiveSearch,
  organizationSearch,
  cmsSearch,
  mediaSearch,
} from "./search-service";
export type { SearchDbClient } from "./search-service";
