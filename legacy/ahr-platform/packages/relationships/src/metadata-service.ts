/**
 * Implements: Milestone 7 §"Metadata services supported by the frozen
 * schema" — the shared metadata fields every content table carries
 * (Data Foundation Conventions §6, Database Architecture Frozen v1):
 * `visibility`, `verification_status`, `owner_id`, `source`. `status`
 * itself is deliberately NOT handled here — it already has its own
 * dedicated, tested transition mechanism (`@ahr/cms-core`'s
 * `genericTransitionStatus`, Milestone 4); duplicating that here would
 * violate "no duplicated CRUD logic."
 *
 * IMPORTANT — scope note: unlike `status`, neither Database Architecture
 * nor Business Rules (Phase 6) defines a transition GRAPH for
 * `verification_status` (no "pending → self_reported → verified" sequence
 * is documented anywhere). This module therefore allows setting
 * `verification_status` to any value in the frozen check-constraint list
 * directly — inventing a sequencing rule here would be extending the
 * architecture beyond what was actually approved (the same category of
 * mistake caught in Milestone 4's status-transition graph).
 */

import {
  genericUpdate,
  isVisibility,
  isVerificationStatus,
  type ResourceDefinition,
  type RepositoryContext,
  type SupabaseLikeClient,
} from "@ahr/cms-core";
import { requireCapability, type CookieAdapter, type Session } from "@ahr/auth";

export interface MetadataActivityLogger {
  log(input: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}

export interface MetadataServiceContext {
  cookies: CookieAdapter;
  db: SupabaseLikeClient;
  activityLogger: MetadataActivityLogger;
}

async function requireMetadataSession(cookies: CookieAdapter): Promise<Session> {
  return requireCapability(cookies, "content:write");
}

export class InvalidMetadataValueError extends Error {
  constructor(field: string, value: string, allowed: readonly string[]) {
    super(`Invalid value "${value}" for "${field}". Allowed values: ${allowed.join(", ")}.`);
    this.name = "InvalidMetadataValueError";
  }
}

/** Updates `visibility` — validated against the frozen `public | restricted | hidden` set (Database Architecture §6). */
export async function updateVisibility(
  ctx: MetadataServiceContext,
  definition: ResourceDefinition,
  id: string,
  newVisibility: string,
): Promise<Record<string, unknown>> {
  if (!isVisibility(newVisibility)) {
    throw new InvalidMetadataValueError("visibility", newVisibility, [
      "public",
      "restricted",
      "hidden",
    ]);
  }

  const session = await requireMetadataSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
  const updated = await genericUpdate(definition, repoCtx, id, { visibility: newVisibility });

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: definition.tableName,
    entityId: id,
    metadata: { field: "visibility", newValue: newVisibility },
  });

  return updated;
}

/**
 * Updates `verification_status` — validated against the frozen
 * `verified | self_reported | pending | archived` set. See the file-level
 * scope note: no sequencing/transition graph is enforced, since none is
 * documented anywhere in the frozen architecture.
 */
export async function updateVerificationStatus(
  ctx: MetadataServiceContext,
  definition: ResourceDefinition,
  id: string,
  newVerificationStatus: string,
): Promise<Record<string, unknown>> {
  if (!isVerificationStatus(newVerificationStatus)) {
    throw new InvalidMetadataValueError("verification_status", newVerificationStatus, [
      "verified",
      "self_reported",
      "pending",
      "archived",
    ]);
  }

  const session = await requireMetadataSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
  const updated = await genericUpdate(definition, repoCtx, id, {
    verification_status: newVerificationStatus,
  });

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: definition.tableName,
    entityId: id,
    metadata: { field: "verification_status", newValue: newVerificationStatus },
  });

  return updated;
}

/**
 * Reassigns `owner_id` — Ownership Rules (Phase 6): "the transfer must be
 * documented in the historical record." No dedicated ownership-history
 * table exists in the frozen schema (only `entity_state_transition`,
 * which is status-specific), so the transfer is documented via
 * `activity_log` (`action: 'permission_change'`, the closest fit among
 * the frozen `chk_activity_log_action` values for "who is accountable
 * changed") with the old/new owner recorded in `metadata`.
 */
export async function updateOwner(
  ctx: MetadataServiceContext,
  definition: ResourceDefinition,
  id: string,
  previousOwnerId: string | null,
  newOwnerId: string,
): Promise<Record<string, unknown>> {
  const session = await requireMetadataSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
  const updated = await genericUpdate(definition, repoCtx, id, { owner_id: newOwnerId });

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "permission_change",
    entityType: definition.tableName,
    entityId: id,
    metadata: { field: "owner_id", previousOwnerId, newOwnerId },
  });

  return updated;
}

/** Updates the free-text `source` field (Metadata Model — Source, Phase 4). */
export async function updateSource(
  ctx: MetadataServiceContext,
  definition: ResourceDefinition,
  id: string,
  newSource: string | null,
): Promise<Record<string, unknown>> {
  const session = await requireMetadataSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
  const updated = await genericUpdate(definition, repoCtx, id, { source: newSource });

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: definition.tableName,
    entityId: id,
    metadata: { field: "source" },
  });

  return updated;
}
