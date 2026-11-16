/**
 * The one place a Route Handler calls into for any Asset Library
 * operation — mirrors `@ahr/media`'s `service.ts` composition order:
 * permission check → validation → generic engine call → activity log.
 */

import {
  genericCreate,
  genericUpdate,
  genericTransitionStatus,
  genericSoftDelete,
  genericRestore,
  genericHardDelete,
  genericForceDelete,
  type RepositoryContext,
  type SupabaseLikeClient,
} from "@ahr/cms-core";
import { requireCapability, type CookieAdapter, type Session } from "@ahr/auth";
import { extractTransientMetadata, getMediaAccessUrl, type StorageAdapter } from "@ahr/media";
import { mediaLibraryDefinition } from "./definition";
import { buildLibraryStoragePath } from "./path";
import { assertImageMimeType, assertFileSizeWithinLimit, assertValidImageKey } from "./validation";
import type {
  MediaLibraryAssetRecord,
  UploadAssetInput,
  UpdateAssetMetadataInput,
} from "./types";

/** Dependency-injected activity logger — keeps this package testable without a concrete Supabase type. */
export interface MediaLibraryActivityLogger {
  log(input: {
    actorId: string;
    action: string;
    entityType: "media_library";
    entityId: string;
  }): Promise<void>;
}

export interface MediaLibraryServiceContext {
  cookies: CookieAdapter;
  db: SupabaseLikeClient;
  storage: StorageAdapter;
  activityLogger: MediaLibraryActivityLogger;
}

async function requireAssetLibrarySession(cookies: CookieAdapter): Promise<Session> {
  return requireCapability(cookies, "media-library:manage");
}

async function requireForceDeleteSession(cookies: CookieAdapter): Promise<Session> {
  // "database:force-delete" — deliberately separate from
  // "media-library:manage" (data owner decision, 2026-07-25). See
  // @ahr/cms-core's genericForceDelete for the full reasoning.
  return requireCapability(cookies, "database:force-delete");
}

/**
 * Full upload pipeline: validate → build path → upload to Storage →
 * create the `media_library` row → log the activity. Rolls back the
 * Storage object if the database write fails, same rule `@ahr/media`
 * follows (Development Specification 12 - File Upload Rules: "no
 * orphaned Storage object without a database row").
 */
export async function uploadAsset(
  ctx: MediaLibraryServiceContext,
  input: UploadAssetInput,
): Promise<MediaLibraryAssetRecord> {
  const session = await requireAssetLibrarySession(ctx.cookies);

  assertValidImageKey(input.imageKey);
  assertFileSizeWithinLimit(input.file.bytes.byteLength);
  assertImageMimeType(input.file.mimeType);

  const metadata = extractTransientMetadata(input.file.bytes, input.file.mimeType);

  // Generated client-side so the Storage path can be built before the row
  // exists — same reasoning as @ahr/media's uploadMedia.
  const assetId = crypto.randomUUID();
  const storagePath = buildLibraryStoragePath(assetId, input.file.fileName);

  await ctx.storage.upload(storagePath, input.file.bytes, input.file.mimeType);

  try {
    const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };
    const row = {
      id: assetId,
      image_key: input.imageKey,
      storage_path: storagePath,
      width: metadata.width,
      height: metadata.height,
      tags: input.tags ?? [],
      title_ar: input.titleAr ?? null,
      title_en: input.titleEn ?? null,
      alt_text_ar: input.altTextAr ?? null,
      alt_text_en: input.altTextEn ?? null,
      caption_ar: input.captionAr ?? null,
      caption_en: input.captionEn ?? null,
    };

    const created = (await genericCreate(
      mediaLibraryDefinition,
      repoCtx,
      row,
    )) as MediaLibraryAssetRecord;

    await ctx.activityLogger.log({
      actorId: session.platformUserId,
      action: "create",
      entityType: "media_library",
      entityId: created.id,
    });

    return created;
  } catch (error) {
    await ctx.storage.remove(storagePath).catch(() => {
      // Best-effort cleanup; the original error is what the caller needs to see.
    });
    throw error;
  }
}

/** Updates title/alt text/caption/tags — never `image_key`/`storage_path`/`width`/`height` (see definition.ts). */
export async function updateAssetMetadata(
  ctx: MediaLibraryServiceContext,
  id: string,
  input: UpdateAssetMetadataInput,
): Promise<MediaLibraryAssetRecord> {
  const session = await requireAssetLibrarySession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const row: Record<string, unknown> = {};
  if (input.titleAr !== undefined) row.title_ar = input.titleAr;
  if (input.titleEn !== undefined) row.title_en = input.titleEn;
  if (input.altTextAr !== undefined) row.alt_text_ar = input.altTextAr;
  if (input.altTextEn !== undefined) row.alt_text_en = input.altTextEn;
  if (input.captionAr !== undefined) row.caption_ar = input.captionAr;
  if (input.captionEn !== undefined) row.caption_en = input.captionEn;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.visibility !== undefined) row.visibility = input.visibility;
  if (input.focalX !== undefined) row.focal_x = input.focalX;
  if (input.focalY !== undefined) row.focal_y = input.focalY;

  const updated = (await genericUpdate(
    mediaLibraryDefinition,
    repoCtx,
    id,
    row,
  )) as MediaLibraryAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "update",
    entityType: "media_library",
    entityId: id,
  });

  return updated;
}

/** Draft→Review→Verified→Published→Archived, reusing @ahr/cms-core's generic transition. */
export async function transitionAssetStatus(
  ctx: MediaLibraryServiceContext,
  id: string,
  currentStatus: string,
  toStatus: string,
): Promise<MediaLibraryAssetRecord> {
  const session = await requireAssetLibrarySession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const result = (await genericTransitionStatus(
    mediaLibraryDefinition,
    repoCtx,
    id,
    currentStatus,
    toStatus,
  )) as MediaLibraryAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: toStatus === "published" ? "publish" : toStatus === "archived" ? "archive" : "update",
    entityType: "media_library",
    entityId: id,
  });

  return result;
}

export async function restoreAsset(
  ctx: MediaLibraryServiceContext,
  id: string,
): Promise<MediaLibraryAssetRecord> {
  const session = await requireAssetLibrarySession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  const result = (await genericRestore(mediaLibraryDefinition, repoCtx, id)) as MediaLibraryAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "restore",
    entityType: "media_library",
    entityId: id,
  });

  return result;
}

/**
 * "Delete" — No Hard Delete (Phase 1/4): a row that ever left `draft` is
 * archived, never removed, and its Storage object is kept, same as
 * `@ahr/media`'s `archiveMedia`. A row that has never left `draft` (an
 * upload entered in error) is genuinely removed — row AND Storage object
 * — per Data Lifecycle's one documented exception.
 */
export async function deleteAsset(
  ctx: MediaLibraryServiceContext,
  id: string,
  currentStatus: string,
  storagePath: string,
): Promise<MediaLibraryAssetRecord | null> {
  const session = await requireAssetLibrarySession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  if (currentStatus === "draft") {
    await genericHardDelete(mediaLibraryDefinition, repoCtx, id, currentStatus);
    await ctx.storage.remove(storagePath).catch(() => {
      // Best-effort cleanup — the row is already gone either way.
    });
    await ctx.activityLogger.log({
      actorId: session.platformUserId,
      action: "delete",
      entityType: "media_library",
      entityId: id,
    });
    return null;
  }

  const result = (await genericSoftDelete(
    mediaLibraryDefinition,
    repoCtx,
    id,
    currentStatus,
  )) as MediaLibraryAssetRecord;

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "archive",
    entityType: "media_library",
    entityId: id,
  });

  return result;
}

/**
 * Implements: data owner decision, 2026-07-25 — "Delete Permanently."
 * Genuinely irreversible on ANY status (unlike `deleteAsset` above, which
 * only truly removes a still-draft row) — gated behind the separate
 * "database:force-delete" capability. Also removes the Storage object
 * itself (best-effort): unlike archiving, where the file is deliberately
 * kept, there is no reason to leave an orphaned file behind once this
 * action's whole point is irreversible removal.
 */
export async function forceDeleteAsset(
  ctx: MediaLibraryServiceContext,
  id: string,
  storagePath: string,
): Promise<void> {
  const session = await requireForceDeleteSession(ctx.cookies);
  const repoCtx: RepositoryContext = { supabase: ctx.db, actorId: session.platformUserId };

  await genericForceDelete(mediaLibraryDefinition, repoCtx, id);
  await ctx.storage.remove(storagePath).catch(() => {
    // Best-effort — the database row is already gone either way.
  });

  await ctx.activityLogger.log({
    actorId: session.platformUserId,
    action: "force-delete",
    entityType: "media_library",
    entityId: id,
  });
}

/** Returns a permanent public URL for `public` assets, a short-lived signed URL otherwise — reuses @ahr/media's resolver as-is. */
export async function getAssetAccessUrl(
  ctx: Pick<MediaLibraryServiceContext, "storage">,
  asset: Pick<MediaLibraryAssetRecord, "storage_path" | "visibility">,
  signedUrlExpirySeconds = 3600,
): Promise<string> {
  return getMediaAccessUrl(ctx, asset, signedUrlExpirySeconds);
}
