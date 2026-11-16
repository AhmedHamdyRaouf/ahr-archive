/**
 * @ahr/media — public exports only (Coding Standards: "no deep imports
 * from outside a package's public exports").
 *
 * See docs/blocked-metadata.md for capabilities requested for Milestone 6
 * that the Frozen v1 Database Architecture does not support.
 */

export { MEDIA_TYPES, MEDIA_OWNER_TYPES, OWNER_COLUMN } from "./types";
export type {
  MediaType,
  MediaOwnerType,
  MediaAssetRecord,
  TransientFileMetadata,
  UploadMediaInput,
  UploadMediaResult,
} from "./types";

export type { StorageAdapter, StorageUploadResult } from "./storage-adapter";
export { SupabaseStorageAdapter } from "./supabase-storage-adapter";

export { extractFileExtension, buildStoragePath } from "./path";
export { extractTransientMetadata } from "./file-metadata";

export {
  MediaValidationError,
  deriveMediaType,
  assertFileSizeWithinLimit,
  assertExactlyOneOwner,
  ownerTypeToColumn,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from "./validation";

export { mediaAssetDefinition } from "./definition";

export {
  uploadMedia,
  updateMediaCaption,
  transitionMediaStatus,
  archiveMedia,
  forceDeleteMedia,
  restoreMedia,
  replaceMediaFile,
  getMediaAccessUrl,
} from "./service";
export type { MediaServiceContext, MediaActivityLogger } from "./service";
