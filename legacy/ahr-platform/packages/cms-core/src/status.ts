/**
 * Implements: Data Foundation Conventions §6/§8 (Database Architecture,
 * Milestone 2) — the shared `status`/`visibility`/`verification_status`
 * enums every Archive entity table carries; Entity Lifecycles & State
 * Transitions (Phase 6); API Specification 03 - CMS API, "Transition
 * Status."
 *
 * This is the ONE place the lifecycle sequence is encoded for the whole
 * CMS engine — every future business package (Work, Person, etc.) reuses
 * this, none of them re-declare their own copy of the status sequence
 * (Coding Standards, "one place for a rule").
 */

export const STATUS_VALUES = ["draft", "review", "verified", "published", "archived"] as const;
export type EntityStatus = (typeof STATUS_VALUES)[number];

export const VISIBILITY_VALUES = ["public", "restricted", "hidden"] as const;
export type Visibility = (typeof VISIBILITY_VALUES)[number];

export const VERIFICATION_STATUS_VALUES = [
  "verified",
  "self_reported",
  "pending",
  "archived",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS_VALUES)[number];

/**
 * The only transitions Entity Lifecycles & State Transitions (Phase 6)
 * documents: Draft→Review, Review→Verified, Verified→Published,
 * Published→Archived, and Archived→Published (the one documented restore
 * path). No backward transition (e.g. Review→Draft, Verified→Review) is
 * included here — the frozen document never authorizes one, and inventing
 * a "correction" path not in that document would extend the approved
 * business rules, which this milestone is explicitly not allowed to do.
 * If a real need for a backward correction path emerges, that is a
 * Business Rules (Phase 6) revision to request, not something to add here
 * unilaterally.
 */
const ALLOWED_TRANSITIONS: Record<EntityStatus, readonly EntityStatus[]> = {
  draft: ["review"],
  review: ["verified"],
  verified: ["published"],
  published: ["archived"],
  archived: ["published"],
};

export class InvalidStatusTransitionError extends Error {
  constructor(from: EntityStatus, to: EntityStatus) {
    super(
      `INVALID_STATUS_TRANSITION — cannot move from "${from}" to "${to}". ` +
        `Allowed from "${from}": ${ALLOWED_TRANSITIONS[from].join(", ") || "(none)"}. ` +
        `(API Specification 12 - Error Codes; Entity Lifecycles & State Transitions, Phase 6.)`,
    );
    this.name = "InvalidStatusTransitionError";
  }
}

export function isStatus(value: string): value is EntityStatus {
  return (STATUS_VALUES as readonly string[]).includes(value);
}

export function isVisibility(value: string): value is Visibility {
  return (VISIBILITY_VALUES as readonly string[]).includes(value);
}

export function isVerificationStatus(value: string): value is VerificationStatus {
  return (VERIFICATION_STATUS_VALUES as readonly string[]).includes(value);
}

/** Throws InvalidStatusTransitionError if the transition isn't permitted. */
export function assertValidTransition(from: EntityStatus, to: EntityStatus): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new InvalidStatusTransitionError(from, to);
  }
}

export function getAllowedNextStatuses(from: EntityStatus): readonly EntityStatus[] {
  return ALLOWED_TRANSITIONS[from];
}
