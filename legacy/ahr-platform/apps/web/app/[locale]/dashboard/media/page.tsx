import { requireCapability } from "@ahr/auth";
import Link from "next/link";
import { genericList } from "@ahr/cms-core";
import { mediaAssetDefinition, getMediaAccessUrl, SupabaseStorageAdapter } from "@ahr/media";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EmptyState } from "@/components/cms";
import { MediaAssetCard } from "./media-asset-card";

/**
 * Implements: 06-Dashboard.md (Media Library nav item); Package 08 - Media
 * Library. Added: Phase 3 CTO Audit (Admin Dashboard Verification) — the
 * upload pipeline, storage adapter, and lifecycle (Milestone 6) and the
 * /api/media Route Handlers have existed since Milestone 6, and the
 * Sidebar already linked here, but no page rendered them.
 *
 * Upload UI added: Gap Analysis & Remaining Work Report A1/E2 — the
 * Upload button below links to the now-implemented upload screen
 * (Wireframes/Media-Library.md), closing the gap this file's own
 * comment previously tracked as Backlog.
 *
 * Unlike the public Media page (which filters to visibility="public" and
 * therefore only ever resolves permanent public URLs), this view shows
 * every status/visibility an Administrator is allowed to see, so some
 * thumbnails here do use short-lived signed URLs (getMediaAccessUrl's
 * documented branch for non-public assets) — expected and fine for an
 * Administrator-only, non-cached view.
 */
export default async function DashboardMediaPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string };
}) {
  await requireCapability(nextCookieAdapter(), "media:manage");
  const supabase = createRouteHandlerSupabaseClient();
  const page = Number(searchParams.page ?? "1") || 1;

  const result = await genericList(
    mediaAssetDefinition,
    { supabase: supabase as never, actorId: "" },
    { pagination: { page, pageSize: 24 } },
  );

  const storage = new SupabaseStorageAdapter(supabase);
  const withUrls: Array<Record<string, unknown> & { accessUrl: string }> = await Promise.all(
    result.data.map(async (asset) => ({
      ...asset,
      accessUrl: await getMediaAccessUrl({ storage }, asset as never),
    })),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Media Library" }]} />
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Media Library</h1>
          <Link
            href={`/${params.locale}/dashboard/media/upload`}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-white"
          >
            Upload
          </Link>
        </div>

        {withUrls.length === 0 ? (
          <EmptyState label="No media assets yet." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {withUrls.map((asset) => (
              <MediaAssetCard
                key={String(asset.id)}
                id={String(asset.id)}
                storagePath={String(asset.storage_path)}
                accessUrl={asset.accessUrl}
                mediaType={String(asset.media_type)}
                caption={String(asset.caption_en ?? asset.caption_ar ?? "")}
                status={String(asset.status)}
              />
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-neutral">
          Page {result.meta.page} of {result.meta.totalPages} ({result.meta.totalItems} total)
        </p>
      </div>
    </div>
  );
}
