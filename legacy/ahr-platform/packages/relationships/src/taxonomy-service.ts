/**
 * Implements: Content Taxonomy (Phase 3); Database Architecture (Frozen
 * v1) §2 — `work_category`, `work_tag`, `project_category`, `project_tag`
 * join tables (Milestone 2). Realizes API Specification 03 - CMS API,
 * "Assign Taxonomy": "full replacement of the current set, not
 * incremental add/remove."
 *
 * These join tables have a composite primary key and no `id`/audit/status
 * columns — they cannot go through `@ahr/cms-core`'s generic
 * `genericCreate`/`genericList` (which assume an `id` PK and lifecycle
 * columns). This file is bespoke, tested code for exactly that reason,
 * not an oversight.
 */

import { assertCategoryDomainMatches, supportsTaxonomy } from "@ahr/content";
import type { RelationshipQueryClient, RelationshipWriteClient } from "./types";

export type TaxonomyEntityType = "works" | "projects";

const TABLE_NAMES: Record<
  TaxonomyEntityType,
  { categoryJoin: string; tagJoin: string; idColumn: string }
> = {
  works: { categoryJoin: "work_category", tagJoin: "work_tag", idColumn: "work_id" },
  projects: { categoryJoin: "project_category", tagJoin: "project_tag", idColumn: "project_id" },
};

function assertSupportsTaxonomy(entityType: string): asserts entityType is TaxonomyEntityType {
  if (!supportsTaxonomy(entityType)) {
    throw new Error(
      `"${entityType}" does not support taxonomy assignment (no join table exists for it).`,
    );
  }
}

/** Reads the categories currently attached to a Work or Project. */
export async function getCategoriesForEntity(
  client: RelationshipQueryClient,
  entityType: TaxonomyEntityType,
  entityId: string,
): Promise<string[]> {
  assertSupportsTaxonomy(entityType);
  const { categoryJoin, idColumn } = TABLE_NAMES[entityType];

  const { data, error } = await client
    .from(categoryJoin)
    .select("category_id")
    .eq(idColumn, entityId);
  if (error) {
    throw new Error(`Failed to read categories for ${entityType} "${entityId}": ${error.message}`);
  }
  return (data ?? []).map((row) => (row as { category_id: string }).category_id);
}

/** Reads the tags currently attached to a Work or Project. */
export async function getTagsForEntity(
  client: RelationshipQueryClient,
  entityType: TaxonomyEntityType,
  entityId: string,
): Promise<string[]> {
  assertSupportsTaxonomy(entityType);
  const { tagJoin, idColumn } = TABLE_NAMES[entityType];

  const { data, error } = await client.from(tagJoin).select("tag_id").eq(idColumn, entityId);
  if (error) {
    throw new Error(`Failed to read tags for ${entityType} "${entityId}": ${error.message}`);
  }
  return (data ?? []).map((row) => (row as { tag_id: string }).tag_id);
}

/**
 * Replaces the full set of Category assignments for a Work/Project — "full
 * replacement," not incremental (API Specification 03 - CMS API). Each
 * category's `domain` must match the entity type (validated via
 * `@ahr/content`'s `assertCategoryDomainMatches`, reused rather than
 * re-implemented — Milestones 1–6 are frozen, but this package is new and
 * had no reason not to depend on `@ahr/content`'s existing, already-tested
 * check).
 */
export async function setCategoriesForEntity(
  client: RelationshipWriteClient,
  entityType: TaxonomyEntityType,
  entityId: string,
  categories: Array<{ id: string; domain: string }>,
): Promise<void> {
  assertSupportsTaxonomy(entityType);
  for (const category of categories) {
    assertCategoryDomainMatches(entityType, category.domain); // throws TaxonomyDomainMismatchError
  }

  const { categoryJoin, idColumn } = TABLE_NAMES[entityType];

  const { error: deleteError } = await client.from(categoryJoin).delete().eq(idColumn, entityId);
  if (deleteError) {
    throw new Error(
      `Failed to clear existing categories for ${entityType} "${entityId}": ${deleteError.message}`,
    );
  }

  if (categories.length === 0) return; // "replace with nothing" is a valid, explicit empty set

  const rows = categories.map((category) => ({ [idColumn]: entityId, category_id: category.id }));
  const { error: insertError } = await client.from(categoryJoin).insert(rows);
  if (insertError) {
    throw new Error(
      `Failed to assign categories for ${entityType} "${entityId}": ${insertError.message}`,
    );
  }
}

/** Replaces the full set of Tag assignments for a Work/Project — tags have no domain restriction (Content Taxonomy, Phase 3). */
export async function setTagsForEntity(
  client: RelationshipWriteClient,
  entityType: TaxonomyEntityType,
  entityId: string,
  tagIds: string[],
): Promise<void> {
  assertSupportsTaxonomy(entityType);
  const { tagJoin, idColumn } = TABLE_NAMES[entityType];

  const { error: deleteError } = await client.from(tagJoin).delete().eq(idColumn, entityId);
  if (deleteError) {
    throw new Error(
      `Failed to clear existing tags for ${entityType} "${entityId}": ${deleteError.message}`,
    );
  }

  if (tagIds.length === 0) return;

  const rows = tagIds.map((tagId) => ({ [idColumn]: entityId, tag_id: tagId }));
  const { error: insertError } = await client.from(tagJoin).insert(rows);
  if (insertError) {
    throw new Error(
      `Failed to assign tags for ${entityType} "${entityId}": ${insertError.message}`,
    );
  }
}
