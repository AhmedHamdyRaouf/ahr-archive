/**
 * Implements: Milestone 4 — "Revision-ready architecture (without
 * implementing revisions if schema is not ready)."
 *
 * The Frozen v1 Database Architecture has `entity_state_transition`
 * (records STATUS history — Draft→Review→...) but no table recording full
 * CONTENT revisions (e.g. "what did this Work's description_en look like
 * before this edit"). No such table exists in the frozen schema, and this
 * milestone must not add one (Non-Negotiable Rule #4).
 *
 * This module defines the seam a future revision system plugs into,
 * without persisting anything today — mirrors how Database Architecture
 * §11.1 documented Media Versioning as a seam before building it.
 */

export interface RevisionSnapshot {
  tableName: string;
  recordId: string;
  /** The full record state at the time of the write — shape is generic. */
  snapshot: Record<string, unknown>;
  changedBy: string;
  changedAt: string; // ISO 8601
}

export interface RevisionAdapter {
  /** Called after every successful create/update, before the caller's promise resolves. */
  recordRevision(snapshot: RevisionSnapshot): Promise<void>;
}

/**
 * Default adapter — does nothing. Used everywhere until a real revision
 * table/adapter exists. Swapping this for a real implementation later is a
 * one-line change at the call site that constructs the repository (see
 * repository.ts), not a rewrite of every entity's code.
 */
export class NoOpRevisionAdapter implements RevisionAdapter {
  async recordRevision(_snapshot: RevisionSnapshot): Promise<void> {
    // Deliberately empty. No schema exists to write to (see file header).
  }
}
