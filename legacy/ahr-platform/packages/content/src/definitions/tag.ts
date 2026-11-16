import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Tag; Database Architecture
 * (Frozen v1) §2 — `tag` table. Non-hierarchical, no `domain`, no
 * `parent_id` (Content Architecture, Phase 3).
 */
export const tagDefinition: ResourceDefinition = {
  tableName: "tag",
  label: "Tag",
  labelPlural: "Tags",
  hasSlug: false,
  hasLifecycle: true,
  fields: [{ name: "name", type: "bilingual-text", label: "Name", required: true }],
};
