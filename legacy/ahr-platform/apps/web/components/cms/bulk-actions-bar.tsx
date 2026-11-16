"use client";

/**
 * Implements: Milestone 4's selection framework, now wired to real
 * operations (Dashboard UX Enhancement Backlog #1). Provides the SELECTION
 * mechanism and the bar that appears once rows are selected. `actions` is
 * supplied by the entity list's Client Component
 * (`apps/web/.../cms/[entityType]/list-client.tsx`), which calls
 * `/api/cms/[entityType]/bulk` for real publish/archive operations — this
 * component itself stays entity-agnostic and knows nothing about what an
 * action actually does.
 */
export interface BulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
}

export function BulkActionsBar({
  selectedIds,
  actions,
  onClearSelection,
}: {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
}) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center justify-between border-b bg-neutral/10 p-3">
      <span className="text-sm">{selectedIds.length} selected</span>
      <div className="flex gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => action.onClick(selectedIds)}
            className="rounded-md border p-2 text-sm"
          >
            {action.label}
          </button>
        ))}
        <button type="button" onClick={onClearSelection} className="text-sm text-neutral">
          Clear
        </button>
      </div>
    </div>
  );
}
