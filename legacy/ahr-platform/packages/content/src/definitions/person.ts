import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Person; Database Architecture
 * (Frozen v1) §2 — `person` table exactly as migrated in Milestone 2.
 * `name_variants` (jsonb) is intentionally not a form field here — it is
 * search-matching metadata (Search Architecture, Phase 3), not something
 * an Administrator hand-edits directly in V1.
 */
export const personDefinition: ResourceDefinition = {
  tableName: "person",
  label: "Person",
  labelPlural: "People",
  hasSlug: true,
  slugSourceField: "name_en",
  hasLifecycle: true,
  fields: [
    { name: "name", type: "bilingual-text", label: "Name", required: true },
    { name: "bio", type: "bilingual-textarea", label: "Biography" },
    { name: "is_featured", type: "boolean", label: "Featured" },
  ],
};
