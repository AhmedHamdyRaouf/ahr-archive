import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Press; Database Architecture
 * (Frozen v1) §2 — `press_mention` table. `url` here is this milestone's
 * "External Links" coverage — the only external-link-shaped column that
 * actually exists in the Frozen v1 schema (a standalone `external_link`
 * entity does not exist and is not invented here — see the note flagged
 * at the start of this milestone). Exactly one of person/work/event/
 * organization must be set — enforced in `../business-rules.ts`, not
 * expressible as a plain `required` field here (it's an OR across four
 * optional relation fields).
 */
export const pressMentionDefinition: ResourceDefinition = {
  tableName: "press_mention",
  label: "Press Mention",
  labelPlural: "Press Mentions",
  hasSlug: false,
  hasLifecycle: true,
  fields: [
    { name: "title", type: "bilingual-text", label: "Title" },
    { name: "publication_name", type: "text", label: "Publication Name", required: true },
    { name: "url", type: "text", label: "URL" },
    { name: "published_date", type: "date", label: "Published Date" },
    { name: "person_id", type: "relation", label: "About Person" },
    { name: "work_id", type: "relation", label: "About Work" },
    { name: "event_id", type: "relation", label: "About Event" },
    { name: "organization_id", type: "relation", label: "About Organization" },
  ],
};
