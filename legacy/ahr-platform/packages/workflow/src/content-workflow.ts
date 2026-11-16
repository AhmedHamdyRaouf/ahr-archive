/**
 * Implements: Milestone 10 §"Workflow definitions," §"State transition
 * orchestration using the existing schema" — for CONTENT entities
 * (Work, Person, Project, Event, Organization, Award, Category, Tag,
 * Press Mention, Contribution, Media Asset).
 *
 * This module does NOT re-implement the content transition graph — that
 * already exists, tested, in `@ahr/cms-core` (Milestone 4:
 * `assertValidTransition`, `getAllowedNextStatuses`,
 * `genericTransitionStatus`). It re-exports those directly. What Milestone
 * 10 actually adds for content workflows is the AUDIT INTEGRATION: the bug
 * fix in `@ahr/cms-core`'s `genericTransitionStatus` (see this package's
 * README) that makes `entity_state_transition` actually get written to —
 * every content transition through the existing generic engine is now a
 * correctly-orchestrated workflow step with a real audit trail, without
 * this package touching a single content call site.
 *
 * History reads reuse `@ahr/relationships`' `getStateHistory` (Milestone
 * 7) directly — not re-implemented here either.
 */

export {
  STATUS_VALUES,
  isStatus,
  assertValidTransition,
  getAllowedNextStatuses,
  InvalidStatusTransitionError,
  genericTransitionStatus,
} from "@ahr/cms-core";
export type { EntityStatus } from "@ahr/cms-core";

export { getStateHistory, getCurrentStatusFromHistory } from "@ahr/relationships";
export type { EntityStateTransitionRecord } from "@ahr/relationships";
