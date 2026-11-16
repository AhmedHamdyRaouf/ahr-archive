/**
 * @ahr/media-library — public exports only (Coding Standards: "no deep
 * imports from outside a package's public exports").
 */

export type {
  MediaLibraryAssetRecord,
  UploadAssetInput,
  UpdateAssetMetadataInput,
} from "./types";

export { buildLibraryStoragePath } from "./path";

export {
  MediaLibraryValidationError,
  assertImageMimeType,
  assertFileSizeWithinLimit,
  assertValidImageKey,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from "./validation";

export { mediaLibraryDefinition } from "./definition";

export {
  uploadAsset,
  updateAssetMetadata,
  transitionAssetStatus,
  restoreAsset,
  deleteAsset,
  forceDeleteAsset,
  getAssetAccessUrl,
} from "./service";
export type { MediaLibraryServiceContext, MediaLibraryActivityLogger } from "./service";
