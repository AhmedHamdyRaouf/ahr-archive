/**
 * @ahr/workflow — public exports only (Coding Standards: "no deep imports
 * from outside a package's public exports"). See README.md for the
 * Milestone 4 bug fix this milestone made to `@ahr/cms-core` (no schema
 * change — an application-code fix to a comment that falsely claimed a
 * database trigger existed).
 */

export { MODERATION_STATUS_VALUES } from "./types";
export type {
  ModerationStatus,
  ModerationReportRecord,
  WorkflowActivityLogger,
  WorkflowContext,
} from "./types";

export {
  isModerationStatus,
  assertValidModerationTransition,
  getAllowedNextModerationStatuses,
  InvalidModerationTransitionError,
} from "./moderation-graph";

export {
  ModerationValidationError,
  assertResolutionNotesProvided,
  assertReasonProvided,
} from "./validation";

export {
  openModerationReport,
  transitionModerationReport,
  assignModerationReport,
} from "./moderation-service";

export { listModerationReports, getModerationReport } from "./moderation-queries";
export type { ModerationListResult } from "./moderation-queries";

export {
  STATUS_VALUES,
  isStatus,
  assertValidTransition,
  getAllowedNextStatuses,
  InvalidStatusTransitionError,
  genericTransitionStatus,
  getStateHistory,
  getCurrentStatusFromHistory,
} from "./content-workflow";
export type { EntityStatus, EntityStateTransitionRecord } from "./content-workflow";
