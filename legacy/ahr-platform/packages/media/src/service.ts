/**
 * Implements: Milestone 6 — Upload pipeline, Services, File lifecycle.
 * This is the one place a Route Handler calls into for any media
 * operation — mirrors `@ahr/content`'s `service.ts` composition order:
 * permission check → validation → generic engine call → activity log.
 */

import {
  genericCreate,
  genericUpdate,
  genericTransitionStatus,
  genericSoftDelete,
  genericRestore,
  genericForceDelete,
  type RepositoryContext,
  type SupabaseLikeClient,
} from "@ahr/cms-core";
import { requireCapability, type CookieAdapter, type Session } from "@ahr/auth";
import { mediaAssetDefinition } from "./definition";
import { buildStoragePath } from "./path";
import { extractTransientMetadata } from "./file-metadata";
import {
  deriveMediaType,
  assertFileSizeWithinLimit,
  assertExactlyOneOwner,
  ownerTypeToColumn,
} from "./validation";
import type { StorageAdapter } from "./storage-adapter";
import type {
  MediaOwnerType,
  UploadMediaInput,
  UploadMediaResult,
  MediaAssetRecord,
} from "./types";

/**
 * Dependency-injected activity logger — same rationale as
 * `@ahr/content/src/service.ts`: keeps this package independently testable
 * without requiring the concrete `@supabase/supabase-js` client type.
 */
export interface MediaActivityLogger {
  log(input: {
    actorId: string;
    action: string;
    entityType: "media_asset";
    entityId: string;
  }): Promise<void>;
}

export interface MediaServiceContext {
  cookies: CookieAdapter;
  db: SupabaseLikeClient;
  storage: StorageAdapter;
  activityLogger: MediaActivityLogger;
}

async function requireMediaSession(cookies: CookieAdapter): Promise<Session> {
  // "media:manage" — Permissions Matrix (API Specification 14).
  return requireCapability(cookies, "media:manage");
}

async function requireForceDeleteSession(cookies: CookieAdapter): Promise<Session> {
  // "database:force-delete" — deliberately separate from "media:manage"
  // (data owner decision, 2026-07-25). See @ahr/cms-core's
  // genericForceDelete for the full reasoning.
  return requireCapability(cookies, "database:force-delete");
}

/**
 * The full upload pipeline: validate → build path → upload to Storage →
 * create the `media_asset` row → log the activity. If the database write
 * fails after a successful Storage upload, the uploaded object is removed
 * (Development Specification 12 - File Upload Rules: "no orphaned Storage
 * object without a database row").
 */
export async function uploadMedia(
  ctx: MediaServiceContext,
  input: UploadMediaInput,
): Promise<UploadMediaResult> {
  const session = await requireMediaSession(ctx.cookies);

  assertFileSizeWithinLimit(input.file.bytes.byteLength);
  const mediaType = deriveMediaType(input.file.mimeType); // throws UNSUPPORTED_MEDIA_TYPE for documents, etc.

  const ownerRecord = { [ownerTypeToColumn(input.ownerType)]: input.ownerId };
  assertExactlyOneOwner(ownerRecord);

  const transientMetadata = extractTransientMetadata(input.file.bytes, input.file.mimeType);

  // The asset id is generated client-side (crypto.randomUUID) so the
  // Storage path can be built BEFORE the database row exists — Database
  // Architecture §11's path shape is {entity_table}/{entity_id}/{asset_id}.{ext},
  // and the row's own `id` (uuid, default gen_random_uuid()) would not be
  // known yet if we waited for the insert first.
  const assetId = crypto.randomUUID();
  const storagePath = buildStoragePath(
    input.ownerType,
    input.ownerId,
    assetId,
    input.file.fileName,
  );

  await ctx.storage.upload(storagePath, input.file.bytes, input.file.mimeType);

  try {
    const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
    const row = {
      id: assetId,
      media_type: mediaType,
      storage_path: storagePath,
      caption_ar: input.captionAr ?? null,
      caption_en: input.captionEn ?? null,
      ...ownerRecord,
    };

    // genericCreate (via @ahr/cms-core) forces status='draft' and stamps
    // created_by/updated_by, and runs generic field validation (caption
    // pair) before the insert — see @ahr/cms-core/src/repository.ts.
    const created = (await genericCreate(mediaAssetDefinition, repoCtx, row)) as MediaAssetRecord;

    await ctx.activityLogger.log({
      actorId: session.platformUserId,
      action: "create",
      entityType: "media_asset",
      entityId: created.id,
    });

    return { asset: created, transientMetadata };
  } catch (error) {
    // Roll back the orphaned Storage object — the DB write failed.
    await ctx.storage.remove(storagePath).catch(() => {
      // Best-effort cleanup; the original error is what the caller needs to see.
    });
    throw error;
  }
}

/** Updates caption fields only — see definition.ts for why other fields aren't editable here. */
export async function updateMediaCaption(
  ctx: MediaServiceContext,
  id: string,
  input: { captionAr?: string; captionEn?: string },
): Promise<MediaAssetRecord> {
  const session = await requireMediaSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const row: Record<string, unknown> = {};
  if (input.captionAr !== undefined) row.caption_ar = input.captionAr;
  if (input.captionEn !== undefined) row.caption_en = input.captionEn;

  const updated = (await genericUpdate(mediaAssetDefinition, repoCtx, id, row)) as MediaAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: "media_asset",
    entityId: id,
  });

  return updated;
}

/** Implements: File lifecycle — Draft→Review→Verified→Published→Archived, reusing @ahr/cms-core's generic transition. */
export async function transitionMediaStatus(
  ctx: MediaServiceContext,
  id: string,
  currentStatus: string,
  toStatus: string,
): Promise<MediaAssetRecord> {
  const session = await requireMediaSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const result = (await genericTransitionStatus(
    mediaAssetDefinition,
    repoCtx,
    id,
    currentStatus,
    toStatus,
  )) as MediaAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: toStatus === "published" ? "publish" : toStatus === "archived" ? "archive" : "update",
    entityType: "media_asset",
    entityId: id,
  });

  return result;
}

/** Soft delete = archive (No Hard Delete, Phase 1/4) — the Storage object is NEVER removed here. */
export async function archiveMedia(
  ctx: MediaServiceContext,
  id: string,
  currentStatus: string,
): Promise<MediaAssetRecord> {
  const session = await requireMediaSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const result = (await genericSoftDelete(
    mediaAssetDefinition,
    repoCtx,
    id,
    currentStatus,
  )) as MediaAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "archive",
    entityType: "media_asset",
    entityId: id,
  });

  return result;
}

/**
 * Implements: data owner decision, 2026-07-25 — "Delete Permanently."
 * Genuinely irreversible on ANY status (unlike `archiveMedia` above) —
 * gated behind the separate "database:force-delete" capability. Also
 * removes the Storage object itself (best-effort): unlike archiving,
 * where the file is deliberately kept, there is no reason to leave an
 * orphaned file behind once this action's whole point is irreversible
 * removal.
 */
export async function forceDeleteMedia(
  ctx: MediaServiceContext,
  id: string,
  storagePath: string,
): Promise<void> {
  const session = await requireForceDeleteSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  await genericForceDelete(mediaAssetDefinition, repoCtx, id);
  await ctx.storage.remove(storagePath).catch(() => {
    // Best-effort — the database row is already gone either way.
  });

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "force-delete",
    entityType: "media_asset",
    entityId: id,
  });
}

export async function restoreMedia(
  ctx: MediaServiceContext,
  id: string,
): Promise<MediaAssetRecord> {
  const session = await requireMediaSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const result = (await genericRestore(mediaAssetDefinition, repoCtx, id)) as MediaAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "restore",
    entityType: "media_asset",
    entityId: id,
  });

  return result;
}

/**
 * Implements: Database Architecture (Frozen v1) §11.1 — Media Versioning
 * Strategy. Replace never overwrites the existing Storage object in
 * place: a NEW path is written, `storage_path` is updated to point at it,
 * and the old object is left in place (forward-compatible with a future
 * `media_asset_version` history table, per §11.1 — not built here).
 */
export async function replaceMediaFile(
  ctx: MediaServiceContext,
  id: string,
  ownerType: MediaOwnerType,
  ownerId: string,
  file: { bytes: Uint8Array; fileName: string; mimeType: string },
): Promise<MediaAssetRecord> {
  const session = await requireMediaSession(ctx.cookies);

  assertFileSizeWithinLimit(file.bytes.byteLength);
  deriveMediaType(file.mimeType); // validates the new file is still a supported type

  const newPath = buildStoragePath(ownerType, ownerId, id, file.fileName);
  await ctx.storage.upload(newPath, file.bytes, file.mimeType);

  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
  const updated = (await genericUpdate(mediaAssetDefinition, repoCtx, id, {
    storage_path: newPath,
  })) as MediaAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: "media_asset",
    entityId: id,
  });

  return updated;
}

/**
 * Returns the correct access URL for an asset's current `visibility`
 * (Database Architecture §8/§11): a permanent public URL for `public`
 * assets, a short-lived signed URL otherwise.
 */
export async function getMediaAccessUrl(
  ctx: Pick<MediaServiceContext, "storage">,
  asset: Pick<MediaAssetRecord, "storage_path" | "visibility">,
  signedUrlExpirySeconds = 3600,
): Promise<string> {
  if (asset.visibility === "public") {
    return ctx.storage.getPublicUrl(asset.storage_path);
  }
  return ctx.storage.createSignedUrl(asset.storage_path, signedUrlExpirySeconds);
}
