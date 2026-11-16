/**
 * Implements: Milestone 6 §"Validation"; Data Integrity Rules (Phase 4) —
 * `chk_media_asset_type`, `chk_media_asset_owner_present`, enforced here in
 * code first for a clearer error (Development Specification 06 - Backend
 * Development Rules), same posture as every other package in this project.
 */

import { MEDIA_TYPES, OWNER_COLUMN, type MediaOwnerType, type MediaType } from "./types";

export class MediaValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MediaValidationError";
    this.code = code;
  }
}

/**
 * Maps a MIME type to the frozen `media_type` value it belongs to.
 * Throws `UNSUPPORTED_MEDIA_TYPE` for anything outside image/audio/video —
 * most notably documents (application/pdf, etc.), per
 * docs/blocked-metadata.md §3: this is a deliberate rejection, not a bug.
 */
export function deriveMediaType(mimeType: string): MediaType {
  const [category] = mimeType.split("/");
  if (category === "image" || category === "audio" || category === "video") {
    return category;
  }
  throw new MediaValidationError(
    "UNSUPPORTED_MEDIA_TYPE",
    `MIME type "${mimeType}" is not supported. media_asset.media_type only accepts ` +
      `${MEDIA_TYPES.join(", ")} (chk_media_asset_type, Database Architecture Frozen v1). ` +
      `Documents are not yet supported — see packages/media/docs/blocked-metadata.md §3.`,
  );
}

/** Default maximum upload size — 100 MiB. A deployment-configuration concern (Development Specification 15), overridable per call. */
export const DEFAULT_MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export function assertFileSizeWithinLimit(
  sizeBytes: number,
  maxBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
): void {
  if (sizeBytes > maxBytes) {
    throw new MediaValidationError(
      "FILE_TOO_LARGE",
      `File size ${sizeBytes} bytes exceeds the maximum of ${maxBytes} bytes.`,
    );
  }
  if (sizeBytes <= 0) {
    throw new MediaValidationError("EMPTY_FILE", "Uploaded file is empty.");
  }
}

/**
 * "Exactly one owner" — the code-level counterpart to
 * `chk_media_asset_owner_present`. Implemented independently here (not
 * imported from `@ahr/content`'s structurally-identical Press Mention
 * check) because Milestones 1–5 are frozen ("do not modify unless fixing
 * a real bug") and sharing would require either modifying an approved
 * package or introducing a new cross-package dependency neither
 * `@ahr/content` nor `@ahr/media` currently has a reason to take on for a
 * few lines of validation logic.
 */
export function assertExactlyOneOwner(record: {
  person_id?: unknown;
  work_id?: unknown;
  project_id?: unknown;
  event_id?: unknown;
}): void {
  const ownerCount = [record.person_id, record.work_id, record.project_id, record.event_id].filter(
    Boolean,
  ).length;

  if (ownerCount !== 1) {
    throw new MediaValidationError(
      "OWNER_CONSTRAINT_VIOLATION",
      `A media asset must have exactly one owner (Person, Work, Project, or Event); found ${ownerCount}.`,
    );
  }
}

export function ownerTypeToColumn(ownerType: MediaOwnerType): string {
  return OWNER_COLUMN[ownerType];
}
