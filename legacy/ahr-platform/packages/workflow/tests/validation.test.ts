import { describe, it, expect } from "vitest";
import {
  assertResolutionNotesProvided,
  assertReasonProvided,
  ModerationValidationError,
} from "../src/validation";

describe("validation — moderation-specific rules (Milestone 10)", () => {
  it("requires resolutionNotes when resolving", () => {
    expect(() => assertResolutionNotesProvided("resolved", undefined)).toThrow(
      ModerationValidationError,
    );
    expect(() => assertResolutionNotesProvided("resolved", "")).toThrow(ModerationValidationError);
    expect(() => assertResolutionNotesProvided("resolved", "   ")).toThrow(
      ModerationValidationError,
    );
  });

  it("does not require resolutionNotes for any other transition", () => {
    expect(() => assertResolutionNotesProvided("in_review", undefined)).not.toThrow();
    expect(() => assertResolutionNotesProvided("escalated", undefined)).not.toThrow();
  });

  it("accepts a valid resolutionNotes value", () => {
    expect(() =>
      assertResolutionNotesProvided("resolved", "Verified with the rights holder."),
    ).not.toThrow();
  });

  it("requires a non-empty reason to open a report", () => {
    expect(() => assertReasonProvided("")).toThrow(ModerationValidationError);
    expect(() => assertReasonProvided("   ")).toThrow(ModerationValidationError);
    expect(() => assertReasonProvided("Possible copyright issue")).not.toThrow();
  });
});
