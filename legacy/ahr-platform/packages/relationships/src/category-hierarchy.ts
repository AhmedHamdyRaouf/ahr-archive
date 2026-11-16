/**
 * Implements: Entity Catalog (Phase 4), Content Taxonomy (Phase 3) —
 * Category's self-reference (`parent_id`), scoped by `domain`.
 */

import type { RelationshipQueryClient } from "./types";

export interface CategorySummary {
  id: string;
  domain: string;
  name_ar: string;
  name_en: string;
  parent_id: string | null;
}

/** The direct child Categories of a given parent Category. */
export async function getChildCategories(
  client: RelationshipQueryClient,
  parentCategoryId: string,
): Promise<CategorySummary[]> {
  const { data, error } = await client
    .from("category")
    .select("*")
    .eq("parent_id", parentCategoryId);
  if (error) {
    throw new Error(`Failed to query child categories of "${parentCategoryId}": ${error.message}`);
  }
  return (data ?? []) as CategorySummary[];
}

/** Every top-level (root) Category within a given domain — the starting point for rendering a taxonomy tree. */
export async function getRootCategories(
  client: RelationshipQueryClient,
  domain: string,
): Promise<CategorySummary[]> {
  const { data, error } = await client.from("category").select("*").eq("domain", domain);
  if (error) {
    throw new Error(`Failed to query root categories for domain "${domain}": ${error.message}`);
  }
  return ((data ?? []) as CategorySummary[]).filter((category) => category.parent_id === null);
}
