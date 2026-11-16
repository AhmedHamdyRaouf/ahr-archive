/**
 * Implements: Entity Catalog (Phase 4) — Work's self-reference
 * (`parent_work_id`, `work_relationship`) for compound works (e.g. a song
 * that is part of an album).
 */

import type { RelationshipQueryClient } from "./types";

export interface WorkSummary {
  id: string;
  title_ar: string;
  title_en: string;
  parent_work_id: string | null;
  work_relationship: string | null;
}

/** The direct child Works of a given parent Work (e.g. every track of an album). */
export async function getChildWorks(
  client: RelationshipQueryClient,
  parentWorkId: string,
): Promise<WorkSummary[]> {
  const { data, error } = await client.from("work").select("*").eq("parent_work_id", parentWorkId);
  if (error) {
    throw new Error(`Failed to query child works of "${parentWorkId}": ${error.message}`);
  }
  return (data ?? []) as WorkSummary[];
}

/**
 * Walks `parent_work_id` upward from a given Work to its root ancestor,
 * guarding against a cycle (Packages Specification Package 04 §18 flags
 * multi-hop `parent_work_id` cycles as something Archive's code must
 * reject, not just the direct-self-reference `chk_work_parent_not_self`
 * constraint — this walk is the read-side complement: if a cycle ever
 * slipped through, this function fails loudly rather than looping forever).
 */
export async function getWorkAncestors(
  client: RelationshipQueryClient,
  workId: string,
  maxDepth = 20,
): Promise<WorkSummary[]> {
  const ancestors: WorkSummary[] = [];
  const visited = new Set<string>([workId]);
  let currentId: string | null = workId;

  for (let depth = 0; depth < maxDepth; depth++) {
    const { data, error } = await client.from("work").select("*").eq("id", currentId);
    if (error) {
      throw new Error(`Failed to walk work ancestors from "${workId}": ${error.message}`);
    }
    const current = (data ?? [])[0] as WorkSummary | undefined;
    if (!current || !current.parent_work_id) break;

    if (visited.has(current.parent_work_id)) {
      throw new Error(
        `Detected a parent_work_id cycle while walking ancestors of "${workId}" ` +
          `(re-encountered "${current.parent_work_id}"). This should never happen if ` +
          `chk_work_parent_not_self and code-level cycle checks (Packages Specification ` +
          `Package 04 §18) are both enforced at write time.`,
      );
    }

    const { data: parentData, error: parentError } = await client
      .from("work")
      .select("*")
      .eq("id", current.parent_work_id);
    if (parentError) {
      throw new Error(
        `Failed to fetch parent work "${current.parent_work_id}": ${parentError.message}`,
      );
    }
    const parent = (parentData ?? [])[0] as WorkSummary | undefined;
    if (!parent) break;

    ancestors.push(parent);
    visited.add(parent.id);
    currentId = parent.id;
  }

  return ancestors;
}
