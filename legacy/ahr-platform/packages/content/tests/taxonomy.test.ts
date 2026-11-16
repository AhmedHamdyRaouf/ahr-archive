import { describe, it, expect } from "vitest";
import {
  supportsTaxonomy,
  assertCategoryDomainMatches,
  TaxonomyDomainMismatchError,
} from "../src/taxonomy";

describe("taxonomy — Content Taxonomy domain scoping (Milestone 5)", () => {
  it("only works and projects support taxonomy assignment", () => {
    expect(supportsTaxonomy("works")).toBe(true);
    expect(supportsTaxonomy("projects")).toBe(true);
    expect(supportsTaxonomy("persons")).toBe(false);
    expect(supportsTaxonomy("events")).toBe(false);
    expect(supportsTaxonomy("awards")).toBe(false);
    expect(supportsTaxonomy("contributions")).toBe(false);
  });

  it("accepts a matching domain for works (work_type)", () => {
    expect(() => assertCategoryDomainMatches("works", "work_type")).not.toThrow();
  });

  it("accepts a matching domain for projects (project_type)", () => {
    expect(() => assertCategoryDomainMatches("projects", "project_type")).not.toThrow();
  });

  it("rejects a project_type category on a work (domain mismatch)", () => {
    expect(() => assertCategoryDomainMatches("works", "project_type")).toThrow(
      TaxonomyDomainMismatchError,
    );
  });

  it("rejects a work_type category on a project (domain mismatch)", () => {
    expect(() => assertCategoryDomainMatches("projects", "work_type")).toThrow(
      TaxonomyDomainMismatchError,
    );
  });

  it("throws for an entity type with no taxonomy support at all", () => {
    expect(() => assertCategoryDomainMatches("persons", "work_type")).toThrow(
      /does not support taxonomy/,
    );
  });
});
