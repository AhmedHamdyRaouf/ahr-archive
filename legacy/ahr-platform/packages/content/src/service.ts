/**
 * Implements: Milestone 5 — "CMS integration" (every domain package uses
 * the generic engine; Permissions are checked consistently). This is the
 * ONE place a Route Handler calls into for any content mutation — it
 * composes, in order: permission check (@ahr/auth) → entity-specific
 * business rule → @ahr/cms-core's generic repository function → an
 * injected activity logger. No page/Route Handler re-implements this
 * sequence itself (Coding Standards).
 *
 * The activity logger is dependency-injected (an `ActivityLogger`
 * interface, not @ahr/auth's concrete `writeActivityLog` called directly)
 * because @ahr/auth's function expects the concrete `@supabase/supabase-js`
 * `SupabaseClient` type, while this package only requires the narrow,
 * structural `SupabaseLikeClient` shape (@ahr/cms-core's own testability
 * design). Injecting the logger keeps `@ahr/content` decoupled from that
 * concrete type and independently testable with a mock logger — the real
 * `apps/web` Route Handler wires the injected logger to the real
 * `writeActivityLog` + real Supabase client, where both types are already
 * satisfied.
 */

import {
  genericCreate,
  genericUpdate,
  genericTransitionStatus,
  genericSoftDelete,
  genericRestore,
  genericForceDelete,
  type RepositoryContext,
  type SupabaseLikeClient,
} from "@ahr/cms-core";
import { requireCapability, type CookieAdapter, type Session } from "@ahr/auth";
import { getDefinition, type EntityType } from "./definitions";
import {
  assertContributionHasTarget,
  assertPressMentionHasSubject,
  assertHasContributionBeforePublish,
  CONTRIBUTION_REQUIRED_BEFORE_PUBLISH,
} from "./business-rules";

export type ContentServiceClient = SupabaseLikeClient;

export interface ActivityLogger {
  log(input: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
  }): Promise<void>;
}

export interface ContentServiceContext {
  cookies: CookieAdapter;
  supabase: ContentServiceClient;
  activityLogger: ActivityLogger;
}

/** Runs entity-specific validation beyond @ahr/cms-core's generic field validation (business-rules.ts). */
function assertEntitySpecificRules(entityType: EntityType, record: Record<string, unknown>): void {
  if (entityType === "contributions") {
    assertContributionHasTarget(record);
  }
  if (entityType === "press-mentions") {
    assertPressMentionHasSubject(record);
  }
}

async function requireContentSession(cookies: CookieAdapter): Promise<Session> {
  // "content:write" — the one capability every mutating content operation
  // requires (Permissions Matrix, API Specification 14). All of it
  // resolves to the single active V1 role, 'administrator' (Milestone 3).
  return requireCapability(cookies, "content:write");
}

async function requireForceDeleteSession(cookies: CookieAdapter): Promise<Session> {
  // "database:force-delete" — deliberately separate from "content:write"
  // (data owner decision, 2026-07-25). See @ahr/cms-core's
  // genericForceDelete for the full reasoning.
  return requireCapability(cookies, "database:force-delete");
}

export async function createEntity(
  ctx: ContentServiceContext,
  entityType: EntityType,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const session = await requireContentSession(ctx.cookies);
  const definition = getDefinition(entityType);

  assertEntitySpecificRules(entityType, input);

  const repoCtx: RepositoryContext = { supabase: ctx.supabase, actorId: session.platformUserId };
  const created = await genericCreate(definition, repoCtx, input);

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "create",
    entityType,
    entityId: String((created as Record<string, unknown>).id),
  });

  return created;
}

export async function updateEntity(
  ctx: ContentServiceContext,
  entityType: EntityType,
  id: string,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const session = await requireContentSession(ctx.cookies);
  const definition = getDefinition(entityType);

  assertEntitySpecificRules(entityType, input);

  const repoCtx: RepositoryContext = { supabase: ctx.supabase, actorId: session.platformUserId };
  const updated = await genericUpdate(definition, repoCtx, id, input);

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType,
    entityId: id,
  });

  return updated;
}

export async function transitionEntityStatus(
  ctx: ContentServiceContext,
  entityType: EntityType,
  id: string,
  currentStatus: string,
  toStatus: string,
): Promise<Record<string, unknown>> {
  const session = await requireContentSession(ctx.cookies);
  const definition = getDefinition(entityType);

  // "A Work cannot exist without at least one Contribution" — checked
  // specifically on the transition INTO 'published', not on every
  // transition, and only for the one entity type this rule actually
  // covers (business-rules.ts CONTRIBUTION_REQUIRED_BEFORE_PUBLISH).
  const contributionColumn = CONTRIBUTION_REQUIRED_BEFORE_PUBLISH[entityType];
  if (toStatus === "published" && contributionColumn) {
    await assertHasContributionBeforePublish(ctx.supabase, contributionColumn, id);
  }

  const repoCtx: RepositoryContext = { supabase: ctx.supabase, actorId: session.platformUserId };
  const result = await genericTransitionStatus(definition, repoCtx, id, currentStatus, toStatus);

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: toStatus === "published" ? "publish" : toStatus === "archived" ? "archive" : "update",
    entityType,
    entityId: id,
  });

  return result;
}

/** Soft delete = transition to 'archived' (No Hard Delete, Phase 1/4) — never a row deletion. */
export async function deleteEntity(
  ctx: ContentServiceContext,
  entityType: EntityType,
  id: string,
  currentStatus: string,
): Promise<Record<string, unknown>> {
  const session = await requireContentSession(ctx.cookies);
  const definition = getDefinition(entityType);

  const repoCtx: RepositoryContext = { supabase: ctx.supabase, actorId: session.platformUserId };
  const result = await genericSoftDelete(definition, repoCtx, id, currentStatus);

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "archive",
    entityType,
    entityId: id,
  });

  return result;
}

/**
 * Implements: data owner decision, 2026-07-25 — "Delete Permanently."
 * Genuinely irreversible (unlike `deleteEntity` above, which only ever
 * archives). Gated behind the separate "database:force-delete"
 * capability, not "content:write" — see genericForceDelete for the full
 * reasoning (pre-delete snapshot, no cascade, existing FK restrict rules
 * still apply).
 */
export async function forceDeleteEntity(
  ctx: ContentServiceContext,
  entityType: EntityType,
  id: string,
): Promise<void> {
  const session = await requireForceDeleteSession(ctx.cookies);
  const definition = getDefinition(entityType);

  const repoCtx: RepositoryContext = { supabase: ctx.supabase, actorId: session.platformUserId };
  await genericForceDelete(definition, repoCtx, id);

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "force-delete",
    entityType,
    entityId: id,
  });
}

/**
 * Implements: Dashboard UX Enhancement Backlog #1 — "Wire up Bulk Actions
 * for real." Runs the same permission-check + business-rule + activity-log
 * sequence as transitionEntityStatus, once per selected id, so the Route
 * Handler stays a thin wrapper exactly like every other function in this
 * file (Coding Standards — no Route Handler re-implements the
 * create/read/update/delete sequence itself).
 *
 * Partial success by design: one row failing (e.g. a Work missing its
 * required Contribution before publish) must not block the other
 * selected rows from transitioning — each item's outcome is reported
 * individually so the caller can show the admin exactly which rows
 * succeeded and which didn't, rather than an all-or-nothing bulk failure.
 */
export interface BulkTransitionItem {
  id: string;
  currentStatus: string;
}

export interface BulkTransitionResult {
  id: string;
  ok: boolean;
  error?: string;
}

export async function bulkTransitionEntityStatus(
  ctx: ContentServiceContext,
  entityType: EntityType,
  items: BulkTransitionItem[],
  toStatus: string,
): Promise<BulkTransitionResult[]> {
  // Single permission check up front — same capability every item below
  // would otherwise re-check individually (requireContentSession is
  // idempotent per-request but there is no reason to hit @ahr/auth N times
  // for one bulk request).
  await requireContentSession(ctx.cookies);

  const results: BulkTransitionResult[] = [];

  for (const item of items) {
    try {
      const result = await transitionEntityStatus(
        ctx,
        entityType,
        item.id,
        item.currentStatus,
        toStatus,
      );
      results.push({ id: String((result as Record<string, unknown>).id ?? item.id), ok: true });
    } catch (error) {
      results.push({
        id: item.id,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function restoreEntity(
  ctx: ContentServiceContext,
  entityType: EntityType,
  id: string,
): Promise<Record<string, unknown>> {
  const session = await requireContentSession(ctx.cookies);
  const definition = getDefinition(entityType);

  const repoCtx: RepositoryContext = { supabase: ctx.supabase, actorId: session.platformUserId };
  const result = await genericRestore(definition, repoCtx, id);

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "restore",
    entityType,
    entityId: id,
  });

  return result;
}
