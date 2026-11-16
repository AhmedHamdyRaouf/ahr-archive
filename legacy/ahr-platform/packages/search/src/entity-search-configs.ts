/**
 * Implements: Milestone 9 §"Entity indexing strategy based on the
 * existing schema." One config per searchable entity — table name and
 * which bilingual column pair to match against — copied from the same
 * tables `@ahr/content`'s ResourceDefinitions already describe (not a
 * second, independently-maintained copy of field names; see the
 * `titleColumn` values below, which match `@ahr/content`'s definitions
 * exactly).
 */

import type { SearchableEntityType } from "./types";

export interface EntitySearchConfig {
  tableName: string;
  /** The bilingual column pair prefix, e.g. "title" for title_ar/title_en, "name" for name_ar/name_en. */
  titleColumn: string;
  hasSlug: boolean;
}

export const ENTITY_SEARCH_CONFIGS: Record<SearchableEntityType, EntitySearchConfig> = {
  persons: { tableName: "person", titleColumn: "name", hasSlug: true },
  works: { tableName: "work", titleColumn: "title", hasSlug: true },
  projects: { tableName: "project", titleColumn: "title", hasSlug: true },
  events: { tableName: "event", titleColumn: "title", hasSlug: true },
  organizations: { tableName: "organization", titleColumn: "name", hasSlug: true },
};

export function getSearchColumns(entityType: SearchableEntityType): [string, string] {
  const config = ENTITY_SEARCH_CONFIGS[entityType];
  return [`${config.titleColumn}_ar`, `${config.titleColumn}_en`];
}
