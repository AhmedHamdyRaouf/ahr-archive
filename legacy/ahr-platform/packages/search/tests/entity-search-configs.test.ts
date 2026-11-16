import { describe, it, expect } from "vitest";
import { ENTITY_SEARCH_CONFIGS, getSearchColumns } from "../src/entity-search-configs";
import { SEARCHABLE_ENTITY_TYPES } from "../src/types";

describe("entity-search-configs — matches the 5 entities named in Database Architecture §16 (Milestone 9)", () => {
  it("covers exactly the 5 searchable entity types, no more, no fewer", () => {
    expect(Object.keys(ENTITY_SEARCH_CONFIGS).sort()).toEqual([...SEARCHABLE_ENTITY_TYPES].sort());
  });

  it("maps each entity type to its real Frozen v1 table name", () => {
    expect(ENTITY_SEARCH_CONFIGS.persons.tableName).toBe("person");
    expect(ENTITY_SEARCH_CONFIGS.works.tableName).toBe("work");
    expect(ENTITY_SEARCH_CONFIGS.projects.tableName).toBe("project");
    expect(ENTITY_SEARCH_CONFIGS.events.tableName).toBe("event");
    expect(ENTITY_SEARCH_CONFIGS.organizations.tableName).toBe("organization");
  });

  it("uses 'name' for Person/Organization and 'title' for Work/Project/Event", () => {
    expect(ENTITY_SEARCH_CONFIGS.persons.titleColumn).toBe("name");
    expect(ENTITY_SEARCH_CONFIGS.organizations.titleColumn).toBe("name");
    expect(ENTITY_SEARCH_CONFIGS.works.titleColumn).toBe("title");
    expect(ENTITY_SEARCH_CONFIGS.projects.titleColumn).toBe("title");
    expect(ENTITY_SEARCH_CONFIGS.events.titleColumn).toBe("title");
  });

  it("getSearchColumns returns the correct bilingual column pair", () => {
    expect(getSearchColumns("persons")).toEqual(["name_ar", "name_en"]);
    expect(getSearchColumns("works")).toEqual(["title_ar", "title_en"]);
  });

  it("every entity type has a slug (public_id), per Identifier Strategy (all 5 have public_id columns)", () => {
    for (const config of Object.values(ENTITY_SEARCH_CONFIGS)) {
      expect(config.hasSlug).toBe(true);
    }
  });
});
