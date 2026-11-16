import type { SupabaseClient } from "@supabase/supabase-js";
import { getAssetAccessUrl, type MediaLibraryAssetRecord } from "@ahr/media-library";
import { createMediaLibraryStorageAdapter } from "./media-library-storage";

export interface ResolvedAsset {
  url: string;
  altTextAr: string | null;
  altTextEn: string | null;
  focalX: number;
  focalY: number;
}

/**
 * Public, read-only lookup for Asset Library images by their stable
 * `image_key` — this is the mechanism other pages reference a reusable
 * design asset by (Asset Library infrastructure, built 2026-07-24; first
 * consumer wired up 2026-07-25 on /about). Explicitly filters to
 * published+public here (not relying on RLS alone) — same "publicOnly"
 * posture `lib/person-photo.ts` takes, so a logged-in Administrator
 * browsing the public site still only ever sees what a real visitor sees,
 * never a draft asset via their own elevated RLS access.
 */
export async function getPublicAssetsByKeys(
  supabase: SupabaseClient,
  imageKeys: readonly string[],
): Promise<Record<string, ResolvedAsset>> {
  if (imageKeys.length === 0) return {};

  const { data, error } = await supabase
    .from("media_library")
    .select("*")
    .in("image_key", imageKeys as string[])
    .eq("status", "published")
    .eq("visibility", "public");

  if (error) {
    // Public pages must never break because an asset lookup failed —
    // same "degrade gracefully" posture as getPublicSiteSettings: callers
    // fall back to their existing placeholder.
    // eslint-disable-next-line no-console
    console.error("[asset-library] failed to read media_library:", error.message);
    return {};
  }

  const storage = createMediaLibraryStorageAdapter();
  const resolved: Record<string, ResolvedAsset> = {};

  await Promise.all(
    ((data ?? []) as MediaLibraryAssetRecord[]).map(async (asset) => {
      resolved[asset.image_key] = {
        url: await getAssetAccessUrl({ storage }, asset),
        altTextAr: asset.alt_text_ar,
        altTextEn: asset.alt_text_en,
        focalX: asset.focal_x,
        focalY: asset.focal_y,
      };
    }),
  );

  return resolved;
}
