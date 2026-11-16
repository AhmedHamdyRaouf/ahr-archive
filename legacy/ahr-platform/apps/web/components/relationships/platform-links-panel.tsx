"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/cms";

/**
 * Implements: data owner request 2026-07-25 — the CMS-side UI for the
 * external-platforms system: attach platforms to Person/Organization/
 * Project/Work, reorder them, show/hide, edit URLs. Same shape/style as
 * `TaxonomyPanel` (the closest existing precedent — attaching related
 * lookup rows to an entity from its edit screen).
 */

interface PlatformOption {
  id: string;
  name: string;
  category: string;
}

interface PlatformLink {
  id: string;
  platform_id: string;
  url: string;
  display_order: number;
  is_visible: boolean;
}

export function PlatformLinksPanel({
  entityType,
  entityId,
}: {
  entityType: "persons" | "organizations" | "projects" | "works";
  entityId: string;
}) {
  const { show } = useToast();
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [links, setLinks] = useState<PlatformLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPlatformId, setNewPlatformId] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [platformsRes, linksRes] = await Promise.all([
        fetch(`/api/cms/external-platforms?pageSize=100`).then((r) => r.json()),
        fetch(`/api/cms/${entityType}/${entityId}/platform-links`).then((r) => r.json()),
      ]);
      const activePlatforms: PlatformOption[] = (platformsRes.data ?? [])
        .filter((p: Record<string, unknown>) => p.is_active !== false)
        .map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: String(p.name),
          category: String(p.category),
        }));
      setPlatforms(activePlatforms);
      setLinks((linksRes.data ?? []) as PlatformLink[]);
    } catch {
      setError("Could not load platform links right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  const attachedPlatformIds = new Set(links.map((link) => link.platform_id));
  const availableToAdd = platforms.filter((p) => !attachedPlatformIds.has(p.id));

  function platformName(platformId: string): string {
    return platforms.find((p) => p.id === platformId)?.name ?? platformId;
  }

  async function handleAdd() {
    if (!newPlatformId || !newUrl.trim()) {
      setError("Choose a platform and enter a URL.");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      const response = await fetch(`/api/cms/${entityType}/${entityId}/platform-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId: newPlatformId, url: newUrl.trim() }),
      });
      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error?.message ?? "Could not add platform link.");
      }
      setNewPlatformId("");
      setNewUrl("");
      show("success", "Platform link added.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add platform link.");
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdate(linkId: string, input: { url?: string; isVisible?: boolean }) {
    try {
      const response = await fetch(
        `/api/cms/${entityType}/${entityId}/platform-links/${linkId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error?.message ?? "Could not save.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  async function handleRemove(linkId: string) {
    try {
      const response = await fetch(
        `/api/cms/${entityType}/${entityId}/platform-links/${linkId}`,
        { method: "DELETE" },
      );
      if (!response.ok && response.status !== 204) {
        const body = await response.json();
        throw new Error(body.error?.message ?? "Could not remove.");
      }
      show("success", "Platform link removed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove.");
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const reordered = [...links];
    const a = reordered[index];
    const b = reordered[target];
    if (!a || !b) return;
    reordered[index] = b;
    reordered[target] = a;
    setLinks(reordered);

    try {
      const response = await fetch(
        `/api/cms/${entityType}/${entityId}/platform-links`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: reordered.map((l) => l.id) }),
        },
      );
      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error?.message ?? "Could not reorder.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reorder.");
      await load(); // revert to server state on failure
    }
  }

  return (
    <div className="rounded-md border p-4">
      <h2 className="mb-3 text-sm font-semibold">External Platforms</h2>

      {loading ? (
        <p className="text-xs text-neutral">Loading…</p>
      ) : (
        <>
          {links.length === 0 ? (
            <p className="mb-3 text-xs text-neutral">No platform links yet.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {links.map((link, index) => (
                <li key={link.id} className="flex items-center gap-2 rounded-md border p-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="text-xs disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === links.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="text-xs disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{platformName(link.platform_id)}</p>
                    <input
                      type="text"
                      defaultValue={link.url}
                      onBlur={(e) => {
                        if (e.target.value !== link.url) {
                          handleUpdate(link.id, { url: e.target.value });
                        }
                      }}
                      className="mt-1 w-full rounded-md border p-1 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-1 text-xs text-neutral">
                    <input
                      type="checkbox"
                      checked={link.is_visible}
                      onChange={(e) => handleUpdate(link.id, { isVisible: e.target.checked })}
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemove(link.id)}
                    className="rounded-md border border-danger px-2 py-1 text-xs text-danger"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-end gap-2 border-t pt-3">
            <div>
              <label htmlFor="newPlatformId" className="block text-xs font-medium">
                Platform
              </label>
              <select
                id="newPlatformId"
                value={newPlatformId}
                onChange={(e) => setNewPlatformId(e.target.value)}
                className="rounded-md border p-1.5 text-sm"
              >
                <option value="">Choose…</option>
                {availableToAdd.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="newUrl" className="block text-xs font-medium">
                URL
              </label>
              <input
                id="newUrl"
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md border p-1.5 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
