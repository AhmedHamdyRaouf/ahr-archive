import { describe, it, expect } from "vitest";
import {
  computeMatchScore,
  computeVerificationBonus,
  computeRecencyBonus,
  computeRelevanceScore,
} from "../src/relevance";

describe("relevance — deterministic search ranking heuristic (Milestone 9)", () => {
  it("scores an exact match highest", () => {
    expect(computeMatchScore("hello", "hello", "")).toBeGreaterThan(
      computeMatchScore("hel", "hello", ""),
    );
  });

  it("scores a prefix match above a plain substring match", () => {
    const prefixScore = computeMatchScore("hel", "hello world", "");
    const substringScore = computeMatchScore("lo wo", "hello world", "");
    expect(prefixScore).toBeGreaterThan(substringScore);
  });

  it("is case-insensitive", () => {
    expect(computeMatchScore("HELLO", "hello", "")).toBe(computeMatchScore("hello", "hello", ""));
  });

  it("checks both Arabic and English fields independently, taking the best match", () => {
    const scoreArMatch = computeMatchScore("مرحبا", "مرحبا", "hello");
    const scoreEnMatch = computeMatchScore("hello", "مرحبا", "hello");
    expect(scoreArMatch).toBe(scoreEnMatch); // both are exact matches, just in different fields
  });

  it("returns 0 for no match at all", () => {
    expect(computeMatchScore("xyz", "hello", "world")).toBe(0);
  });

  it("returns 0 for an empty query", () => {
    expect(computeMatchScore("", "hello", "world")).toBe(0);
  });

  it("computeVerificationBonus rewards 'verified' only", () => {
    expect(computeVerificationBonus("verified")).toBeGreaterThan(0);
    expect(computeVerificationBonus("pending")).toBe(0);
    expect(computeVerificationBonus("self_reported")).toBe(0);
    expect(computeVerificationBonus("archived")).toBe(0);
  });

  it("computeRecencyBonus is highest for a just-updated item and decays over time", () => {
    const now = new Date("2026-06-01T00:00:00Z");
    const justNow = computeRecencyBonus("2026-06-01T00:00:00Z", now);
    const sixMonthsAgo = computeRecencyBonus("2025-12-01T00:00:00Z", now);
    const overAYearAgo = computeRecencyBonus("2024-01-01T00:00:00Z", now);

    expect(justNow).toBeGreaterThan(sixMonthsAgo);
    expect(sixMonthsAgo).toBeGreaterThan(overAYearAgo);
    expect(overAYearAgo).toBe(0);
  });

  it("computeRecencyBonus never exceeds the match-score/verification signals in weight", () => {
    // A relevance signal check: recency alone should never be enough to
    // outrank a genuine substring match — it's a tie-breaker, not primary.
    const now = new Date("2026-06-01T00:00:00Z");
    const recencyOnly = computeRecencyBonus("2026-06-01T00:00:00Z", now);
    const matchOnly = computeMatchScore("test", "test", "");
    expect(recencyOnly).toBeLessThan(matchOnly);
  });

  it("computeRelevanceScore combines all three signals", () => {
    const now = new Date("2026-06-01T00:00:00Z");
    const score = computeRelevanceScore(
      {
        query: "hello",
        titleAr: "",
        titleEn: "hello",
        verificationStatus: "verified",
        updatedAt: "2026-06-01T00:00:00Z",
      },
      now,
    );
    const matchOnly = computeMatchScore("hello", "", "hello");
    const verifiedOnly = computeVerificationBonus("verified");
    const recencyOnly = computeRecencyBonus("2026-06-01T00:00:00Z", now);
    expect(score).toBe(matchOnly + verifiedOnly + recencyOnly);
  });
});
