import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: Entity Catalog (Phase 4) — Media; Database Architecture
 * (Frozen v1) §2/§11 — `media_asset` table. Feeds `@ahr/cms-core`'s
 * generic engine so lifecycle transitions (Milestone 6 §"File lifecycle")
 * reuse the exact same, already-tested Draft→Review→Verified→Published→
 * Archived graph as every other entity — no separate media-specific
 * lifecycle implementation.
 *
 * `media_type`/`storage_path`/owner columns are NOT exposed here as
 * user-editable form fields — they are set by the upload/service layer
 * (`service.ts`), never hand-edited after creation (Milestone 6 doesn't
 * ask for re-parenting an asset to a different owner, and doing so safely
 * would need its own dedicated validation this milestone doesn't specify).
 * Only the caption fields are user-editable metadata, per
 * docs/blocked-metadata.md §4.
 */
export const mediaAssetDefinition: ResourceDefinition = {
  tableName: "media_asset",
  label: "Media Asset",
  labelPlural: "Media Assets",
  hasSlug: false,
  hasLifecycle: true,
  fields: [{ name: "caption", type: "bilingual-text", label: "Caption" }],
};
