import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog, Relationship Model, Data Integrity Rules
 * (Phase 4) — Contribution; Database Architecture (Frozen v1) §2 — the
 * core Person↔Work/Project/Event link. `role` options copied verbatim
 * from `chk_contribution_role`. At least one of work/project/event must
 * be set — enforced in `../business-rules.ts` (same "OR across optional
 * relations" pattern as Press Mention's exactly-one-subject rule).
 */
export const contributionDefinition: ResourceDefinition = {
  tableName: "contribution",
  label: "Contribution",
  labelPlural: "Contributions",
  hasSlug: false,
  hasLifecycle: true,
  fields: [
    { name: "person_id", type: "relation", label: "Person", required: true },
    { name: "work_id", type: "relation", label: "Work" },
    { name: "project_id", type: "relation", label: "Project" },
    { name: "event_id", type: "relation", label: "Event" },
    {
      name: "role",
      type: "select",
      label: "Role",
      required: true,
      options: [
        "composer",
        "arranger",
        "producer",
        "lyricist",
        "singer",
        "director",
        "music_director",
        "conductor",
        "performer",
      ],
    },
    { name: "role_detail", type: "bilingual-text", label: "Role Detail" },
    { name: "credit_order", type: "number", label: "Credit Order" },
    { name: "source_notes", type: "textarea", label: "Source Notes" },
  ],
};
