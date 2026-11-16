/**
 * Implements: data owner request 2026-07-25 — the reusable external-
 * platforms system, `entity_external_link` side (attaching/listing/
 * reordering an entity's links to `external_platform` rows). Same reason
 * this lives here as `taxonomy-service.ts`: it's a relationship between a
 * content entity and another table, which is exactly this package's
 * responsibility — not `@ahr/content` (that package owns entity CRUD, not
 * cross-table relationship services) and not a new package (there is no
 * reason this needs its own storage/validation abstraction the way, say,
 * `@ahr/media` did for Storage).
 *
 * Unlike `work_category`/`work_tag`, `entity_external_link` has its own
 * `id` and no composite PK — it goes through `@ahr/cms-core`'s generic
 * engine directly (`genericList`/`genericCreate`/`genericUpdate`/
 * `genericHardDelete`) with `hasLifecycle: false`, exactly like
 * `external_platform` itself. `genericHardDelete`'s "only from draft"
 * guard is conditioned on `hasLifecycle` — false here, so it's a no-op
 * check and a plain delete goes through, which is correct: a link row has
 * no status/publication lifecycle of its own to protect (Data Lifecycle's
 * "No Hard Delete" principle is about published *content*, not a join-
 * shaped row that mirrors work_category's already-hard-deletable pattern).
 */

import {
  genericList,
  genericCreate,
  genericUpdate,
  genericHardDelete,
  type ResourceDefinition,
  type RepositoryContext,
  type SupabaseLikeClient,
} from "@ahr/cms-core";

export type PlatformLinkOwnerType = "person" | "organization" | "project" | "work";

const OWNER_COLUMN: Record<PlatformLinkOwnerType, string> = {
  person: "person_id",
  organization: "organization_id",
  project: "project_id",
  work: "work_id",
};

export function ownerTypeToColumn(ownerType: PlatformLinkOwnerType): string {
  return OWNER_COLUMN[ownerType];
}

/**
 * `platform_id` and the four owner columns are deliberately NOT listed as
 * form fields — set once at creation via the owner-scoped functions below,
 * never hand-edited afterward (same reasoning `media_asset`'s definition
 * excludes `storage_path`/owner columns).
 */
const entityExternalLinkDefinition: ResourceDefinition = {
  tableName: "entity_external_link",
  label: "Platform Link",
  labelPlural: "Platform Links",
  hasSlug: false,
  hasLifecycle: false,
  fields: [
    { name: "url", type: "text", label: "URL", required: true },
    { name: "display_order", type: "number", label: "Display Order" },
    { name: "is_visible", type: "boolean", label: "Visible" },
  ],
};

export interface PlatformLinkRecord {
  id: string;
  platform_id: string;
  url: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  person_id: string | null;
  organization_id: string | null;
  project_id: string | null;
  work_id: string | null;
}

export class PlatformLinkValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PlatformLinkValidationError";
    this.code = code;
  }
}

/** Lists an entity's platform links, ordered for display. */
export async function listPlatformLinksForEntity(
  supabase: SupabaseLikeClient,
  ownerType: PlatformLinkOwnerType,
  ownerId: string,
): Promise<PlatformLinkRecord[]> {
  const result = await genericList<PlatformLinkRecord>(
    entityExternalLinkDefinition,
    { supabase, actorId: "" },
    {
      pagination: { page: 1, pageSize: 100 },
      filters: { [ownerTypeToColumn(ownerType)]: ownerId },
      sort: { field: "display_order", direction: "asc" },
    },
  );
  return result.data;
}

/**
 * Attaches a platform to an entity. `chk_entity_external_link_owner_present`
 * and the four partial unique indexes (one per owner type) are the real
 * enforcement — this just turns their violation into a clearer error than
 * a raw Postgres message, same posture every other package in this
 * project takes ("validated in code first" for a clearer error).
 */
export async function createPlatformLink(
  supabase: SupabaseLikeClient,
  actorId: string,
  ownerType: PlatformLinkOwnerType,
  ownerId: string,
  input: { platformId: string; url: string; displayOrder?: number; isVisible?: boolean },
): Promise<PlatformLinkRecord> {
  const repoCtx: RepositoryContext = { supabase, actorId };
  const row: Record<string, unknown> = {
    [ownerTypeToColumn(ownerType)]: ownerId,
    platform_id: input.platformId,
    url: input.url,
  };
  if (input.displayOrder !== undefined) row.display_order = input.displayOrder;
  if (input.isVisible !== undefined) row.is_visible = input.isVisible;

  try {
    return await genericCreate<PlatformLinkRecord>(entityExternalLinkDefinition, repoCtx, row);
  } catch (error) {
    throw mapDuplicateError(error);
  }
}

export async function updatePlatformLink(
  supabase: SupabaseLikeClient,
  actorId: string,
  linkId: string,
  input: { url?: string; displayOrder?: number; isVisible?: boolean },
): Promise<PlatformLinkRecord> {
  const repoCtx: RepositoryContext = { supabase, actorId };
  const row: Record<string, unknown> = {};
  if (input.url !== undefined) row.url = input.url;
  if (input.displayOrder !== undefined) row.display_order = input.displayOrder;
  if (input.isVisible !== undefined) row.is_visible = input.isVisible;

  return genericUpdate<PlatformLinkRecord>(entityExternalLinkDefinition, repoCtx, linkId, row);
}

/** Removes a platform link outright — see file header for why a plain delete is correct here. */
export async function removePlatformLink(
  supabase: SupabaseLikeClient,
  actorId: string,
  linkId: string,
): Promise<void> {
  const repoCtx: RepositoryContext = { supabase, actorId };
  await genericHardDelete(entityExternalLinkDefinition, repoCtx, linkId, "n/a");
}

/** Persists a new display order for a set of links (drag-reorder) — one update per link, fine at this scale (a handful of links per entity). */
export async function reorderPlatformLinks(
  supabase: SupabaseLikeClient,
  actorId: string,
  orderedLinkIds: readonly string[],
): Promise<void> {
  const repoCtx: RepositoryContext = { supabase, actorId };
  await Promise.all(
    orderedLinkIds.map((id, index) =>
      genericUpdate(entityExternalLinkDefinition, repoCtx, id, { display_order: index }),
    ),
  );
}

function mapDuplicateError(error: unknown): unknown {
  const message = error instanceof Error ? error.message : String(error);
  if (/duplicate key|unique constraint/i.test(message)) {
    return new PlatformLinkValidationError(
      "DUPLICATE_PLATFORM",
      "This platform is already linked to this entity.",
    );
  }
  return error;
}
