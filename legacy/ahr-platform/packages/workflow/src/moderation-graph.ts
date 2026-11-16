/**
 * Implements: Moderation Logic (Phase 6) — "report → review → escalation
 * → resolution → audit"; Database Architecture (Frozen v1) §2.2 —
 * `chk_moderation_report_status`. This is the report's OWN lifecycle,
 * completely distinct from any content entity's `status` column — a
 * report being 'resolved' says nothing about the underlying entity's own
 * status (already noted in the migration's own comment; restated here
 * because it is the single most important thing to keep straight when
 * building a workflow engine that touches both concepts).
 *
 * Same design discipline as `@ahr/cms-core`'s content status graph
 * (Milestone 4): only transitions the frozen documents actually describe
 * are included here — no invented "un-escalate" or "reopen" path.
 */

import type { ModerationStatus } from "./types";
import { MODERATION_STATUS_VALUES } from "./types";

const ALLOWED_MODERATION_TRANSITIONS: Record<ModerationStatus, readonly ModerationStatus[]> = {
  open: ["in_review"],
  in_review: ["escalated", "resolved"],
  escalated: ["resolved"],
  resolved: [],
};

export class InvalidModerationTransitionError extends Error {
  constructor(from: ModerationStatus, to: ModerationStatus) {
    super(
      `INVALID_STATUS_TRANSITION — cannot move a moderation report from "${from}" to "${to}". ` +
        `Allowed from "${from}": ${ALLOWED_MODERATION_TRANSITIONS[from].join(", ") || "(none — resolved is terminal)"}.`,
    );
    this.name = "InvalidModerationTransitionError";
  }
}

export function isModerationStatus(value: string): value is ModerationStatus {
  return (MODERATION_STATUS_VALUES as readonly string[]).includes(value);
}

export function assertValidModerationTransition(
  from: ModerationStatus,
  to: ModerationStatus,
): void {
  if (!ALLOWED_MODERATION_TRANSITIONS[from].includes(to)) {
    throw new InvalidModerationTransitionError(from, to);
  }
}

export function getAllowedNextModerationStatuses(
  from: ModerationStatus,
): readonly ModerationStatus[] {
  return ALLOWED_MODERATION_TRANSITIONS[from];
}
