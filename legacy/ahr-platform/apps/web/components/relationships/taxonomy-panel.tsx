"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/cms";
import { AISuggestionPanel } from "@/components/ai/ai-suggestion-panel";

/**
 * Implements: Wireframes/CMS.md — Edit Screens "status/lifecycle/
 * relationships panel (right, sticky)." Category/Tag assignment had a
 * complete, tested backend (packages/relationships' setCategoriesForEntity/
 * setTagsForEntity, and the /api/cms/{entityType}/{id}/taxonomy Route
 * Handler) but no UI anywhere — discovered while building the AI
 * Suggestion Panel (Gap Analysis & Remaining Work Report A2/E1), since a
 * category-tag suggestion needs somewhere real to be accepted into.
 *
 * Only rendered for "works"/"projects" (taxonomyEntityType) — the only
 * two entity types with a taxonomy join table (API Specification 03 -
 * CMS API, "Assign Taxonomy": every other entity type returns 404 here).
 */

interface TaxonomyOption {
  id: string;
  nameAr: string;
  nameEn: string;
  domain?: string;
}

export function TaxonomyPanel({
  taxonomyEntityType,
  entityId,
  domain,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
}: {
  taxonomyEntityType: "works" | "projects";
  entityId: string;
  /** The Category `domain` this entity type is restricted to (work_type | project_type). */
  domain: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
}) {
  const { show } = useToast();
  const [availableCategories, setAvailableCategories] = useState<TaxonomyOption[]>([]);
  const [availableTags, setAvailableTags] = useState<TaxonomyOption[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [categoriesRes, tagsRes, currentRes] = await Promise.all([
          fetch(`/api/cms/categories?status=published&pageSize=100`).then((r) => r.json()),
          fetch(`/api/cms/tags?status=published&pageSize=100`).then((r) => r.json()),
          fetch(`/api/cms/${taxonomyEntityType}/${entityId}/taxonomy`).then((r) => r.json()),
        ]);
        if (cancelled) return;

        const categories: TaxonomyOption[] = (categoriesRes.data ?? [])
          .filter((c: Record<string, unknown>) => c.domain === domain)
          .map((c: Record<string, unknown>) => ({
            id: String(c.id),
            nameAr: String(c.name_ar ?? ""),
            nameEn: String(c.name_en ?? ""),
            domain: String(c.domain),
          }));
        const tags: TaxonomyOption[] = (tagsRes.data ?? []).map((t: Record<string, unknown>) => ({
          id: String(t.id),
          nameAr: String(t.name_ar ?? ""),
          nameEn: String(t.name_en ?? ""),
        }));

        setAvailableCategories(categories);
        setAvailableTags(tags);
        setSelectedCategoryIds(currentRes.data?.categoryIds ?? []);
        setSelectedTagIds(currentRes.data?.tagIds ?? []);
      } catch {
        if (!cancelled) setError("Could not load categories and tags right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [taxonomyEntityType, entityId, domain]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const categories = selectedCategoryIds.map((id) => ({
        id,
        domain: availableCategories.find((c) => c.id === id)?.domain ?? domain,
      }));
      const response = await fetch(`/api/cms/${taxonomyEntityType}/${entityId}/taxonomy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories, tagIds: selectedTagIds }),
      });
      const body = await response.json();
      if (!response.ok || body.error) {
        setError(body.error?.message ?? "Could not save.");
        return;
      }
      show("success", "Categories & Tags saved.");
    } catch {
      setError("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const entityType = taxonomyEntityType === "works" ? "work" : "project";

  return (
    <div className="rounded-md border p-4">
      <h2 className="mb-3 text-sm font-semibold">Categories &amp; Tags</h2>

      {loading ? (
        <p className="text-xs text-neutral">Loading…</p>
      ) : (
        <>
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-neutral">Categories</p>
            {availableCategories.length === 0 ? (
              <p className="text-xs text-neutral">No categories exist for this domain yet.</p>
            ) : (
              <ul className="space-y-1">
                {availableCategories.map((c) => (
                  <li key={c.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(c.id)}
                        onChange={() => toggle(selectedCategoryIds, setSelectedCategoryIds, c.id)}
                      />
                      {c.nameEn || c.nameAr}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <AISuggestionPanel
              kind="category-tag-suggestion"
              fieldLabel="Categories & Tags"
              entityId={entityId}
              context={{
                entityType,
                titleAr,
                titleEn,
                descriptionAr,
                descriptionEn,
                existingCategories: selectedCategoryIds
                  .map((id) => availableCategories.find((c) => c.id === id)?.nameEn)
                  .filter((v): v is string => Boolean(v)),
                existingTags: selectedTagIds
                  .map((id) => availableTags.find((t) => t.id === id)?.nameEn)
                  .filter((v): v is string => Boolean(v)),
                availableCategories: availableCategories.map((c) => c.nameEn),
              }}
              onAccept={(content) => {
                if (!("categories" in content)) return;
                // Accept matches suggested names back to real category/tag
                // ids — a suggestion is a name, the field it's accepted
                // into needs an id, per Design Principles §4's "field
                // visibly updates on Accept... no separate confirmation."
                const matchedCategoryIds = content.categories
                  .map((name) => availableCategories.find((c) => c.nameEn === name)?.id)
                  .filter((v): v is string => Boolean(v));
                const matchedTagIds = content.tags
                  .map((name) => availableTags.find((t) => t.nameEn === name)?.id)
                  .filter((v): v is string => Boolean(v));
                setSelectedCategoryIds((current) =>
                  Array.from(new Set([...current, ...matchedCategoryIds])),
                );
                setSelectedTagIds((current) => Array.from(new Set([...current, ...matchedTagIds])));
              }}
            />
          </div>

          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-neutral">Tags</p>
            {availableTags.length === 0 ? (
              <p className="text-xs text-neutral">No tags exist yet.</p>
            ) : (
              <ul className="space-y-1">
                {availableTags.map((t) => (
                  <li key={t.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(t.id)}
                        onChange={() => toggle(selectedTagIds, setSelectedTagIds, t.id)}
                      />
                      {t.nameEn || t.nameAr}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error ? (
            <p role="alert" className="mb-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Categories & Tags"}
          </button>
        </>
      )}
    </div>
  );
}
