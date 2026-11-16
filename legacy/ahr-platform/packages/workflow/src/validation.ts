/**
 * Implements: Moderation Logic (Phase 6); API Specification 08 - Dashboard
 * API, "Transition Moderation Report": "resolutionNotes required when
 * toStatus='resolved'."
 */

export class ModerationValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ModerationValidationError";
    this.code = code;
  }
}

export function assertResolutionNotesProvided(
  toStatus: string,
  resolutionNotes: string | undefined,
): void {
  if (toStatus === "resolved" && (!resolutionNotes || resolutionNotes.trim().length === 0)) {
    throw new ModerationValidationError(
      "VALIDATION_ERROR",
      "resolutionNotes is required when resolving a moderation report.",
    );
  }
}

export function assertReasonProvided(reason: string): void {
  if (!reason || reason.trim().length === 0) {
    throw new ModerationValidationError(
      "VALIDATION_ERROR",
      "A reason is required to open a moderation report.",
    );
  }
}
