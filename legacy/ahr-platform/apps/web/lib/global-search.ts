import type { SupabaseClient } from "@supabase/supabase-js";
import { genericList } from "@ahr/cms-core";
import { ENTITY_DEFINITIONS, type EntityType } from "@ahr/content";

/**
 * Implements: Dashboard UX Enhancement Backlog #10 — "Global Search." One
 * search box across every registered entity type, instead of searching
 * one entity list at a time. Reuses `genericList`'s existing free-text
 * `search`/`searchFields` support (query.ts) — the same mechanism each
 * entity list's own search box already uses — just run once per entity
 * type instead of once for the current list only.
 */
export interface GlobalSearchGroup {
  entityType: EntityType;
  label: string;
  results: Array<{ id: string; label: string }>;
  totalMatches: number;
}

const RESULTS_PER_ENTITY = 5;

function labelFor(row: Record<string, unknown>): string {
  return String(row.title_en ?? row.name_en ?? row.title_ar ?? row.name_ar ?? row.id);
}

export async function performGlobalSearch(
  supabase: SupabaseClient,
  query: string,
): Promise<GlobalSearchGroup[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const groups = await Promise.all(
    (Object.entries(ENTITY_DEFINITIONS) as Array<[EntityType, (typeof ENTITY_DEFINITIONS)[EntityType]]>).map(
      async ([entityType, definition]) => {
        const searchFields = definition.fields
          .filter((field) => field.type === "bilingual-text")
          .flatMap((field) => [`${field.name}_ar`, `${field.name}_en`]);

        // A resource with no bilingual-text field (e.g. Contribution) has
        // nothing meaningful for a free-text search to match against —
        // genericList's `.or(...)` filter needs at least one field.
        if (searchFields.length === 0) {
          return { entityType, label: definition.labelPlural, results: [], totalMatches: 0 };
        }

        const result = await genericList(
          definition,
          { supabase: supabase as never, actorId: "" },
          {
            pagination: { page: 1, pageSize: RESULTS_PER_ENTITY },
            search: trimmed,
            searchFields,
          },
        );

        return {
          entityType,
          label: definition.labelPlural,
          results: (result.data as Record<string, unknown>[]).map((row) => ({
            id: String(row.id),
            label: labelFor(row),
          })),
          totalMatches: result.meta.totalItems,
        };
      },
    ),
  );

  return groups.filter((group) => group.totalMatches > 0);
}
