import type { SupabaseClient } from "@supabase/supabase-js";
import { genericList, type ResourceDefinition, type FilterParams } from "@ahr/cms-core";
import { mediaAssetDefinition, getMediaAccessUrl, SupabaseStorageAdapter } from "@ahr/media";

/**
 * Implements: item 1 of the 2026-07-21 "About page + My Account" work —
 * `media_asset` has no dedicated "this is the avatar" flag (no schema
 * change was made for this), so the convention used here is: the most
 * recently uploaded, published+public image owned by this person IS their
 * current photo — for both the public About page and the Dashboard's "My
 * Account" screen. Uploading a new photo naturally supersedes the old one
 * without needing a new column or a "set as avatar" action.
 */
export async function getPersonPhotoUrl(
  supabase: SupabaseClient,
  personId: string,
  options: { publicOnly?: boolean } = {},
): Promise<string | null> {
  const filters: FilterParams = { person_id: personId, media_type: "image" };
  if (options.publicOnly) {
    filters.status = "published";
    filters.visibility = "public";
  }

  const { data } = await genericList(
    mediaAssetDefinition as ResourceDefinition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page: 1, pageSize: 1 },
      filters,
      sort: { field: "created_at", direction: "desc" },
    },
  );

  const asset = data[0] as Record<string, unknown> | undefined;
  if (!asset) return null;

  const storage = new SupabaseStorageAdapter(supabase);
  return getMediaAccessUrl({ storage }, asset as never);
}
