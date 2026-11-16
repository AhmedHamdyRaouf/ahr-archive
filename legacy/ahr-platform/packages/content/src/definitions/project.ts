import type { ResourceDefinition } from "@ahr/cms-core";

/** Implements: Entity Catalog (Phase 4) — Project; Database Architecture (Frozen v1) §2 — `project` table. */
export const projectDefinition: ResourceDefinition = {
  tableName: "project",
  label: "Project",
  labelPlural: "Projects",
  hasSlug: true,
  slugSourceField: "title_en",
  hasLifecycle: true,
  fields: [
    { name: "title", type: "bilingual-text", label: "Title", required: true },
    {
      name: "project_type",
      type: "select",
      label: "Project Type",
      required: true,
      options: ["training", "jury", "cultural", "educational", "choir_direction", "initiative"],
    },
    { name: "description", type: "bilingual-textarea", label: "Description" },
    { name: "organization_id", type: "relation", label: "Organization" },
  ],
};
