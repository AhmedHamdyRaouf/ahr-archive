import type { ResourceDefinition } from "@ahr/cms-core";

/** Implements: Entity Catalog (Phase 4) — Event; Database Architecture (Frozen v1) §2 — `event` table. */
export const eventDefinition: ResourceDefinition = {
  tableName: "event",
  label: "Event",
  labelPlural: "Events",
  hasSlug: true,
  slugSourceField: "title_en",
  hasLifecycle: true,
  fields: [
    { name: "title", type: "bilingual-text", label: "Title", required: true },
    { name: "event_date", type: "date", label: "Date" },
    { name: "location", type: "bilingual-text", label: "Location" },
    { name: "description", type: "bilingual-textarea", label: "Description" },
    { name: "organization_id", type: "relation", label: "Organization" },
  ],
};
