/**
 * Implements: Milestone 7 — Relationships & Metadata. Shared types used
 * across this package's relationship/metadata services. All record shapes
 * here mirror the Frozen v1 Database Architecture exactly (Milestone 2
 * migrations) — no field is invented.
 */

import type { QueryBuilderLike } from "@ahr/cms-core";

/**
 * The minimal client surface every read-only query function in this
 * package needs: `from(table).select(columns).eq(field, value)`,
 * returning `@ahr/cms-core`'s own thenable `QueryBuilderLike` — the same
 * type every other package in this project already builds mocks for, so
 * this package's tests reuse that established pattern rather than
 * inventing a new one.
 */
export interface RelationshipQueryClient {
  from(table: string): {
    select(columns: string): QueryBuilderLike;
  };
}

/**
 * Adds write access (insert/delete) for join-table services
 * (taxonomy-service.ts). Declared as one self-contained interface, not an
 * extension of `RelationshipQueryClient` — combining two interfaces that
 * each redeclare `from()` with a different return shape doesn't type-check
 * in TypeScript (the same issue hit and fixed in Milestone 5's
 * `ContentServiceClient`), so this interface simply lists everything it
 * needs directly.
 */
export interface RelationshipWriteClient {
  from(table: string): {
    select(columns: string): QueryBuilderLike;
    insert(rows: Record<string, unknown>[]): Promise<{ error: { message: string } | null }>;
    delete(): {
      eq(field: string, value: unknown): Promise<{ error: { message: string } | null }>;
    };
  };
}

export interface WorkCategoryLink {
  work_id: string;
  category_id: string;
}

export interface WorkTagLink {
  work_id: string;
  tag_id: string;
}

export interface ProjectCategoryLink {
  project_id: string;
  category_id: string;
}

export interface ProjectTagLink {
  project_id: string;
  tag_id: string;
}

export interface EntityStateTransitionRecord {
  id: string;
  entity_table: string;
  entity_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string;
  changed_at: string;
  reason: string | null;
}

/** The shared metadata fields Data Foundation Conventions §6 puts on every content table. */
export interface EntityMetadata {
  status: string;
  visibility: string;
  verification_status: string;
  source: string | null;
  owner_id: string | null;
}
