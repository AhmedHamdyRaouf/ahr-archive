import { describe, it, expect } from "vitest";
import { getPressMentionsForSubject } from "../src/press-mention-queries";
import { createMockQueryClient } from "./mock-query-client";

describe("press-mention-queries — cross-entity queries via subject (Milestone 7)", () => {
  it("queries press_mention by the correct column per subject type", async () => {
    const client = createMockQueryClient({
      press_mention: { data: [{ id: "pm1", publication_name: "Al Ahram" }], count: 1, error: null },
    });
    await expect(getPressMentionsForSubject(client, "person", "p1")).resolves.toHaveLength(1);
    await expect(getPressMentionsForSubject(client, "work", "w1")).resolves.toHaveLength(1);
    await expect(getPressMentionsForSubject(client, "event", "e1")).resolves.toHaveLength(1);
    await expect(getPressMentionsForSubject(client, "organization", "o1")).resolves.toHaveLength(1);
  });

  it("throws on a query error", async () => {
    const client = createMockQueryClient({
      press_mention: { data: null, count: null, error: { message: "unavailable" } },
    });
    await expect(getPressMentionsForSubject(client, "person", "p1")).rejects.toThrow(/unavailable/);
  });
});
