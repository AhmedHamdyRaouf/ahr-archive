/**
 * Implements: Database Architecture (Frozen v1) §11 — Media Storage
 * Structure, verbatim: "media/{entity_table}/{entity_id}/{asset_id}.{ext}
 * ... The path is deliberately keyed by entity_table/entity_id, not by
 * public_id/slug — the file's location must never change just because a
 * slug is edited."
 *
 * One shared function — Development Specification 12 - File Upload Rules:
 * "constructed by one shared function, never inline per call site."
 */

import type { MediaOwnerType } from "./types";

export function extractFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1 || lastDot === fileName.length - 1) {
    return "bin"; // no discoverable extension — a safe, generic fallback rather than throwing
  }
  return fileName.slice(lastDot + 1).toLowerCase();
}

export function buildStoragePath(
  ownerType: MediaOwnerType,
  ownerId: string,
  assetId: string,
  fileName: string,
): string {
  const ext = extractFileExtension(fileName);
  return `${ownerType}/${ownerId}/${assetId}.${ext}`;
}
