/**
 * @ahr/content — public exports only (Coding Standards: "no deep imports
 * from outside a package's public exports").
 */

export {
  ENTITY_DEFINITIONS,
  isEntityType,
  getDefinition,
  personDefinition,
  organizationDefinition,
  workDefinition,
  projectDefinition,
  eventDefinition,
  awardDefinition,
  categoryDefinition,
  tagDefinition,
  pressMentionDefinition,
  contributionDefinition,
  externalPlatformDefinition,
} from "./definitions";
export type { EntityType } from "./definitions";

export {
  BusinessRuleError,
  assertContributionHasTarget,
  assertPressMentionHasSubject,
  assertHasContributionBeforePublish,
  CONTRIBUTION_REQUIRED_BEFORE_PUBLISH,
} from "./business-rules";
export type { ContributionCheckClient } from "./business-rules";

export {
  TaxonomyDomainMismatchError,
  supportsTaxonomy,
  assertCategoryDomainMatches,
} from "./taxonomy";

export { listRelatedMedia, attachExistingMedia } from "./media-relations";
export type { MediaOwnerType, MediaRelationsClient } from "./media-relations";

export {
  createEntity,
  updateEntity,
  transitionEntityStatus,
  deleteEntity,
  restoreEntity,
  forceDeleteEntity,
  bulkTransitionEntityStatus,
} from "./service";
export type {
  ContentServiceClient,
  ContentServiceContext,
  ActivityLogger,
  BulkTransitionItem,
  BulkTransitionResult,
} from "./service";
