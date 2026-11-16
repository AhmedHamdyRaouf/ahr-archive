import { describe, it, expect } from "vitest";
import { getAwardsForOrganization, getAwardsForPerson } from "../src/award-queries";
import { createMockQueryClient } from "./mock-query-client";

describe("award-queries — cross-entity queries via Award (Milestone 7)", () => {
  it("getAwardsForOrganization queries by organization_id", async () => {
    const client = createMockQueryClient({
      award: { data: [{ id: "a1", organization_id: "org1" }], count: 1, error: null },
    });
    const result = await getAwardsForOrganization(client, "org1");
    expect(result).toHaveLength(1);
  });

  it("getAwardsForPerson queries by person_id", async () => {
    const client = createMockQueryClient({
      award: { data: [{ id: "a1", person_id: "p1" }], count: 1, error: null },
    });
    const result = await getAwardsForPerson(client, "p1");
    expect(result).toHaveLength(1);
  });

  it("throws a clear error on failure", async () => {
    const client = createMockQueryClient({
      award: { data: null, count: null, error: { message: "down" } },
    });
    await expect(getAwardsForOrganization(client, "org1")).rejects.toThrow(/down/);
  });
});
