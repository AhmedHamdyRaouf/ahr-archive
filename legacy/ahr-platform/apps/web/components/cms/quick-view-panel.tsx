"use client";

import type { ResourceDefinition } from "@ahr/cms-core";
import { DetailView } from "./detail-view";

/**
 * Dashboard UX Enhancement Backlog #7 — "Quick View panel." Opens a
 * record's details alongside the table instead of navigating to a
 * separate page — reuses the already-existing, entity-agnostic
 * `DetailView` (Milestone 4) rather than building a second read-only
 * layout. The row data needed is already on the client: `genericList`
 * selects `*`, so every field the entity list fetched for the table is
 * already present on the clicked row — no extra request for this panel.
 */
export function QuickViewPanel({
  definition,
  record,
  onClose,
  onEditFull,
}: {
  definition: ResourceDefinition;
  record: Record<string, unknown>;
  onClose: () => void;
  onEditFull: () => void;
}) {
  return (
    <>
      {/* Backdrop — clicking it closes the panel, same as pressing Escape. */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label={`${definition.label} quick view`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l bg-white p-4 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{definition.label}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="rounded-md p-1 text-neutral hover:bg-neutral/10"
          >
            ✕
          </button>
        </div>

        <DetailView definition={definition} record={record} />

        <button
          type="button"
          onClick={onEditFull}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-white"
        >
          Open full record →
        </button>
      </aside>
    </>
  );
}
