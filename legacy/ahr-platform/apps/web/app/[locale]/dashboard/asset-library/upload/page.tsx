import { requireCapability } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { ASSET_LIBRARY_SLOTS } from "@/lib/asset-library-registry";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { AssetUploadForm } from "./upload-form";

export default async function AssetLibraryUploadPage({ params }: { params: { locale: string } }) {
  await requireCapability(nextCookieAdapter(), "media-library:manage");

  // Which known slots (ASSET_LIBRARY_SLOTS) already have a row — image_key
  // is unique, so re-uploading under an already-used key would fail; the
  // form marks these instead of letting an Administrator hit that error.
  const supabase = createRouteHandlerSupabaseClient();
  const { data } = await supabase
    .from("media_library")
    .select("image_key")
    .in(
      "image_key",
      ASSET_LIBRARY_SLOTS.map((slot) => slot.key),
    );
  const usedKeys = (data ?? []).map((row) => row.image_key as string);

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs
        locale={params.locale}
        segments={[
          { label: "Asset Library", href: `/${params.locale}/dashboard/asset-library` },
          { label: "Upload" },
        ]}
      />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">Upload Asset</h1>
        <AssetUploadForm locale={params.locale} slots={ASSET_LIBRARY_SLOTS} usedKeys={usedKeys} />
      </div>
    </div>
  );
}
