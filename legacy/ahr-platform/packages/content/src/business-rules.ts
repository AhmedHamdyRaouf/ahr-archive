/**
 * Implements: Data Integrity Rules (Phase 4) — the entity-specific rules
 * that @ahr/cms-core's generic validation layer deliberately does not
 * know about (it only validates a record against its own
 * ResourceDefinition; cross-field OR-constraints and cross-table checks
 * are Archive's job, per Packages Specification Package 04).
 */

export class BusinessRuleError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "BusinessRuleError";
    this.code = code;
  }
}

/**
 * "Contribution always references one Person and at least one of
 * Work/Project/Event" (Data Integrity Rules, Phase 4) — the code-level
 * counterpart to `chk_contribution_target_present`, checked earlier for a
 * clearer error (Development Specification 06 - Backend Development Rules).
 */
export function assertContributionHasTarget(record: {
  work_id?: unknown;
  project_id?: unknown;
  event_id?: unknown;
}): void {
  const hasTarget =
    Boolean(record.work_id) || Boolean(record.project_id) || Boolean(record.event_id);
  if (!hasTarget) {
    throw new BusinessRuleError(
      "MISSING_CONTRIBUTION_TARGET",
      "A Contribution must reference at least one of Work, Project, or Event.",
    );
  }
}

/**
 * "Press always identifies exactly one subject: Person, Work, Event, or
 * Organization" (Data Integrity Rules, Phase 4) — code-level counterpart to
 * `chk_press_mention_subject_present`.
 */
export function assertPressMentionHasSubject(record: {
  person_id?: unknown;
  work_id?: unknown;
  event_id?: unknown;
  organization_id?: unknown;
}): void {
  const subjectCount = [
    record.person_id,
    record.work_id,
    record.event_id,
    record.organization_id,
  ].filter(Boolean).length;

  if (subjectCount !== 1) {
    throw new BusinessRuleError(
      "PRESS_MENTION_SUBJECT_COUNT",
      `A Press Mention must identify exactly one subject (Person, Work, Event, or Organization); found ${subjectCount}.`,
    );
  }
}

import type { SupabaseLikeClient } from "@ahr/cms-core";

/**
 * The Contribution-count check reuses @ahr/cms-core's own
 * `SupabaseLikeClient` type directly, rather than declaring a separate,
 * narrower interface — a first attempt at a bespoke, Promise-returning
 * shape here turned out structurally incompatible with `SupabaseLikeClient`
 * when both were combined into one client type in `service.ts` (the real
 * Supabase/PostgREST query builder is chainable-and-awaitable — `.eq()`
 * itself returns the same thenable builder, not a bare Promise). Reusing
 * the one existing type avoids re-deriving that shape incorrectly a
 * second time.
 */
export type ContributionCheckClient = SupabaseLikeClient;

/**
 * "A Work cannot exist without at least one Contribution" (Data Integrity
 * Rules, Phase 4). Checked before allowing the verified→published
 * transition.
 *
 * IMPORTANT — scope: Data Integrity Rules states this requirement for
 * **Work only**. Project and Event share the same relational shape with
 * Contribution (they too can be a Contribution's target), but the frozen
 * documents never extend this specific publish-blocking requirement to
 * them. Extending it there would be inventing a stricter rule the
 * architecture never authorized — the same mistake caught and reverted in
 * Milestone 4 (status transition graph). This function is therefore only
 * wired to `works` (see CONTRIBUTION_REQUIRED_BEFORE_PUBLISH below), not
 * to `projects`/`events`, even though it's technically reusable for them.
 */
export async function assertHasContributionBeforePublish(
  client: ContributionCheckClient,
  targetColumn: "work_id" | "project_id" | "event_id",
  targetId: string,
): Promise<void> {
  const { count, error } = await client
    .from("contribution")
    .select("id", { count: "exact", head: true })
    .eq(targetColumn, targetId);

  if (error) {
    throw new Error(
      `Failed to check Contributions for ${targetColumn}="${targetId}": ${error.message}`,
    );
  }

  if (!count || count < 1) {
    throw new BusinessRuleError(
      "MISSING_CONTRIBUTION",
      "Add at least one Contribution before publishing (Data Integrity Rules, Phase 4).",
    );
  }
}

/**
 * Which entity types this rule applies to, and which FK column on
 * `contribution` each one corresponds to. **Only `works`** — see the
 * scope note on `assertHasContributionBeforePublish` above for why
 * `projects`/`events` are deliberately absent.
 */
export const CONTRIBUTION_REQUIRED_BEFORE_PUBLISH: Partial<
  Record<string, "work_id" | "project_id" | "event_id">
> = {
  works: "work_id",
};
