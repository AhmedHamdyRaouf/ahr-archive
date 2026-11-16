/**
 * Implements: Archive Model, Data Lifecycle (Phase 4) — `entity_state_transition`,
 * the shared append-only history log (Milestone 2). Never exposed as a
 * read service until now — every entity's lifecycle transitions
 * (Milestone 4/5/6) have been WRITING to this table all along; this
 * module is the first to READ it back.
 */

import type { RelationshipQueryClient, EntityStateTransitionRecord } from "./types";

/** The full status-transition history for a given entity, oldest first. */
export async function getStateHistory(
  client: RelationshipQueryClient,
  entityTable: string,
  entityId: string,
): Promise<EntityStateTransitionRecord[]> {
  const { data, error } = await client
    .from("entity_state_transition")
    .select("*")
    .eq("entity_table", entityTable)
    .eq("entity_id", entityId);

  if (error) {
    throw new Error(
      `Failed to read state history for ${entityTable}="${entityId}": ${error.message}`,
    );
  }

  const rows = (data ?? []) as EntityStateTransitionRecord[];
  // Oldest first — a history reads naturally top-to-bottom as "what happened, in order."
  return [...rows].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime(),
  );
}

/** Convenience: just the current status, derived from the most recent transition (rather than a second query against the entity's own table). */
export async function getCurrentStatusFromHistory(
  client: RelationshipQueryClient,
  entityTable: string,
  entityId: string,
): Promise<string | null> {
  const history = await getStateHistory(client, entityTable, entityId);
  if (history.length === 0) return null;
  return history[history.length - 1]?.to_status ?? null;
}
