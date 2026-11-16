/**
 * Implements: Milestone 10 — Approval and review flows; Moderation Logic
 * (Phase 6); API Specification 08 - Dashboard API (Moderation Report
 * endpoints, never actually implemented until now).
 *
 * `moderation_report` does NOT go through `@ahr/cms-core`'s generic
 * engine: it has no `draft` status (its lifecycle starts at `open`, not
 * `draft`), no `visibility`/`verification_status`/`source`/`owner_id`
 * columns, and its own transition graph is entirely different from
 * content's Draft→Review→Verified→Published→Archived sequence. Forcing
 * it through `genericCreate`/`genericTransitionStatus` would either
 * silently violate `chk_moderation_report_status` or require weakening
 * those functions' own guarantees for every other entity. This is
 * bespoke, tested code for that structural reason — the same category of
 * decision as Milestone 7's taxonomy join-table services.
 */

import { requireCapability, type Session } from "@ahr/auth";
import { assertValidModerationTransition, isModerationStatus } from "./moderation-graph";
import { assertResolutionNotesProvided, assertReasonProvided } from "./validation";
import type { ModerationReportRecord, ModerationStatus, WorkflowContext } from "./types";

async function requireModerationSession(ctx: WorkflowContext): Promise<Session> {
  // "moderation:manage" — Permissions Matrix (API Specification 14).
  return requireCapability(ctx.cookies, "moderation:manage");
}

/**
 * Opens a new moderation report against any entity (`entity_table`/
 * `entity_id` are plain columns by design — Database Architecture §2.2 —
 * so this works for any current or future table, not just the 10 Archive
 * entities).
 */
export async function openModerationReport(
  ctx: WorkflowContext,
  input: { entityTable: string; entityId: string; reason: string },
): Promise<ModerationReportRecord> {
  const session = await requireModerationSession(ctx);
  assertReasonProvided(input.reason);

  const { data, error } = await ctx.db
    .from("moderation_report")
    .insert({
      entity_table: input.entityTable,
      entity_id: input.entityId,
      reason: input.reason,
      status: "open",
      reported_by: session.platformUserId,
      created_by: session.platformUserId,
      updated_by: session.platformUserId,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to open moderation report: ${error?.message ?? "unknown error"}`);
  }

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "create",
    entityType: "moderation_report",
    entityId: (data as unknown as ModerationReportRecord).id,
  });

  return data as unknown as ModerationReportRecord;
}

/**
 * Transitions a moderation report through its own lifecycle. Requires
 * `resolutionNotes` when resolving (`assertResolutionNotesProvided`) —
 * the migration's own documented rule, enforced here in code for a
 * clearer error, same posture as every other package in this project.
 * Also writes to `entity_state_transition` (`entity_table =
 * 'moderation_report'`) — the SAME shared history table every content
 * entity uses, reusing the pattern rather than a separate mechanism.
 */
export async function transitionModerationReport(
  ctx: WorkflowContext,
  id: string,
  currentStatus: string,
  toStatus: string,
  options: { resolutionNotes?: string; assignedTo?: string } = {},
): Promise<ModerationReportRecord> {
  const session = await requireModerationSession(ctx);

  if (!isModerationStatus(currentStatus) || !isModerationStatus(toStatus)) {
    throw new Error("Unrecognized moderation status value.");
  }
  assertValidModerationTransition(currentStatus as ModerationStatus, toStatus as ModerationStatus);
  assertResolutionNotesProvided(toStatus, options.resolutionNotes);

  const updateRow: Record<string, unknown> = {
    status: toStatus,
    updated_by: session.platformUserId,
  };
  if (options.resolutionNotes !== undefined) updateRow.resolution_notes = options.resolutionNotes;
  if (options.assignedTo !== undefined) updateRow.assigned_to = options.assignedTo;

  const { data, error } = await ctx.db
    .from("moderation_report")
    .update(updateRow)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to transition moderation report "${id}": ${error.message}`);
  }
  if (!data) {
    throw new Error(`NOT_FOUND — no moderation report with id "${id}".`);
  }

  // Reuses the exact same shared history table content transitions write
  // to (Milestone 10 bug fix, @ahr/cms-core) — a moderation report's
  // status change is just as much a "state transition" as a Work's, and
  // Database Architecture never restricted entity_state_transition to
  // Archive entities specifically (§2.2/§3: "any current or future table").
  const { error: historyError } = await ctx.db
    .from("entity_state_transition")
    .insert({
      entity_table: "moderation_report",
      entity_id: id,
      from_status: currentStatus,
      to_status: toStatus,
      changed_by: session.platformUserId,
    })
    .select("id")
    .single();
  if (historyError) {
    // eslint-disable-next-line no-console
    console.error(
      `[entity_state_transition] failed to record moderation history for "${id}": ${historyError.message}`,
    );
  }

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: "moderation_report",
    entityId: id,
    metadata: { fromStatus: currentStatus, toStatus, resolutionNotes: options.resolutionNotes },
  });

  return data as unknown as ModerationReportRecord;
}

/** Reassigns a report to a different Administrator — a metadata change, not a status transition. */
export async function assignModerationReport(
  ctx: WorkflowContext,
  id: string,
  assignedTo: string,
): Promise<ModerationReportRecord> {
  const session = await requireModerationSession(ctx);

  const { data, error } = await ctx.db
    .from("moderation_report")
    .update({ assigned_to: assignedTo, updated_by: session.platformUserId })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to assign moderation report "${id}": ${error.message}`);
  }
  if (!data) {
    throw new Error(`NOT_FOUND — no moderation report with id "${id}".`);
  }

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: "moderation_report",
    entityId: id,
    metadata: { field: "assigned_to", assignedTo },
  });

  return data as unknown as ModerationReportRecord;
}
