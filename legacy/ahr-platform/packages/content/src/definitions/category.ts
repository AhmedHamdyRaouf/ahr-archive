import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Category; Content Taxonomy
 * (Phase 3); Database Architecture (Frozen v1) §2 — `category` table.
 * `domain` scopes the tree (e.g. 'work_type') — see `../taxonomy.ts` for
 * the domain-scoping enforcement this definition alone can't express
 * (a `select` field validates against a fixed option list, but "which
 * categories may attach to which entity type" is a cross-entity rule).
 */
export const categoryDefinition: ResourceDefinition = {
  tableName: "category",
  label: "Category",
  labelPlural: "Categories",
  hasSlug: false,
  hasLifecycle: true,
  fields: [
    {
      name: "domain",
      type: "select",
      label: "Domain",
      required: true,
      options: ["work_type", "project_type"],
    },
    { name: "name", type: "bilingual-text", label: "Name", required: true },
    { name: "parent_id", type: "relation", label: "Parent Category" },
  ],
};
