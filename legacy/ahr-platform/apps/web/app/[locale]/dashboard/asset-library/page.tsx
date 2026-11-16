import { requireCapability } from "@ahr/auth";
import Link from "next/link";
import { genericList } from "@ahr/cms-core";
import { mediaLibraryDefinition, getAssetAccessUrl } from "@ahr/media-library";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaLibraryStorageAdapter } from "@/lib/media-library-storage";
import { nextCookieAdapter } from "@/lib/cookies";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EmptyState } from "@/components/cms";

/**
 * Asset Library — general-purpose, reusable design/UI assets (media_library
 * table). Deliberately a separate page/nav item from "Media Library"
 * (media_asset, entity-owned) — see packages/media-library/README.md for
 * why these are two different systems.
 *
 * Infrastructure only: this page is not linked from any public/other
 * dashboard page yet, per the data owner's explicit request 2026-07-24.
 */
export default async function AssetLibraryPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string; q?: string };
}) {
  await requireCapability(nextCookieAdapter(), "media-library:manage");
  const supabase = createRouteHandlerSupabaseClient();
  const page = Number(searchParams.page ?? "1") || 1;
  const query = searchParams.q?.trim() ?? "";

  const result = await genericList(
    mediaLibraryDefinition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page, pageSize: 24 },
      search: query.length > 0 ? query : undefined,
      searchFields: query.length > 0 ? ["image_key", "title_en", "title_ar"] : undefined,
    },
  );

  const storage = createMediaLibraryStorageAdapter();
  const withUrls: Array<Record<string, unknown> & { accessUrl: string }> = await Promise.all(
    result.data.map(async (asset) => ({
      ...asset,
      accessUrl: await getAssetAccessUrl({ storage }, asset as never),
    })),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Asset Library" }]} />
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Asset Library</h1>
          <Link
            href={`/${params.locale}/dashboard/asset-library/upload`}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-white"
          >
            Upload
          </Link>
        </div>

        <form method="get" className="mb-4 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by image key or title…"
            className="w-full max-w-sm rounded-md border p-2 text-sm"
          />
          <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
            Search
          </button>
        </form>

        {withUrls.length === 0 ? (
          <EmptyState
            label={query ? `No assets match "${query}".` : "No assets yet."}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {withUrls.map((asset) => (
              <Link
                key={String(asset.id)}
                href={`/${params.locale}/dashboard/asset-library/${asset.id}`}
                className="block rounded-md border p-2"
              >
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.accessUrl}
                    alt={String(asset.alt_text_en ?? asset.alt_text_ar ?? "")}
                    className="h-32 w-full rounded-md object-cover"
                  />
                  <figcaption className="mt-1 flex items-center justify-between gap-1 text-xs text-neutral">
                    <span className="truncate" title={String(asset.image_key)}>
                      {String(asset.image_key)}
                    </span>
                    <span className="shrink-0 rounded-full bg-neutral/20 px-2 py-0.5">
                      {String(asset.status)}
                    </span>
                  </figcaption>
                </figure>
              </Link>
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
