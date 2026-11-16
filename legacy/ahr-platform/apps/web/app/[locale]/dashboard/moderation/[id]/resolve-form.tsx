"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAllowedNextModerationStatuses, type ModerationStatus } from "@ahr/workflow";
import { useToast } from "@/components/cms";

/**
 * Added: Phase 3 CTO Audit (Admin Dashboard Verification). Posts to the
 * already-existing, already-tested `/api/moderation-reports/[id]/transition`
 * Route Handler (07-API.md §10's "one consistent action shape" —
 * POST .../transition, never a raw PATCH to a status field) rather than
 * duplicating transitionModerationReport's validation client-side.
 */
export function ModerationResolveForm({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: ModerationStatus;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [toStatus, setToStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allowedNext = getAllowedNextModerationStatuses(currentStatus);

  if (allowedNext.length === 0) {
    return <p className="text-sm text-neutral">This report is resolved — no further action.</p>;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!toStatus) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/moderation-reports/${reportId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStatus,
          toStatus,
          resolutionNotes: resolutionNotes || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok || body.error) {
        show("error", body.error?.message ?? "Failed to update report.");
        return;
      }
      show("success", `Report moved to "${toStatus}".`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const requiresNotes = toStatus === "resolved";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-md border p-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="toStatus">
          Move to
        </label>
        <select
          id="toStatus"
          value={toStatus}
          onChange={(event) => setToStatus(event.target.value)}
          className="w-full rounded-md border p-2 text-sm"
        >
          <option value="">Select next status…</option>
          {allowedNext.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {requiresNotes ? (
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="resolutionNotes">
            Resolution notes (required to resolve)
          </label>
          <textarea
            id="resolutionNotes"
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            className="w-full rounded-md border p-2 text-sm"
            rows={3}
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!toStatus || submitting}
        className="rounded-md bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}
