"use client";

/**
 * Implements: Milestone 4 — Confirmation Dialogs; UI/UX Specification,
 * Design System §"Dialogs" ("reserved for confirmation of consequential
 * actions... never used for routine forms").
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-sm space-y-4 rounded-md bg-white p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-neutral">{description}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border p-2">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? "rounded-md bg-danger p-2 text-white"
                : "rounded-md bg-primary p-2 text-white"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
