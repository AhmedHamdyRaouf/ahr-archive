import { describe, it, expect } from "vitest";
import { ENTITY_DEFINITIONS, isEntityType, getDefinition } from "../src/definitions";

describe("definitions — entity registry matches the Frozen v1 Database Architecture (Milestone 5)", () => {
  it("registers exactly the 11 entities this milestone covers", () => {
    expect(Object.keys(ENTITY_DEFINITIONS).sort()).toEqual(
      [
        "persons",
        "organizations",
        "works",
        "projects",
        "events",
        "awards",
        "categories",
        "tags",
        "press-mentions",
        "contributions",
        "external-platforms",
      ].sort(),
    );
  });

  it("every definition's tableName matches a real Frozen v1 table name (singular, snake_case)", () => {
    const expectedTableNames: Record<string, string> = {
      persons: "person",
      organizations: "organization",
      works: "work",
      projects: "project",
      events: "event",
      awards: "award",
      categories: "category",
      tags: "tag",
      "press-mentions": "press_mention",
      contributions: "contribution",
      "external-platforms": "external_platform",
    };
    for (const [entityType, definition] of Object.entries(ENTITY_DEFINITIONS)) {
      expect(definition.tableName).toBe(expectedTableNames[entityType]);
    }
  });

  it("only Person, Work, Organization, Project, Event have a slug (Identifier Strategy, Database Architecture §5)", () => {
    const expectedHasSlug: Record<string, boolean> = {
      persons: true,
      works: true,
      organizations: true,
      projects: true,
      events: true,
      awards: false,
      categories: false,
      tags: false,
      "press-mentions": false,
      contributions: false,
      "external-platforms": false,
    };
    for (const [entityType, definition] of Object.entries(ENTITY_DEFINITIONS)) {
      expect(definition.hasSlug).toBe(expectedHasSlug[entityType]);
    }
  });

  it("work_type options match chk_work_type exactly", () => {
    const workTypeField = ENTITY_DEFINITIONS.works.fields.find((f) => f.name === "work_type");
    expect(workTypeField?.options).toEqual([
      "song",
      "album",
      "theatre",
      "tv_series",
      "film",
      "soundtrack",
      "arrangement",
      "choir",
      "concert",
    ]);
  });

  it("project_type options match chk_project_type exactly", () => {
    const projectTypeField = ENTITY_DEFINITIONS.projects.fields.find(
      (f) => f.name === "project_type",
    );
    expect(projectTypeField?.options).toEqual([
      "training",
      "jury",
      "cultural",
      "educational",
      "choir_direction",
      "initiative",
    ]);
  });

  it("contribution role options match chk_contribution_role exactly", () => {
    const roleField = ENTITY_DEFINITIONS.contributions.fields.find((f) => f.name === "role");
    expect(roleField?.options).toEqual([
      "composer",
      "arranger",
      "producer",
      "lyricist",
      "singer",
      "director",
      "music_director",
      "conductor",
      "performer",
    ]);
  });

  it("award.organization_id is required (chk: organization_id not null)", () => {
    const orgField = ENTITY_DEFINITIONS.awards.fields.find((f) => f.name === "organization_id");
    expect(orgField?.required).toBe(true);
  });

  it("category.domain options are exactly work_type/project_type", () => {
    const domainField = ENTITY_DEFINITIONS.categories.fields.find((f) => f.name === "domain");
    expect(domainField?.options).toEqual(["work_type", "project_type"]);
  });

  it("isEntityType/getDefinition reject unrecognized entity types", () => {
    expect(isEntityType("students")).toBe(false); // Release 2 concept — must not resolve here
    expect(() => getDefinition("students")).toThrow(/NOT_FOUND/);
  });
});
