/**
 * Implements: Content Taxonomy (Phase 3) domain scoping; API Specification
 * 03 - CMS API, "Assign Taxonomy" — "each categoryId's domain must match
 * the entity type... else TAXONOMY_DOMAIN_MISMATCH."
 */

export class TaxonomyDomainMismatchError extends Error {
  constructor(entityType: string, expectedDomain: string, actualDomain: string) {
    super(
      `TAXONOMY_DOMAIN_MISMATCH — "${entityType}" requires categories with domain ` +
        `"${expectedDomain}", but the given category has domain "${actualDomain}".`,
    );
    this.name = "TaxonomyDomainMismatchError";
  }
}

/**
 * Maps the two entity types that have taxonomy join tables (Database
 * Architecture §2: `work_category`/`work_tag`, `project_category`/
 * `project_tag`) to the Category `domain` value they're allowed to use.
 * No other entity type appears here — Person/Event/Award/Organization/
 * Press Mention/Contribution have no taxonomy join table in the frozen
 * schema, so taxonomy assignment is simply not offered for them (matching
 * CMS API §"Assign Taxonomy": "Calling this on persons/events/awards/
 * contributions returns 404 NOT_FOUND").
 */
const TAXONOMY_DOMAIN_BY_ENTITY_TYPE: Record<string, string> = {
  works: "work_type",
  projects: "project_type",
};

export function supportsTaxonomy(entityType: string): boolean {
  return entityType in TAXONOMY_DOMAIN_BY_ENTITY_TYPE;
}

export function assertCategoryDomainMatches(entityType: string, categoryDomain: string): void {
  const expectedDomain = TAXONOMY_DOMAIN_BY_ENTITY_TYPE[entityType];
  if (!expectedDomain) {
    throw new Error(`"${entityType}" does not support taxonomy assignment.`);
  }
  if (categoryDomain !== expectedDomain) {
    throw new TaxonomyDomainMismatchError(entityType, expectedDomain, categoryDomain);
  }
}
