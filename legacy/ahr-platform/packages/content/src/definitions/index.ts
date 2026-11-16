import type { ResourceDefinition } from "@ahr/cms-core";
import { personDefinition } from "./person";
import { organizationDefinition } from "./organization";
import { workDefinition } from "./work";
import { projectDefinition } from "./project";
import { eventDefinition } from "./event";
import { awardDefinition } from "./award";
import { categoryDefinition } from "./category";
import { tagDefinition } from "./tag";
import { pressMentionDefinition } from "./press-mention";
import { contributionDefinition } from "./contribution";
import { externalPlatformDefinition } from "./external-platform";

/**
 * Implements: API Specification 03 - CMS API — the `entityType` path
 * segment enum. This is the ONE registry mapping an entityType string to
 * its ResourceDefinition — every page/Route Handler looks a definition up
 * here, none of them hardcode a switch statement of their own (Coding
 * Standards, API Conventions doc 15 "generic entity family").
 */
export const ENTITY_DEFINITIONS = {
  persons: personDefinition,
  organizations: organizationDefinition,
  works: workDefinition,
  projects: projectDefinition,
  events: eventDefinition,
  awards: awardDefinition,
  categories: categoryDefinition,
  tags: tagDefinition,
  "press-mentions": pressMentionDefinition,
  contributions: contributionDefinition,
  "external-platforms": externalPlatformDefinition,
} as const satisfies Record<string, ResourceDefinition>;

export type EntityType = keyof typeof ENTITY_DEFINITIONS;

export function isEntityType(value: string): value is EntityType {
  return value in ENTITY_DEFINITIONS;
}

export function getDefinition(entityType: string): ResourceDefinition {
  if (!isEntityType(entityType)) {
    throw new Error(`NOT_FOUND — unrecognized entityType "${entityType}".`);
  }
  return ENTITY_DEFINITIONS[entityType];
}

export {
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
};
