/**
 * Implements: Milestone 6's "File information (size, MIME type, etc.),
 * Dimensions (images/videos), Duration (audio/video)" requirement — as
 * TRANSIENT metadata only (docs/blocked-metadata.md §5: no persisted
 * column exists for any of this).
 *
 * Dimension/duration detection here is intentionally minimal: PNG
 * dimensions are parsed from the file's own header bytes (a well-defined,
 * dependency-free format), which is enough to prove the extraction path
 * works end-to-end. JPEG/GIF dimension parsing and audio/video duration
 * parsing require a dedicated parsing library this project does not
 * currently depend on — those return `null` rather than a wrong guess.
 * Widening format coverage is an additive change to this one file, not a
 * redesign, whenever such a dependency is approved.
 */

import type { TransientFileMetadata } from "./types";

function parsePngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24) return null;
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return null;
  }
  // IHDR chunk: bytes 16-19 = width, 20-23 = height, big-endian.
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  return { width, height };
}

export function extractTransientMetadata(
  bytes: Uint8Array,
  mimeType: string,
): TransientFileMetadata {
  const base: TransientFileMetadata = {
    fileSizeBytes: bytes.byteLength,
    mimeType,
    width: null,
    height: null,
    durationSeconds: null,
  };

  if (mimeType === "image/png") {
    const dimensions = parsePngDimensions(bytes);
    if (dimensions) {
      return { ...base, width: dimensions.width, height: dimensions.height };
    }
  }

  return base;
}
