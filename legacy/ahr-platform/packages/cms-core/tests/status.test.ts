import { describe, it, expect } from "vitest";
import {
  STATUS_VALUES,
  isStatus,
  isVisibility,
  isVerificationStatus,
  assertValidTransition,
  getAllowedNextStatuses,
  InvalidStatusTransitionError,
} from "../src/status";

describe("status — Draft/Published workflow (Milestone 4)", () => {
  it("matches the exact 5-stage sequence frozen in Database Architecture §6/§8", () => {
    expect(STATUS_VALUES).toEqual(["draft", "review", "verified", "published", "archived"]);
  });

  it("allows every documented forward transition", () => {
    expect(() => assertValidTransition("draft", "review")).not.toThrow();
    expect(() => assertValidTransition("review", "verified")).not.toThrow();
    expect(() => assertValidTransition("verified", "published")).not.toThrow();
    expect(() => assertValidTransition("published", "archived")).not.toThrow();
  });

  it("allows the one documented restore path: archived → published", () => {
    expect(() => assertValidTransition("archived", "published")).not.toThrow();
  });

  it("rejects skipping a stage (draft → published)", () => {
    expect(() => assertValidTransition("draft", "published")).toThrow(InvalidStatusTransitionError);
  });

  it("rejects skipping a stage (review → archived)", () => {
    expect(() => assertValidTransition("review", "archived")).toThrow(InvalidStatusTransitionError);
  });

  it("does NOT allow invented backward transitions not in the frozen spec (review → draft)", () => {
    expect(() => assertValidTransition("review", "draft")).toThrow(InvalidStatusTransitionError);
  });

  it("does NOT allow invented backward transitions not in the frozen spec (verified → review)", () => {
    expect(() => assertValidTransition("verified", "review")).toThrow(InvalidStatusTransitionError);
  });

  it("getAllowedNextStatuses reflects the same table used for validation", () => {
    expect(getAllowedNextStatuses("draft")).toEqual(["review"]);
    expect(getAllowedNextStatuses("published")).toEqual(["archived"]);
  });

  it("isStatus/isVisibility/isVerificationStatus reject values outside the frozen check constraints", () => {
    expect(isStatus("deleted")).toBe(false);
    expect(isVisibility("everyone")).toBe(false);
    expect(isVerificationStatus("confirmed")).toBe(false);
  });

  it("isStatus/isVisibility/isVerificationStatus accept the frozen values", () => {
    expect(isStatus("published")).toBe(true);
    expect(isVisibility("restricted")).toBe(true);
    expect(isVerificationStatus("self_reported")).toBe(true);
  });
});
