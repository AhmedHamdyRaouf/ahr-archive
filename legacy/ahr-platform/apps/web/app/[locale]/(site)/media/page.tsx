import type { Metadata } from "next";
import Image from "next/image";
import { genericList } from "@ahr/cms-core";
import { mediaAssetDefinition, getMediaAccessUrl, SupabaseStorageAdapter } from "@ahr/media";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/page-seo";
import { SiteBreadcrumbs, SiteEmptyState } from "@/components/site";

export async function generateMetadata({
  params,
}: {
  params: { locale: "ar" | "en" };
}): Promise<Metadata> {
  const seo = await buildPageMetadata(params.locale, `/${params.locale}/media`, {
    ar: "الوسائط",
    en: "Media",
  });
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonicalUrl },
  };
}

/** Implements: Sitemap (Phase 3) — Media. Published+public only, RLS-enforced. */
export default async function MediaPage({ params }: { params: { locale: "ar" | "en" } }) {
  const supabase = createRouteHandlerSupabaseClient();

  const { data: assets } = await genericList(
    mediaAssetDefinition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page: 1, pageSize: 24 },
      filters: { status: "published", visibility: "public" },
    },
  );

  const storage = new SupabaseStorageAdapter(supabase);
  const withUrls: Array<Record<string, unknown> & { accessUrl: string }> = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      accessUrl: await getMediaAccessUrl({ storage }, asset as never),
    })),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <SiteBreadcrumbs
        locale={params.locale}
        segments={[{ label: params.locale === "ar" ? "الوسائط" : "Media" }]}
      />
      <div className="p-4">
        {withUrls.length === 0 ? (
          <SiteEmptyState
            message={
              params.locale === "ar" ? "لا توجد وسائط منشورة بعد." : "No published media yet."
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {withUrls.map((asset) => (
              <figure key={String(asset.id)} className="rounded-md border p-2">
                {asset.media_type === "image" ? (
                  // Fixed per Phase 3 CTO Audit (Core Web Vitals): next/image
                  // instead of a raw <img>. Safe specifically on this page
                  // because the query above filters to visibility="public"
                  // only -- getMediaAccessUrl always resolves a "public"
                  // asset to a permanent Storage URL, never a short-lived
                  // signed URL, so there is no caching/expiry risk here
                  // (unlike an Administrator-only view that might show
                  // restricted/hidden assets via signed URLs).
                  <div className="relative h-32 w-full overflow-hidden rounded-md">
                    <Image
                      src={asset.accessUrl}
                      alt={String(
                        (params.locale === "ar" ? asset.caption_ar : asset.caption_en) ?? "",
                      )}
                      fill
                      sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-md bg-neutral/10 text-xs uppercase">
                    {String(asset.media_type)}
                  </div>
                )}
                <figcaption className="mt-1 text-xs text-neutral">
                  {String((params.locale === "ar" ? asset.caption_ar : asset.caption_en) ?? "")}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
