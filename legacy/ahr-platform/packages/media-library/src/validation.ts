/**
 * Code-level validation for the Asset Library, mirroring `@ahr/media`'s
 * posture (validated in code first, for a clearer error than a raw
 * Postgres constraint violation) — implemented independently rather than
 * imported, since the two packages' rules genuinely differ (this one is
 * images-only and has no owner concept at all).
 */

export class MediaLibraryValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MediaLibraryValidationError";
    this.code = code;
  }
}

/**
 * Asset Library V1 is scoped to images only (the requested field list —
 * width/height, no audio/video-shaped fields — implies this; unlike
 * `media_asset` there is no `media_type` column to widen later without a
 * migration).
 */
export function assertImageMimeType(mimeType: string): void {
  if (!mimeType.startsWith("image/")) {
    throw new MediaLibraryValidationError(
      "UNSUPPORTED_MEDIA_TYPE",
      `MIME type "${mimeType}" is not supported. The Asset Library only accepts images in V1.`,
    );
  }
}

/** Smaller default than @ahr/media's (100 MiB, sized for audio/video) — these are web design assets. */
export const DEFAULT_MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export function assertFileSizeWithinLimit(
  sizeBytes: number,
  maxBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
): void {
  if (sizeBytes > maxBytes) {
    throw new MediaLibraryValidationError(
      "FILE_TOO_LARGE",
      `File size ${sizeBytes} bytes exceeds the maximum of ${maxBytes} bytes.`,
    );
  }
  if (sizeBytes <= 0) {
    throw new MediaLibraryValidationError("EMPTY_FILE", "Uploaded file is empty.");
  }
}

const IMAGE_KEY_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/**
 * `image_key` is a stable, human-chosen lookup key other pages will
 * eventually reference by name (e.g. "home-hero-banner") — kept
 * URL/code-identifier-safe up front rather than allowing free text that
 * later breaks whatever reads it.
 */
export function assertValidImageKey(imageKey: string): void {
  if (!IMAGE_KEY_PATTERN.test(imageKey)) {
    throw new MediaLibraryValidationError(
      "INVALID_IMAGE_KEY",
      `"${imageKey}" is not a valid image_key. Use lowercase letters, numbers, hyphens, or ` +
        `underscores only (e.g. "home-hero-banner").`,
    );
  }
}
