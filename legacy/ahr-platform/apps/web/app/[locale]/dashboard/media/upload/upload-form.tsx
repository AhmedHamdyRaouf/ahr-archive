"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/cms";
import { OwnerPicker, type OwnerSelection } from "@/components/media/owner-picker";

/**
 * Implements: Wireframes/Media-Library.md — Upload screen.
 * "Upload: [Owner entity picker] → [File input] → [Progress]" and the
 * UX Rule: "Owner selection happens before or alongside file selection,
 * never as an afterthought — prevents orphaned, unowned uploads."
 * State Coverage Required: Loading (upload progress), Error (upload
 * failure → retry, no orphaned record; unsupported type rejected before
 * upload begins), Success (Toast; new asset appears immediately).
 *
 * Backend: POST /api/media (Milestone 6, already tested) — this
 * component is a new client for an already-complete, already-tested
 * endpoint; no backend change was made or needed.
 *
 * Dashboard UX Enhancement Backlog #6 — "Bulk Media Upload." The file
 * input now accepts multiple files for ONE selected owner, uploaded one
 * request at a time (sequential, not parallel — deliberately: this same
 * `/api/media` endpoint is also used by the single-file flow and was
 * never designed or load-tested for a burst of concurrent uploads; a
 * simple loop is not a compromise here, since a real bottleneck would
 * be Storage upload bandwidth either way). Each file gets its own
 * pass/fail outcome — one bad file in a batch of twenty must not lose
 * the nineteen good ones, matching the same "partial success" principle
 * `bulkTransitionEntityStatus` already established for bulk CMS actions.
 * A shared caption (if entered) applies to every file in the batch —
 * per-file captions would need a small table UI this milestone doesn't
 * build; the Administrator can still edit any asset's caption
 * individually afterward from the Media Library.
 */
export function MediaUploadForm({ locale }: { locale: string }) {
  const router = useRouter();
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [owner, setOwner] = useState<OwnerSelection | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [captionEn, setCaptionEn] = useState("");
  const [captionAr, setCaptionAr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileResults, setFileResults] = useState<
    Record<string, "pending" | "uploading" | "done" | "error">
  >({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  // The file input is disabled until an owner is selected — this is the
  // wireframe's rule enforced at the UI level, not just documented.
  const ownerSelected = owner !== null;

  function handleFileChange(selected: FileList | null) {
    setError(null);
    setFiles(selected ? Array.from(selected) : []);
    setFileResults({});
    setFileErrors({});
  }

  async function uploadOneFile(file: File, owner: OwnerSelection): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ownerType", owner.ownerType);
    formData.append("ownerId", owner.ownerId);
    if (captionEn.trim()) formData.append("captionEn", captionEn.trim());
    if (captionAr.trim()) formData.append("captionAr", captionAr.trim());

    const response = await fetch("/api/media", { method: "POST", body: formData });
    const body = await response.json();
    if (!response.ok || body.error) {
      throw new Error(body.error?.message ?? "Upload failed.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!owner) {
      setError("Select an owner before uploading.");
      return;
    }
    if (files.length === 0) {
      setError("Choose at least one file to upload.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const initialResults: Record<string, "pending" | "uploading" | "done" | "error"> = {};
    for (const file of files) initialResults[file.name] = "pending";
    setFileResults(initialResults);
    setFileErrors({});

    let successCount = 0;
    for (const file of files) {
      setFileResults((prev) => ({ ...prev, [file.name]: "uploading" }));
      try {
        await uploadOneFile(file, owner);
        setFileResults((prev) => ({ ...prev, [file.name]: "done" }));
        successCount += 1;
      } catch (err) {
        setFileResults((prev) => ({ ...prev, [file.name]: "error" }));
        setFileErrors((prev) => ({
          ...prev,
          [file.name]: err instanceof Error ? err.message : "Upload failed.",
        }));
      }
    }

    setSubmitting(false);

    if (successCount === files.length) {
      show("success", `${successCount} file(s) uploaded.`);
      setFiles([]);
      setCaptionEn("");
      setCaptionAr("");
      setOwner(null);
      setFileResults({});
      setFileErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.push(`/${locale}/dashboard/media`);
      router.refresh();
    } else if (successCount > 0) {
      show("success", `${successCount} of ${files.length} file(s) uploaded.`);
      router.refresh();
    } else {
      setError("None of the selected files could be uploaded. See details below.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <OwnerPicker value={owner} onChange={setOwner} />

      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          File(s)
        </label>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          multiple
          disabled={!ownerSelected}
          onChange={(e) => handleFileChange(e.target.files)}
          className="w-full rounded-md border p-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        {!ownerSelected ? (
          <p className="mt-1 text-xs text-neutral">Select an owner above before choosing files.</p>
        ) : null}
        {files.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between gap-2">
                <span>{file.name}</span>
                <span
                  className={
                    fileResults[file.name] === "done"
                      ? "text-xs text-success"
                      : fileResults[file.name] === "error"
                        ? "text-xs text-danger"
                        : fileResults[file.name] === "uploading"
                          ? "text-xs text-neutral"
                          : "text-xs text-neutral"
                  }
                >
                  {fileResults[file.name] === "done"
                    ? "Uploaded"
                    : fileResults[file.name] === "error"
                      ? (fileErrors[file.name] ?? "Failed")
                      : fileResults[file.name] === "uploading"
                        ? "Uploading…"
                        : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <label htmlFor="captionEn" className="block text-sm font-medium">
          Caption (English) — optional{files.length > 1 ? ", applies to every file" : ""}
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
          Caption (Arabic) — optional{files.length > 1 ? ", applies to every file" : ""}
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

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {submitting ? <p className="text-sm text-neutral">Uploading…</p> : null}

      <button
        type="submit"
        disabled={submitting || !ownerSelected || files.length === 0}
        className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Uploading…"
          : files.length > 1
            ? `Upload ${files.length} files`
            : "Upload"}
      </button>
    </form>
  );
}
