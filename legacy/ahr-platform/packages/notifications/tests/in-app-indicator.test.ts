import { describe, it, expect, vi } from "vitest";
import { DerivedCountIndicator } from "../src/in-app-indicator";

describe("in-app-indicator — live, derived indicators (Milestone 11)", () => {
  it("computes the count fresh on every call by calling the injected function", async () => {
    const countFn = vi.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(5);
    const indicator = new DerivedCountIndicator("moderation_open_count", countFn);

    expect(await indicator.getCount()).toBe(3);
    expect(await indicator.getCount()).toBe(5);
    expect(countFn).toHaveBeenCalledTimes(2);
  });

  it("exposes a stable name", () => {
    const indicator = new DerivedCountIndicator("moderation_open_count", async () => 0);
    expect(indicator.name).toBe("moderation_open_count");
  });
});
