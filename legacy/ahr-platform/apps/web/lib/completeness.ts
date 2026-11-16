import type { SupabaseClient } from "@supabase/supabase-js";
import { genericList, type ResourceDefinition } from "@ahr/cms-core";
import { ENTITY_DEFINITIONS, type EntityType } from "@ahr/content";
import { ENTITY_TYPE_TO_THUMBNAIL_OWNER, getOwnerIdsWithImage } from "./entity-thumbnails";

/**
 * Implements: Dashboard UX Enhancement Backlog #5 — "Completeness
 * Dashboard." Entity-agnostic by design (same "no per-entity knowledge"
 * discipline as `@ahr/cms-core`): it derives what "complete" means for a
 * resource entirely from its own `ResourceDefinition` — a required
 * `bilingual-text` field missing either language counts as an incomplete
 * translation; a resource type registered in `ENTITY_TYPE_TO_THUMBNAIL_OWNER`
 * (Person/Work/Project/Event — the only ones with any media relation at
 * all) counts as missing a photo if it has zero attached images. Adding a
 * new entity type or a new required bilingual field to `packages/content`
 * automatically gets picked up here with no change to this file.
 */

const LIST_PAGE_SIZE = 100;

export interface CompletenessIssue {
  id: string;
  label: string;
}

export interface EntityCompletenessReport {
  entityType: EntityType;
  label: string;
  totalRecords: number;
  missingTranslation: CompletenessIssue[];
  missingPhoto: CompletenessIssue[];
}

/** genericList caps pageSize at 100 (query.ts's MAX_PAGE_SIZE) — walk every page to get the full set for this report. */
async function fetchAllRows(
  definition: ResourceDefinition,
  supabase: SupabaseClient,
): Promise<Record<string, unknown>[]> {
  const first = await genericList(
    definition,
    { supabase: supabase as never, actorId: "" },
    { pagination: { page: 1, pageSize: LIST_PAGE_SIZE } },
  );
  const rows = [...first.data] as Record<string, unknown>[];

  for (let page = 2; page <= first.meta.totalPages; page++) {
    const next = await genericList(
      definition,
      { supabase: supabase as never, actorId: "" },
      { pagination: { page, pageSize: LIST_PAGE_SIZE } },
    );
    rows.push(...(next.data as Record<string, unknown>[]));
  }

  return rows;
}

function labelFor(row: Record<string, unknown>): string {
  return String(row.title_en ?? row.name_en ?? row.title_ar ?? row.name_ar ?? row.id);
}

export async function computeCompletenessReport(
  supabase: SupabaseClient,
): Promise<EntityCompletenessReport[]> {
  const reports: EntityCompletenessReport[] = [];

  for (const [entityType, definition] of Object.entries(ENTITY_DEFINITIONS) as Array<
    [EntityType, ResourceDefinition]
  >) {
    const rows = await fetchAllRows(definition, supabase);

    const requiredBilingualFields = definition.fields.filter(
      (field) => field.type === "bilingual-text" && field.required,
    );
    const missingTranslation: CompletenessIssue[] = rows
      .filter((row) =>
        requiredBilingualFields.some((field) => !row[`${field.name}_ar`] || !row[`${field.name}_en`]),
      )
      .map((row) => ({ id: String(row.id), label: labelFor(row) }));

    let missingPhoto: CompletenessIssue[] = [];
    const ownerType = ENTITY_TYPE_TO_THUMBNAIL_OWNER[entityType];
    if (ownerType && rows.length > 0) {
      const ids = rows.map((row) => String(row.id));
      const idsWithImage = await getOwnerIdsWithImage(supabase, ownerType, ids);
      missingPhoto = rows
        .filter((row) => !idsWithImage.has(String(row.id)))
        .map((row) => ({ id: String(row.id), label: labelFor(row) }));
    }

    reports.push({
      entityType,
      label: definition.labelPlural,
      totalRecords: rows.length,
      missingTranslation,
      missingPhoto,
    });
  }

  return reports;
}
