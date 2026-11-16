"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast, ForceDeleteDialog } from "@/components/cms";

interface MediaAssetCardProps {
  id: string;
  storagePath: string;
  accessUrl: string;
  mediaType: string;
  caption: string;
  status: string;
}

/**
 * Implements: data owner decision, 2026-07-25 — "Delete Permanently" for
 * Media Library (media_asset). This system has no per-item edit page
 * (Milestone 6 only ever built the grid + upload screens), so the danger-
 * zone action lives directly on each grid card instead of a dedicated
 * edit screen — same `ForceDeleteDialog` component the CMS edit screen
 * and Asset Library use.
 */
export function MediaAssetCard({
  id,
  storagePath,
  accessUrl,
  mediaType,
  caption,
  status,
}: MediaAssetCardProps) {
  const router = useRouter();
  const { show } = useToast();
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);

  async function performForceDelete() {
    try {
      const response = await fetch(`/api/media/${id}/force-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath }),
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json();
        throw new Error(body.error?.message ?? "Permanent delete failed.");
      }
      show("success", "Media permanently deleted.");
      router.refresh();
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Permanent delete failed.");
    }
  }

  return (
    <figure className="rounded-md border p-2">
      {mediaType === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={accessUrl} alt={caption} className="h-32 w-full rounded-md object-cover" />
      ) : (
        <div className="flex h-32 items-center justify-center rounded-md bg-neutral/10 text-xs uppercase">
          {mediaType}
        </div>
      )}
      <figcaption className="mt-1 flex items-center justify-between text-xs text-neutral">
        <span>{caption || "—"}</span>
        <span className="rounded-full bg-neutral/20 px-2 py-0.5">{status}</span>
      </figcaption>
      <button
        type="button"
        onClick={() => setForceDeleteOpen(true)}
        className="mt-2 w-full rounded-md border border-danger px-2 py-1 text-xs text-danger"
      >
        Delete Permanently
      </button>

      <ForceDeleteDialog
        open={forceDeleteOpen}
        entityLabel="Media"
        expectedText={caption || id}
        onCancel={() => setForceDeleteOpen(false)}
        onConfirm={performForceDelete}
      />
    </figure>
  );
}
