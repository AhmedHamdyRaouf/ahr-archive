import type { ResourceDefinition } from "@ahr/cms-core";

/**
 * Implements: data owner request 2026-07-25 — the `external_platform`
 * catalog (Facebook, Spotify, Anghami, ...). Rides `@ahr/cms-core`'s
 * generic engine exactly like `category`/`tag` — no bespoke CRUD code,
 * same reasoning those two already establish. `hasLifecycle: false`
 * because this table deliberately has no status/visibility/
 * verification_status columns (see the migration's own header comment —
 * kept minimal, no editorial workflow for a platform definition).
 *
 * `category` is a plain "text" field here too (not "select" with fixed
 * `options`) — it's a free-text column at the database level specifically
 * so new categories (podcast, marketplace, ticketing, ...) never require
 * a migration; giving it a fixed `options` list here would silently
 * reintroduce that constraint at the form-validation layer.
 */
export const externalPlatformDefinition: ResourceDefinition = {
  tableName: "external_platform",
  label: "External Platform",
  labelPlural: "External Platforms",
  hasSlug: false,
  hasLifecycle: false,
  fields: [
    { name: "name", type: "text", label: "Name", required: true },
    { name: "slug", type: "text", label: "Slug", required: true },
    { name: "category", type: "text", label: "Category", required: true },
    { name: "icon", type: "text", label: "Icon" },
    { name: "website", type: "text", label: "Website" },
    { name: "display_order", type: "number", label: "Display Order" },
    { name: "is_active", type: "boolean", label: "Active" },
  ],
};
