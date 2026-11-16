"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/cms";
import type { AssetLibrarySlot } from "@/lib/asset-library-registry";

const CUSTOM_KEY_VALUE = "__custom__";

/**
 * Implements: data owner request 2026-07-24 — "Upload image" screen for
 * the new, ownerless Asset Library. Unlike the Media Library upload form
 * (owner-entity picker required first), there is no owner concept here at
 * all — image_key is the only required identifier, and it's what other
 * pages will eventually reference this asset by.
 *
 * Updated 2026-07-25 (data owner request — "make uploading easier"): the
 * image_key field used to be a free-text input the Administrator had to
 * type from memory, exactly matching whatever key a page's code expects
 * (e.g. "about-hero-portrait") — easy to typo. It's now a dropdown of the
 * known, named slots (ASSET_LIBRARY_SLOTS), with a "Custom key…" option
 * that reveals the original free-text input for anything not in the list
 * yet. Slots that already have an asset are disabled here (image_key is
 * unique — a second upload under the same key would just fail) rather
 * than letting the Administrator hit that error.
 */
export function AssetUploadForm({
  locale,
  slots,
  usedKeys,
}: {
  locale: string;
  slots: AssetLibrarySlot[];
  usedKeys: string[];
}) {
  const router = useRouter();
  const { show } = useToast();

  const usedKeySet = useMemo(() => new Set(usedKeys), [usedKeys]);
  const slotsByPage = useMemo(() => {
    const groups = new Map<string, AssetLibrarySlot[]>();
    for (const slot of slots) {
      const group = groups.get(slot.page) ?? [];
      group.push(slot);
      groups.set(slot.page, group);
    }
    return groups;
  }, [slots]);

  const [selectedKey, setSelectedKey] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [altTextEn, setAltTextEn] = useState("");
  const [altTextAr, setAltTextAr] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [captionAr, setCaptionAr] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustom = selectedKey === CUSTOM_KEY_VALUE;
  const imageKey = (isCustom ? customKey : selectedKey).trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedKey) {
      setError("Choose an image slot below (or \"Custom key…\").");
      return;
    }
    if (!imageKey) {
      setError("image_key is required.");
      return;
    }
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("imageKey", imageKey);
    if (titleEn.trim()) formData.append("titleEn", titleEn.trim());
    if (titleAr.trim()) formData.append("titleAr", titleAr.trim());
    if (altTextEn.trim()) formData.append("altTextEn", altTextEn.trim());
    if (altTextAr.trim()) formData.append("altTextAr", altTextAr.trim());
    if (captionEn.trim()) formData.append("captionEn", captionEn.trim());
    if (captionAr.trim()) formData.append("captionAr", captionAr.trim());
    if (tags.trim()) formData.append("tags", tags.trim());

    try {
      const response = await fetch("/api/media-library", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error?.message ?? "Upload failed.");
      }
      show("success", "Asset uploaded.");
      router.push(`/${locale}/dashboard/asset-library`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label htmlFor="imageSlot" className="block text-sm font-medium">
          Image
        </label>
        <select
          id="imageSlot"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
        >
          <option value="" disabled>
            Choose where this image goes…
          </option>
          {Array.from(slotsByPage.entries()).map(([page, pageSlots]) => (
            <optgroup key={page} label={page}>
              {pageSlots.map((slot) => (
                <option key={slot.key} value={slot.key} disabled={usedKeySet.has(slot.key)}>
                  {slot.label}
                  {usedKeySet.has(slot.key) ? " (already uploaded)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={CUSTOM_KEY_VALUE}>Custom key…</option>
        </select>
        {usedKeySet.size > 0 ? (
          <p className="mt-1 text-xs text-neutral">
            Grayed-out images already have an upload — open it from the Asset Library list to edit
            or replace it instead.
          </p>
        ) : null}
      </div>

      {isCustom ? (
        <div>
          <label htmlFor="imageKey" className="block text-sm font-medium">
            Custom Image Key
          </label>
          <input
            id="imageKey"
            type="text"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="home-hero-banner"
            className="w-full rounded-md border p-2 text-sm"
          />
          <p className="mt-1 text-xs text-neutral">
            Lowercase letters, numbers, hyphens, or underscores only — how other pages will look
            this asset up.
          </p>
        </div>
      ) : null}

      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          File
        </label>
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

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
            Caption (English) — optional
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
            Caption (Arabic) — optional
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
          Tags — optional, comma-separated
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="hero, home, banner"
          className="w-full rounded-md border p-2 text-sm"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
}
