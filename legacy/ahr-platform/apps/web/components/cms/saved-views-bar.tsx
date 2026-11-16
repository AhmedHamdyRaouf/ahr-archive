"use client";

import { useEffect, useState } from "react";

/**
 * Dashboard UX Enhancement Backlog #9 — "Saved Views." Persists a named
 * filter/sort combination (the list page's query string) for one-click
 * return, scoped per entity type.
 *
 * Stored in `localStorage`, not a new database table: this is a
 * single-administrator tool (Database Architecture §7 — `platform_user`'s
 * `role` check constraint only has one value today), so there is no
 * multi-user "whose saved view is this" question a server-side table
 * would need to answer, and no existing per-user preferences column to
 * attach it to without a schema change. The tradeoff is real and worth
 * naming: a saved view lives in one browser only, not synced across
 * devices — acceptable for now, and moving this server-side later is a
 * contained follow-up if that ever becomes a problem, not a redesign.
 */
export interface SavedView {
  id: string;
  name: string;
  query: string;
}

function loadViews(storageKey: string): SavedView[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

function persistViews(storageKey: string, views: SavedView[]): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(views));
  } catch {
    // Saved views are a convenience, not critical data — a full/blocked
    // localStorage must not break the rest of the list page.
  }
}

export function SavedViewsBar({
  entityType,
  currentQuery,
  onApply,
}: {
  entityType: string;
  currentQuery: string;
  onApply: (query: string) => void;
}) {
  const storageKey = `ahr-saved-views:${entityType}`;
  const [views, setViews] = useState<SavedView[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // localStorage isn't available during server rendering — load after
  // mount, and render nothing until then, rather than risk a
  // server/client markup mismatch.
  useEffect(() => {
    setViews(loadViews(storageKey));
    setHydrated(true);
  }, [storageKey]);

  if (!hydrated) return null;

  const saveCurrentView = () => {
    const name = nameInput.trim();
    if (!name) return;
    const next = [
      ...views.filter((view) => view.name !== name),
      { id: crypto.randomUUID(), name, query: currentQuery },
    ];
    setViews(next);
    persistViews(storageKey, next);
    setNameInput("");
  };

  const deleteView = (id: string) => {
    const next = views.filter((view) => view.id !== id);
    setViews(next);
    persistViews(storageKey, next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b p-4 text-sm">
      <span className="text-xs text-neutral">Saved views:</span>
      {views.length === 0 ? (
        <span className="text-xs text-neutral">None yet</span>
      ) : (
        views.map((view) => (
          <span
            key={view.id}
            className="flex items-center gap-1 rounded-full border px-2 py-0.5"
          >
            <button
              type="button"
              onClick={() => onApply(view.query)}
              className="text-primary underline"
            >
              {view.name}
            </button>
            <button
              type="button"
              onClick={() => deleteView(view.id)}
              aria-label={`Delete saved view ${view.name}`}
              className="text-neutral hover:text-danger"
            >
              ✕
            </button>
          </span>
        ))
      )}
      <input
        type="text"
        placeholder="Save current view as…"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saveCurrentView();
          }
        }}
        className="rounded-md border p-1 text-xs"
      />
      <button
        type="button"
        onClick={saveCurrentView}
        disabled={!nameInput.trim()}
        className="rounded-md border px-2 py-1 text-xs disabled:opacity-50"
      >
        Save current view
      </button>
    </div>
  );
}
