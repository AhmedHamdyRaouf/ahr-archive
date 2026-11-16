import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Organization; Database
 * Architecture (Frozen v1) §2 — `organization` table exactly as migrated
 * in Milestone 2. Contact information / notes / tags / categories are
 * intentionally NOT fields here — Packages Specification Package 05 §13
 * documented that no supporting column/table exists for them in the
 * Frozen v1 schema; this definition only exposes what actually exists.
 */
export const organizationDefinition: ResourceDefinition = {
  tableName: "organization",
  label: "Organization",
  labelPlural: "Organizations",
  hasSlug: true,
  slugSourceField: "name_en",
  hasLifecycle: true,
  fields: [
    { name: "name", type: "bilingual-text", label: "Name", required: true },
    { name: "description", type: "bilingual-textarea", label: "Description" },
  ],
};
