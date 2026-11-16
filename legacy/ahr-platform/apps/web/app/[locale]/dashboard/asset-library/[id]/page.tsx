import { notFound } from "next/navigation";
import { requireCapability } from "@ahr/auth";
import { mediaLibraryDefinition, getAssetAccessUrl } from "@ahr/media-library";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { createMediaLibraryStorageAdapter } from "@/lib/media-library-storage";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { AssetEditForm } from "./edit-form";

export default async function AssetLibraryDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  await requireCapability(nextCookieAdapter(), "media-library:manage");

  const supabase = createRouteHandlerSupabaseClient();
  const { data, error } = await supabase
    .from(mediaLibraryDefinition.tableName)
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) notFound();

  const accessUrl = await getAssetAccessUrl(
    { storage: createMediaLibraryStorageAdapter() },
    data as never,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        locale={params.locale}
        segments={[
          { label: "Asset Library", href: `/${params.locale}/dashboard/asset-library` },
          { label: String(data.image_key) },
        ]}
      />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">{String(data.image_key)}</h1>
        <AssetEditForm locale={params.locale} record={data} accessUrl={accessUrl} />
      </div>
    </div>
  );
}
