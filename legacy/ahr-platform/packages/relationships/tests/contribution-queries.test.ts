import { describe, it, expect } from "vitest";
import {
  getContributionsForPerson,
  getContributionsForWork,
  getContributionsForProject,
  getContributionsForEvent,
  getPersonIdsForWork,
} from "../src/contribution-queries";
import { createMockQueryClient } from "./mock-query-client";

const sampleContributions = [
  { id: "c1", person_id: "p1", work_id: "w1", project_id: null, event_id: null, role: "composer" },
  { id: "c2", person_id: "p2", work_id: "w1", project_id: null, event_id: null, role: "singer" },
];

describe("contribution-queries — cross-entity queries via Contribution (Milestone 7)", () => {
  it("getContributionsForPerson queries by person_id", async () => {
    const client = createMockQueryClient({
      contribution: { data: sampleContributions, count: 2, error: null },
    });
    const result = await getContributionsForPerson(client, "p1");
    expect(result).toHaveLength(2);
  });

  it("getContributionsForWork queries by work_id", async () => {
    const client = createMockQueryClient({
      contribution: { data: sampleContributions, count: 2, error: null },
    });
    const result = await getContributionsForWork(client, "w1");
    expect(result).toHaveLength(2);
  });

  it("getContributionsForProject and getContributionsForEvent work identically for their own column", async () => {
    const client = createMockQueryClient({ contribution: { data: [], count: 0, error: null } });
    await expect(getContributionsForProject(client, "proj1")).resolves.toEqual([]);
    await expect(getContributionsForEvent(client, "ev1")).resolves.toEqual([]);
  });

  it("getPersonIdsForWork de-duplicates person ids across contributions", async () => {
    const withDuplicate = [...sampleContributions, { ...sampleContributions[0], id: "c3" }];
    const client = createMockQueryClient({
      contribution: { data: withDuplicate, count: 3, error: null },
    });
    const result = await getPersonIdsForWork(client, "w1");
    expect(result.sort()).toEqual(["p1", "p2"]);
  });

  it("throws a clear error on a query failure", async () => {
    const client = createMockQueryClient({
      contribution: { data: null, count: null, error: { message: "boom" } },
    });
    await expect(getContributionsForPerson(client, "p1")).rejects.toThrow(/boom/);
  });
});
