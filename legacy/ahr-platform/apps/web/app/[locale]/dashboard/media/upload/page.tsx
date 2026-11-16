import { requireCapability } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { MediaUploadForm } from "./upload-form";

/**
 * Implements: Wireframes/Media-Library.md — Upload screen (Gap Analysis
 * & Remaining Work Report A1/E2). The underlying POST /api/media
 * endpoint, storage adapter, and lifecycle (Milestone 6) were already
 * complete and tested; this page and its form are the only missing
 * piece — a UI entry point for that already-working backend.
 */
export default async function MediaUploadPage({ params }: { params: { locale: string } }) {
  await requireCapability(nextCookieAdapter(), "media:manage");

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs
        locale={params.locale}
        segments={[
          { label: "Media Library", href: `/${params.locale}/dashboard/media` },
          { label: "Upload" },
        ]}
      />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">Upload Media</h1>
        <MediaUploadForm locale={params.locale} />
      </div>
    </div>
  );
}
