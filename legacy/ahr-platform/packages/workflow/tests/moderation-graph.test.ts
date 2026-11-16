import { describe, it, expect } from "vitest";
import {
  isModerationStatus,
  assertValidModerationTransition,
  getAllowedNextModerationStatuses,
  InvalidModerationTransitionError,
} from "../src/moderation-graph";

describe("moderation-graph — the report's own lifecycle (Milestone 10)", () => {
  it("matches the exact 4-stage sequence in chk_moderation_report_status", () => {
    expect(isModerationStatus("open")).toBe(true);
    expect(isModerationStatus("in_review")).toBe(true);
    expect(isModerationStatus("escalated")).toBe(true);
    expect(isModerationStatus("resolved")).toBe(true);
    expect(isModerationStatus("closed")).toBe(false);
  });

  it("allows open -> in_review", () => {
    expect(() => assertValidModerationTransition("open", "in_review")).not.toThrow();
  });

  it("allows in_review -> escalated and in_review -> resolved (a report can resolve directly, without escalation)", () => {
    expect(() => assertValidModerationTransition("in_review", "escalated")).not.toThrow();
    expect(() => assertValidModerationTransition("in_review", "resolved")).not.toThrow();
  });

  it("allows escalated -> resolved", () => {
    expect(() => assertValidModerationTransition("escalated", "resolved")).not.toThrow();
  });

  it("rejects skipping straight from open to resolved or escalated", () => {
    expect(() => assertValidModerationTransition("open", "resolved")).toThrow(
      InvalidModerationTransitionError,
    );
    expect(() => assertValidModerationTransition("open", "escalated")).toThrow(
      InvalidModerationTransitionError,
    );
  });

  it("treats 'resolved' as terminal — no further transition is allowed", () => {
    expect(getAllowedNextModerationStatuses("resolved")).toEqual([]);
    expect(() => assertValidModerationTransition("resolved", "open")).toThrow(
      InvalidModerationTransitionError,
    );
  });

  it("does not allow reopening an escalated report back to in_review (no such path is documented)", () => {
    expect(() => assertValidModerationTransition("escalated", "in_review")).toThrow(
      InvalidModerationTransitionError,
    );
  });
});
