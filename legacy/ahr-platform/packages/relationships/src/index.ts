/**
 * @ahr/relationships — public exports only (Coding Standards: "no deep
 * imports from outside a package's public exports").
 */

export type {
  RelationshipQueryClient,
  RelationshipWriteClient,
  WorkCategoryLink,
  WorkTagLink,
  ProjectCategoryLink,
  ProjectTagLink,
  EntityStateTransitionRecord,
  EntityMetadata,
} from "./types";

export {
  getCategoriesForEntity,
  getTagsForEntity,
  setCategoriesForEntity,
  setTagsForEntity,
} from "./taxonomy-service";
export type { TaxonomyEntityType } from "./taxonomy-service";

export {
  getContributionsForPerson,
  getContributionsForWork,
  getContributionsForProject,
  getContributionsForEvent,
  getPersonIdsForWork,
} from "./contribution-queries";
export type { ContributionRow } from "./contribution-queries";

export { getPressMentionsForSubject } from "./press-mention-queries";
export type { PressMentionRow, PressMentionSubjectType } from "./press-mention-queries";

export { getAwardsForOrganization, getAwardsForPerson } from "./award-queries";
export type { AwardRow } from "./award-queries";

export { getChildWorks, getWorkAncestors } from "./work-hierarchy";
export type { WorkSummary } from "./work-hierarchy";

export { getChildCategories, getRootCategories } from "./category-hierarchy";
export type { CategorySummary } from "./category-hierarchy";

export { getStateHistory, getCurrentStatusFromHistory } from "./state-history-service";

export {
  updateVisibility,
  updateVerificationStatus,
  updateOwner,
  updateSource,
  InvalidMetadataValueError,
} from "./metadata-service";
export type { MetadataServiceContext, MetadataActivityLogger } from "./metadata-service";

export {
  ownerTypeToColumn,
  listPlatformLinksForEntity,
  createPlatformLink,
  updatePlatformLink,
  removePlatformLink,
  reorderPlatformLinks,
  PlatformLinkValidationError,
} from "./platform-link-service";
export type { PlatformLinkOwnerType, PlatformLinkRecord } from "./platform-link-service";
