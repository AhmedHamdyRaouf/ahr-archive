import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Award; Database Architecture
 * (Frozen v1) §2 — `award` table. `organization_id` is marked required
 * here (form-level), matching the database's own `not null` constraint —
 * "no award without a documented institutional source." No `public_id`:
 * Award does not have a slug column in the frozen schema (`hasSlug: false`).
 */
export const awardDefinition: ResourceDefinition = {
  tableName: "award",
  label: "Award",
  labelPlural: "Awards",
  hasSlug: false,
  hasLifecycle: true,
  fields: [
    { name: "title", type: "bilingual-text", label: "Title", required: true },
    { name: "description", type: "bilingual-textarea", label: "Description" },
    { name: "year", type: "number", label: "Year" },
    { name: "organization_id", type: "relation", label: "Granting Organization", required: true },
    { name: "person_id", type: "relation", label: "Recipient" },
  ],
};
