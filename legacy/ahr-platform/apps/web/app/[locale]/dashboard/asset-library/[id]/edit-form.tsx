"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAllowedNextStatuses, type EntityStatus } from "@ahr/cms-core";
import { useToast, ConfirmDialog, ForceDeleteDialog } from "@/components/cms";

interface AssetRecord {
  id: string;
  image_key: string;
  storage_path: string;
  status: string;
  visibility: string;
  width: number | null;
  height: number | null;
  tags: string[] | null;
  title_en: string | null;
  title_ar: string | null;
  alt_text_en: string | null;
  alt_text_ar: string | null;
  caption_en: string | null;
  caption_ar: string | null;
  focal_x: number;
  focal_y: number;
}

/**
 * Implements: data owner request 2026-07-24 — "Edit image information",
 * "Delete image", "Preview image" for the Asset Library. Status controls
 * reuse @ahr/cms-core's shared lifecycle graph (same rule every other CMS
 * entity follows) — an asset only becomes publicly usable elsewhere once
 * it reaches published + visibility=public (this migration's RLS policy).
 */
export function AssetEditForm({
  locale,
  record,
  accessUrl,
}: {
  locale: string;
  record: AssetRecord;
  accessUrl: string;
}) {
  const router = useRouter();
  const { show } = useToast();

  const [titleEn, setTitleEn] = useState(record.title_en ?? "");
  const [titleAr, setTitleAr] = useState(record.title_ar ?? "");
  const [altTextEn, setAltTextEn] = useState(record.alt_text_en ?? "");
  const [altTextAr, setAltTextAr] = useState(record.alt_text_ar ?? "");
  const [captionEn, setCaptionEn] = useState(record.caption_en ?? "");
  const [captionAr, setCaptionAr] = useState(record.caption_ar ?? "");
  const [tags, setTags] = useState((record.tags ?? []).join(", "));
  const [visibility, setVisibility] = useState(record.visibility);
  const [focalX, setFocalX] = useState(record.focal_x);
  const [focalY, setFocalY] = useState(record.focal_y);
  const [saving, setSaving] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStatus = (record.status as EntityStatus) ?? "draft";
  const allowedNext = getAllowedNextStatuses(currentStatus);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/media-library/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn,
          titleAr,
          altTextEn,
          altTextAr,
          captionEn,
          captionAr,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
          visibility,
          focalX,
          focalY,
        }),
      });
      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error?.message ?? "Save failed.");
      }
      show("success", "Asset updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTransition(toStatus: EntityStatus) {
    setTransitioning(true);
    setError(null);
    try {
      const response = await fetch(`/api/media-library/${record.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStatus, toStatus }),
      });
      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error?.message ?? "Status change failed.");
      }
      show("success", `Status changed to ${toStatus}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status change failed.");
    } finally {
      setTransitioning(false);
    }
  }

  async function handleDelete() {
    setDeleteConfirmOpen(false);
    try {
      const response = await fetch(
        `/api/media-library/${record.id}?currentStatus=${encodeURIComponent(currentStatus)}&storagePath=${encodeURIComponent(record.storage_path)}`,
        { method: "DELETE" },
      );
      if (!response.ok && response.status !== 204) {
        const body = await response.json();
        throw new Error(body.error?.message ?? "Delete failed.");
      }
      show(
        "success",
        currentStatus === "draft" ? "Asset deleted." : "Asset archived.",
      );
      router.push(`/${locale}/dashboard/asset-library`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  function handleFocalPointPick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocalX(Math.min(100, Math.max(0, x)));
    setFocalY(Math.min(100, Math.max(0, y)));
  }

  async function performForceDelete() {
    try {
      const response = await fetch(`/api/media-library/${record.id}/force-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: record.storage_path }),
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json();
        throw new Error(body.error?.message ?? "Permanent delete failed.");
      }
      show("success", "Asset permanently deleted.");
      router.push(`/${locale}/dashboard/asset-library`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Permanent delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <div
            onClick={handleFocalPointPick}
            className="relative h-64 w-64 cursor-crosshair overflow-hidden rounded-md border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={accessUrl}
              alt={altTextEn || altTextAr || record.image_key}
              className="h-full w-full object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/80 shadow"
              style={{ left: `${focalX}%`, top: `${focalY}%` }}
            />
          </div>
          <p className="mt-1 max-w-64 text-xs text-neutral">
            Click anywhere on the image to set the crop focus point — controls what stays visible
            when this image is cropped inside a frame elsewhere on the site. Save to apply.
          </p>
        </div>
        <div className="space-y-1 text-sm text-neutral">
          <p>
            Status: <span className="font-medium text-foreground">{currentStatus}</span>
          </p>
          <p>
            Visibility: <span className="font-medium text-foreground">{visibility}</span>
          </p>
          {record.width && record.height ? (
            <p>
              Dimensions: {record.width}×{record.height}
            </p>
          ) : null}
          <p className="break-all">Storage path: {record.storage_path}</p>
        </div>
      </div>

      {allowedNext.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {allowedNext.map((next) => (
            <button
              key={next}
              type="button"
              disabled={transitioning}
              onClick={() => handleTransition(next)}
              className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Move to {next}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="max-w-lg space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="titleEn" className="block text-sm font-medium">
              Title (English)
            </label>
            <input
              id="titleEn"
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="titleAr" className="block text-sm font-medium">
              Title (Arabic)
            </label>
            <input
              id="titleAr"
              type="text"
              dir="rtl"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="altTextEn" className="block text-sm font-medium">
              Alt Text (English)
            </label>
            <input
              id="altTextEn"
              type="text"
              value={altTextEn}
              onChange={(e) => setAltTextEn(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="altTextAr" className="block text-sm font-medium">
              Alt Text (Arabic)
            </label>
            <input
              id="altTextAr"
              type="text"
              dir="rtl"
              value={altTextAr}
              onChange={(e) => setAltTextAr(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="captionEn" className="block text-sm font-medium">
              Caption (English)
            </label>
            <input
              id="captionEn"
              type="text"
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="captionAr" className="block text-sm font-medium">
              Caption (Arabic)
            </label>
            <input
              id="captionAr"
              type="text"
              dir="rtl"
              value={captionAr}
              onChange={(e) => setCaptionAr(e.target.value)}
              className="w-full rounded-md border p-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium">
            Tags — comma-separated
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-medium">
            Visibility
          </label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
          >
            <option value="hidden">Hidden</option>
            <option value="restricted">Restricted</option>
            <option value="public">Public</option>
          </select>
          <p className="mt-1 text-xs text-neutral">
            Must be Public (and Status must be Published) for this asset to appear on the public
            site.
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="rounded-md border border-danger px-4 py-2 text-sm text-danger"
          >
            Delete
          </button>
        </div>
      </form>

      <div className="m-4 rounded-md border border-danger/40 p-4">
        <h2 className="text-sm font-semibold text-danger">Danger Zone</h2>
        <p className="mt-1 text-xs text-neutral">
          Permanently deletes this asset AND its Storage file — unlike the Delete button above
          (which archives once published), this cannot be undone from the dashboard.
        </p>
        <button
          type="button"
          onClick={() => setForceDeleteOpen(true)}
          className="mt-3 rounded-md border border-danger px-3 py-1.5 text-sm text-danger"
        >
          Delete Permanently
        </button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={currentStatus === "draft" ? "Delete this asset?" : "Archive this asset?"}
        description={
          currentStatus === "draft"
            ? "This asset was never published — it will be permanently removed, file included."
            : "This asset will be archived (no hard delete). Its file stays in Storage and it will no longer be publicly readable."
        }
        confirmLabel={currentStatus === "draft" ? "Delete" : "Archive"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <ForceDeleteDialog
        open={forceDeleteOpen}
        entityLabel="Asset"
        expectedText={record.image_key}
        onCancel={() => setForceDeleteOpen(false)}
        onConfirm={performForceDelete}
      />
    </div>
  );
}
