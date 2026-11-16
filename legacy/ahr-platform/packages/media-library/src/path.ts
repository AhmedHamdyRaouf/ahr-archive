/**
 * Storage path construction for `media_library` assets. Unlike
 * `@ahr/media`'s `buildStoragePath` (keyed by owner entity, per Database
 * Architecture §11 — these assets have no owning entity by design), the
 * only stable identifier available is the asset's own id. One shared
 * function, never inlined per call site (same convention as `@ahr/media`).
 */

import { extractFileExtension } from "@ahr/media";

const LIBRARY_PATH_PREFIX = "library";

export function buildLibraryStoragePath(assetId: string, fileName: string): string {
  const ext = extractFileExtension(fileName);
  return `${LIBRARY_PATH_PREFIX}/${assetId}.${ext}`;
}
