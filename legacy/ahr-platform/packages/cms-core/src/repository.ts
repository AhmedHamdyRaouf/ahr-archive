/**
 * Implements: Milestone 4 — Generic CRUD framework, Draft/Published
 * workflow, Soft Delete support, Restore support.
 *
 * Entity-agnostic: takes a ResourceDefinition + a minimal Supabase-like
 * client, and performs list/get/create/update/transition/archive/restore
 * against whatever table the ResourceDefinition names. Contains no
 * knowledge of any specific business entity (Work, Person, etc.) — a
 * future business package supplies the ResourceDefinition and calls these
 * functions; it does not reimplement them.
 */

import type { ResourceDefinition, ListQueryParams, ListResult, PaginationMeta } from "./types";
import { assertValidResource, assertValidPartialResource } from "./validation";
import {
  applyListQuery,
  buildPaginationMeta,
  normalizePagination,
  type QueryBuilderLike,
} from "./query";
import { assertValidTransition, isStatus, type EntityStatus } from "./status";
import { NoOpRevisionAdapter, type RevisionAdapter } from "./revision";

export interface SupabaseLikeClient {
  from(table: string): {
    select(columns: string, options?: { count?: "exact"; head?: boolean }): QueryBuilderLike;
    insert(row: Record<string, unknown>): {
      select(columns?: string): {
        single(): Promise<{
          data: Record<string, unknown> | null;
          error: { message: string } | null;
        }>;
      };
    };
    update(row: Record<string, unknown>): {
      eq(
        field: string,
        value: unknown,
      ): {
        select(columns?: string): {
          single(): Promise<{
            data: Record<string, unknown> | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
    delete(): {
      eq(field: string, value: unknown): Promise<{ error: { message: string } | null }>;
    };
  };
}

export interface RepositoryContext {
  supabase: SupabaseLikeClient;
  /** Resolved actor performing the write — for created_by/updated_by (Database Architecture §9). */
  actorId: string;
  revisionAdapter?: RevisionAdapter;
}

export class NotFoundError extends Error {
  constructor(table: string, id: string) {
    super(`NOT_FOUND — no row in "${table}" with id "${id}".`);
    this.name = "NotFoundError";
  }
}

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}

/** Thrown when a permanent delete is rejected because another row still references this one (existing ON DELETE RESTRICT foreign keys). */
export class ForceDeleteBlockedError extends Error {
  constructor(table: string, dbMessage: string) {
    super(
      `Cannot permanently delete this "${table}" row — other records still reference it. ` +
        `Remove or reassign those first. (${dbMessage})`,
    );
    this.name = "ForceDeleteBlockedError";
  }
}

/** Implements: API Specification 03 - CMS API, "List Entities." */
export async function genericList<T = Record<string, unknown>>(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  params: ListQueryParams,
): Promise<ListResult<T>> {
  const pagination = normalizePagination(params.pagination);

  const builder = ctx.supabase.from(definition.tableName).select("*", { count: "exact" });
  const withQuery = applyListQuery(builder, { ...params, pagination });

  const { data, count, error } = await withQuery;

  if (error) {
    throw new RepositoryError(`Failed to list "${definition.tableName}": ${error.message}`);
  }

  const meta: PaginationMeta = buildPaginationMeta(pagination, count ?? 0);
  return { data: (data ?? []) as T[], meta };
}

/** Implements: API Specification 03 - CMS API, "Create Entity." Starts every record at status='draft'. */
export async function genericCreate<T = Record<string, unknown>>(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  input: Record<string, unknown>,
): Promise<T> {
  assertValidResource(definition, input);

  const row: Record<string, unknown> = {
    ...input,
    created_by: ctx.actorId,
    updated_by: ctx.actorId,
  };

  if (definition.hasLifecycle) {
    // Caller cannot set status on creation — every entity starts in draft
    // (Entity Lifecycles & State Transitions, Phase 6; API Specification
    // 03 - CMS API "Create Entity": "New rows always start in draft").
    row.status = "draft";
  }

  const { data, error } = await ctx.supabase
    .from(definition.tableName)
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw new RepositoryError(
      `Failed to create "${definition.tableName}": ${error?.message ?? "unknown error"}`,
    );
  }

  const adapter = ctx.revisionAdapter ?? new NoOpRevisionAdapter();
  await adapter.recordRevision({
    tableName: definition.tableName,
    recordId: String((data as Record<string, unknown>).id),
    snapshot: data as Record<string, unknown>,
    changedBy: ctx.actorId,
    changedAt: new Date().toISOString(),
  });

  return data as T;
}

/** Implements: API Specification 03 - CMS API, "Update Entity." Rejects a `status` field — use transitionStatus. */
export async function genericUpdate<T = Record<string, unknown>>(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  id: string,
  input: Record<string, unknown>,
): Promise<T> {
  if ("status" in input) {
    throw new RepositoryError(
      'Cannot set "status" via genericUpdate — use genericTransitionStatus instead ' +
        "(API Specification 03 - CMS API, 01 - API Standards: status transitions are their own action, never a raw field update).",
    );
  }

  assertValidPartialResource(definition, input);

  const row: Record<string, unknown> = { ...input, updated_by: ctx.actorId };

  const { data, error } = await ctx.supabase
    .from(definition.tableName)
    .update(row)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new RepositoryError(`Failed to update "${definition.tableName}": ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError(definition.tableName, id);
  }

  const adapter = ctx.revisionAdapter ?? new NoOpRevisionAdapter();
  await adapter.recordRevision({
    tableName: definition.tableName,
    recordId: id,
    snapshot: data,
    changedBy: ctx.actorId,
    changedAt: new Date().toISOString(),
  });

  return data as T;
}

/** Implements: API Specification 03 - CMS API, "Transition Status." */
export async function genericTransitionStatus<T = Record<string, unknown>>(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  id: string,
  currentStatus: string,
  toStatus: string,
): Promise<T> {
  if (!definition.hasLifecycle) {
    throw new RepositoryError(
      `"${definition.tableName}" does not have a lifecycle (status) column.`,
    );
  }
  if (!isStatus(currentStatus) || !isStatus(toStatus)) {
    throw new RepositoryError(`Unrecognized status value.`);
  }

  assertValidTransition(currentStatus as EntityStatus, toStatus as EntityStatus);

  const { data, error } = await ctx.supabase
    .from(definition.tableName)
    .update({ status: toStatus, updated_by: ctx.actorId })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new RepositoryError(`Failed to transition "${definition.tableName}": ${error.message}`);
  }
  if (!data) {
    throw new NotFoundError(definition.tableName, id);
  }

  // BUG FIX (discovered during Milestone 10): this comment used to claim a
  // "shared database trigger mechanism established in Milestone 2" wrote
  // to entity_state_transition automatically. No such trigger was ever
  // created in any migration (verified against every file in
  // packages/database/migrations) — entity_state_transition has been
  // silently empty since this function was written in Milestone 4. This
  // insert is the actual fix: the ONE place a transition is recorded,
  // called by every entity type through this same shared function
  // (Archive Model, Data Lifecycle, Phase 4).
  const { error: historyError } = await ctx.supabase
    .from("entity_state_transition")
    .insert({
      entity_table: definition.tableName,
      entity_id: id,
      from_status: currentStatus,
      to_status: toStatus,
      changed_by: ctx.actorId,
    })
    .select("id")
    .single();
  if (historyError) {
    // Per Observability principle (Phase 8): a logging failure must never
    // block or roll back the transition it's attached to — the transition
    // itself already succeeded above. Surface this loudly server-side
    // rather than silently swallowing it, since a missing history row is
    // itself a real data-integrity concern worth investigating.
    // eslint-disable-next-line no-console
    console.error(
      `[entity_state_transition] failed to record history for ${definition.tableName}="${id}": ${historyError.message}`,
    );
  }

  return data as T;
}

/**
 * Implements: Milestone 4 — Soft Delete support.
 *
 * No Hard Delete (Core Principles, Phase 1; Data Lifecycle, Phase 4):
 * "archiving" a record with `hasLifecycle: true` is a status transition to
 * 'archived' (genericTransitionStatus), never a row deletion. Physical
 * deletion (genericHardDelete, below) is only ever valid for a record that
 * has never left 'draft' — mirroring the one documented exception in Data
 * Lifecycle.
 */
export async function genericSoftDelete<T = Record<string, unknown>>(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  id: string,
  currentStatus: string,
): Promise<T> {
  return genericTransitionStatus<T>(definition, ctx, id, currentStatus, "archived");
}

/** Implements: Milestone 4 — Restore support. The one documented reverse transition: archived → published. */
export async function genericRestore<T = Record<string, unknown>>(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  id: string,
): Promise<T> {
  return genericTransitionStatus<T>(definition, ctx, id, "archived", "published");
}

/**
 * Physical row deletion — permitted ONLY for a record still in 'draft'
 * (Data Lifecycle, Phase 4: "Physical row deletion is permitted only for
 * rows that never left status = 'draft' and were entered in error").
 * Calling this on anything else is a programming error, not a business
 * decision this function should silently allow.
 */
export async function genericHardDelete(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  id: string,
  currentStatus: string,
): Promise<void> {
  if (definition.hasLifecycle && currentStatus !== "draft") {
    throw new RepositoryError(
      `Refusing to hard-delete a "${definition.tableName}" row with status "${currentStatus}". ` +
        `Physical deletion is only permitted for rows that never left "draft" ` +
        `(Data Lifecycle, Phase 4; Database Architecture §7). Use genericSoftDelete instead.`,
    );
  }

  const { error } = await ctx.supabase.from(definition.tableName).delete().eq("id", id);
  if (error) {
    throw new RepositoryError(`Failed to delete "${definition.tableName}": ${error.message}`);
  }
}

/**
 * Implements: data owner decision, 2026-07-25 — a genuine, irreversible
 * row deletion available on ANY table via its `ResourceDefinition`,
 * deliberately distinct from `genericSoftDelete` (archive) and
 * `genericHardDelete` (draft-only, per Data Lifecycle's one documented
 * exception) above. This is a real departure from "No Hard Delete, ever,
 * for a published entity" — requested explicitly, with the consequences
 * spelled out, and accepted on one condition: nothing is ever removed
 * without a full snapshot written to `entity_hard_delete_log` FIRST (who,
 * when, and the entire row as it existed). If the snapshot write fails,
 * the delete is refused — there is no path where a row disappears without
 * one.
 *
 * Existing `ON DELETE RESTRICT` foreign keys are NOT bypassed or
 * cascaded — a row still referenced elsewhere blocks the delete exactly
 * as it always has (the data owner's explicit choice over cascading),
 * surfaced here as `ForceDeleteBlockedError` instead of a raw Postgres
 * error leaking through.
 */
export async function genericForceDelete(
  definition: ResourceDefinition,
  ctx: RepositoryContext,
  id: string,
): Promise<void> {
  const { data, error: fetchError } = await ctx.supabase
    .from(definition.tableName)
    .select("*")
    .eq("id", id);

  if (fetchError) {
    throw new RepositoryError(
      `Failed to read "${definition.tableName}" before permanent delete: ${fetchError.message}`,
    );
  }
  const existing = (data as Record<string, unknown>[] | undefined)?.[0];
  if (!existing) {
    throw new NotFoundError(definition.tableName, id);
  }

  const { error: logError } = await ctx.supabase
    .from("entity_hard_delete_log")
    .insert({
      entity_table: definition.tableName,
      entity_id: id,
      snapshot: existing,
      deleted_by: ctx.actorId,
    })
    .select("id")
    .single();

  if (logError) {
    // The whole point of this function is "never delete without a
    // backup" — refuse outright rather than delete with a failed log.
    throw new RepositoryError(
      `Refusing to permanently delete "${definition.tableName}" — failed to write the ` +
        `pre-delete snapshot: ${logError.message}`,
    );
  }

  const { error: deleteError } = await ctx.supabase
    .from(definition.tableName)
    .delete()
    .eq("id", id);

  if (deleteError) {
    if (/foreign key|violates|referenced/i.test(deleteError.message)) {
      throw new ForceDeleteBlockedError(definition.tableName, deleteError.message);
    }
    throw new RepositoryError(
      `Failed to permanently delete "${definition.tableName}": ${deleteError.message}`,
    );
  }
}
