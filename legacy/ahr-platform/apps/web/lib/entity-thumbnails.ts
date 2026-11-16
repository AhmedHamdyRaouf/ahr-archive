import type { SupabaseClient } from "@supabase/supabase-js";
import { getMediaAccessUrl, SupabaseStorageAdapter } from "@ahr/media";

/**
 * Implements: Dashboard UX Enhancement Backlog #3 — "Visual row indicators
 * (thumbnail image / colored status icon)."
 *
 * `media_asset` has no scalar "cover photo" column on Person/Work/etc. —
 * it's a separate table with an owner column per type (see
 * `packages/content/src/media-relations.ts`'s own note on this). This
 * mirrors `apps/web/lib/person-photo.ts`'s "most recently uploaded image
 * IS the current photo" convention, but batched with a single `.in(...)`
 * query for an entire list page (up to 20 rows) instead of one query per
 * row — `genericList`'s query-builder abstraction has no `.in()`, so this
 * talks to the real Supabase client directly for this one read-only,
 * display-only lookup.
 */
export type ThumbnailOwnerType = "person" | "work" | "project" | "event";

const OWNER_COLUMN: Record<ThumbnailOwnerType, string> = {
  person: "person_id",
  work: "work_id",
  project: "project_id",
  event: "event_id",
};

export const ENTITY_TYPE_TO_THUMBNAIL_OWNER: Partial<Record<string, ThumbnailOwnerType>> = {
  persons: "person",
  works: "work",
  projects: "project",
  events: "event",
};

/**
 * Dashboard UX Enhancement Backlog #5 — "Completeness Dashboard." Returns
 * just the set of owner ids that have at least one attached image, using
 * the same single-`.in()`-query approach as `getThumbnailUrlsForOwners`
 * above, but without resolving any access URLs — the completeness report
 * only needs a yes/no per record, not a displayable image.
 */
export async function getOwnerIdsWithImage(
  supabase: SupabaseClient,
  ownerType: ThumbnailOwnerType,
  ownerIds: string[],
): Promise<Set<string>> {
  if (ownerIds.length === 0) return new Set();

  const ownerColumn = OWNER_COLUMN[ownerType];
  const { data, error } = await supabase
    .from("media_asset")
    .select(ownerColumn)
    .in(ownerColumn, ownerIds)
    .eq("media_type", "image");

  if (error || !data) return new Set();

  return new Set(
    (data as unknown as Record<string, unknown>[]).map((row) => String(row[ownerColumn])),
  );
}

export async function getThumbnailUrlsForOwners(
  supabase: SupabaseClient,
  ownerType: ThumbnailOwnerType,
  ownerIds: string[],
): Promise<Record<string, string>> {
  if (ownerIds.length === 0) return {};

  const ownerColumn = OWNER_COLUMN[ownerType];
  const { data, error } = await supabase
    .from("media_asset")
    .select("*")
    .in(ownerColumn, ownerIds)
    .eq("media_type", "image")
    .order("created_at", { ascending: false });

  if (error || !data) return {};

  // Most recently uploaded image per owner wins (same convention as
  // getPersonPhotoUrl) — first match per owner id, since results are
  // already ordered newest-first.
  const latestAssetByOwner = new Map<string, Record<string, unknown>>();
  for (const asset of data as Record<string, unknown>[]) {
    const ownerId = String(asset[ownerColumn]);
    if (!latestAssetByOwner.has(ownerId)) {
      latestAssetByOwner.set(ownerId, asset);
    }
  }

  const storage = new SupabaseStorageAdapter(supabase);
  const entries = await Promise.all(
    Array.from(latestAssetByOwner.entries()).map(async ([ownerId, asset]) => {
      try {
        const url = await getMediaAccessUrl({ storage }, asset as never);
        return [ownerId, url] as const;
      } catch {
        // A signed-URL failure for one row's thumbnail must not break the
        // whole list page — that row just renders with no thumbnail.
        return null;
      }
    }),
  );

  const result: Record<string, string> = {};
  for (const entry of entries) {
    if (entry) result[entry[0]] = entry[1];
  }
  return result;
}
