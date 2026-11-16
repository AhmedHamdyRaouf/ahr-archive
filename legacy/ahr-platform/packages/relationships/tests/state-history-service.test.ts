import { describe, it, expect } from "vitest";
import { getStateHistory, getCurrentStatusFromHistory } from "../src/state-history-service";
import { createMockQueryClient } from "./mock-query-client";

const unordered = [
  {
    id: "t2",
    entity_table: "work",
    entity_id: "w1",
    from_status: "review",
    to_status: "verified",
    changed_by: "a1",
    changed_at: "2026-01-02T00:00:00Z",
    reason: null,
  },
  {
    id: "t1",
    entity_table: "work",
    entity_id: "w1",
    from_status: "draft",
    to_status: "review",
    changed_by: "a1",
    changed_at: "2026-01-01T00:00:00Z",
    reason: null,
  },
  {
    id: "t3",
    entity_table: "work",
    entity_id: "w1",
    from_status: "verified",
    to_status: "published",
    changed_by: "a1",
    changed_at: "2026-01-03T00:00:00Z",
    reason: null,
  },
];

describe("state-history-service — reads entity_state_transition (Milestone 7)", () => {
  it("getStateHistory returns rows sorted oldest-first regardless of query order", async () => {
    const client = createMockQueryClient({
      entity_state_transition: { data: unordered, count: 3, error: null },
    });
    const history = await getStateHistory(client, "work", "w1");
    expect(history.map((h) => h.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("getCurrentStatusFromHistory returns the most recent to_status", async () => {
    const client = createMockQueryClient({
      entity_state_transition: { data: unordered, count: 3, error: null },
    });
    const status = await getCurrentStatusFromHistory(client, "work", "w1");
    expect(status).toBe("published");
  });

  it("getCurrentStatusFromHistory returns null when there is no history", async () => {
    const client = createMockQueryClient({
      entity_state_transition: { data: [], count: 0, error: null },
    });
    const status = await getCurrentStatusFromHistory(client, "work", "w-new");
    expect(status).toBeNull();
  });

  it("throws a clear error on a query failure", async () => {
    const client = createMockQueryClient({
      entity_state_transition: { data: null, count: null, error: { message: "timeout" } },
    });
    await expect(getStateHistory(client, "work", "w1")).rejects.toThrow(/timeout/);
  });
});
