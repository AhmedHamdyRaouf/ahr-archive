/**
 * @ahr/cms-core — public exports only (Coding Standards: "no deep imports
 * from outside a package's public exports").
 */

export {
  STATUS_VALUES,
  VISIBILITY_VALUES,
  VERIFICATION_STATUS_VALUES,
  isStatus,
  isVisibility,
  isVerificationStatus,
  assertValidTransition,
  getAllowedNextStatuses,
  InvalidStatusTransitionError,
} from "./status";
export type { EntityStatus, Visibility, VerificationStatus } from "./status";

export { slugify, generateSlugBase, generateUniqueSlug } from "./slug";

export type {
  FieldType,
  FieldDefinition,
  ResourceDefinition,
  PaginationParams,
  PaginationMeta,
  SortParams,
  FilterParams,
  ListQueryParams,
  ListResult,
  ApiResult,
} from "./types";

export {
  validateResource,
  assertValidResource,
  validatePartialResource,
  assertValidPartialResource,
  ValidationError,
} from "./validation";
export type { FieldError } from "./validation";

export {
  applyListQuery,
  normalizePagination,
  buildPaginationMeta,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "./query";
export type { QueryBuilderLike, ListQueryResult } from "./query";

export {
  genericList,
  genericCreate,
  genericUpdate,
  genericTransitionStatus,
  genericSoftDelete,
  genericRestore,
  genericHardDelete,
  genericForceDelete,
  NotFoundError,
  RepositoryError,
  ForceDeleteBlockedError,
} from "./repository";
export type { SupabaseLikeClient, RepositoryContext } from "./repository";

export { NoOpRevisionAdapter } from "./revision";
export type { RevisionAdapter, RevisionSnapshot } from "./revision";

export { RawIdMediaPickerAdapter } from "./media-picker";
export type { MediaPickerAdapter, MediaPickerSelection } from "./media-picker";
