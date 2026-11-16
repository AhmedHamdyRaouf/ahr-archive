"use client";

import { useState } from "react";

/**
 * Implements: data owner decision, 2026-07-25 — "Delete Permanently."
 * Distinct from `ConfirmDialog` (used for archive/publish/restore):
 * genuinely irreversible from the dashboard, so a single click is not
 * enough — the Administrator must type the record's own identifying text
 * exactly before the button enables at all.
 */
export function ForceDeleteDialog({
  open,
  entityLabel,
  expectedText,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  /** e.g. "Work", "Person", "Asset" — used in the warning copy. */
  entityLabel: string;
  /** The exact text the Administrator must type (record's title/name/key). */
  expectedText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");

  if (!open) return null;

  const matches = typed.trim().length > 0 && typed.trim() === expectedText;

  function reset() {
    setTyped("");
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-sm space-y-4 rounded-md bg-white p-6">
        <h2 className="text-lg font-semibold text-danger">Delete {entityLabel} Permanently</h2>
        <p className="text-sm text-neutral">
          This permanently removes this {entityLabel.toLowerCase()} from the database — unlike
          Archive, this cannot be undone from the dashboard. A backup snapshot is kept, but
          restoring it requires a direct database action.
        </p>
        <p className="text-sm">
          Type <strong className="break-all">{expectedText}</strong> to confirm:
        </p>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              reset();
              onCancel();
            }}
            className="rounded-md border p-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={() => {
              reset();
              onConfirm();
            }}
            className="rounded-md bg-danger p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
