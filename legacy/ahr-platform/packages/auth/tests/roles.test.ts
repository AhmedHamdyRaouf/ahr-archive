import { describe, it, expect } from "vitest";
import {
  ACTIVE_ROLES,
  RESERVED_FUTURE_ROLES,
  isActiveRole,
  getCapabilities,
  roleHasCapability,
} from "../src/roles";

describe("roles — Authorization / Role Validation (Milestone 3)", () => {
  it("ACTIVE_ROLES contains exactly one role in V1, per Database Architecture §7", () => {
    expect(ACTIVE_ROLES).toEqual(["administrator"]);
  });

  it("does NOT invent Super Admin / Editor / Moderator / Contributor / Viewer anywhere", () => {
    const forbidden = ["super_admin", "admin", "editor", "moderator", "contributor", "viewer"];
    for (const role of forbidden) {
      expect(isActiveRole(role)).toBe(false);
    }
  });

  it("reserved future roles are NOT active today", () => {
    for (const role of RESERVED_FUTURE_ROLES) {
      expect(isActiveRole(role)).toBe(false);
    }
  });

  it("isActiveRole correctly identifies 'administrator'", () => {
    expect(isActiveRole("administrator")).toBe(true);
  });

  it("getCapabilities returns a non-empty list for 'administrator'", () => {
    const caps = getCapabilities("administrator");
    expect(caps.length).toBeGreaterThan(0);
    expect(caps).toContain("content:write");
    expect(caps).toContain("moderation:manage");
  });

  it("getCapabilities throws for any role outside ACTIVE_ROLES", () => {
    expect(() => getCapabilities("editor")).toThrow(/not active in Version 1/);
    expect(() => getCapabilities("trainer")).toThrow(/not active in Version 1/);
  });

  it("roleHasCapability returns false (not throws) for an inactive role", () => {
    expect(roleHasCapability("editor", "content:write")).toBe(false);
  });

  it("roleHasCapability returns true only for capabilities actually granted", () => {
    expect(roleHasCapability("administrator", "content:write")).toBe(true);
  });

  it("administrator has ai:suggest, matching the Permissions Matrix (08-Authentication-and-Authorization.md §5)", () => {
    expect(roleHasCapability("administrator", "ai:suggest")).toBe(true);
  });

  it("administrator has media-library:manage (@ahr/media-library, added 2026-07-24)", () => {
    expect(roleHasCapability("administrator", "media-library:manage")).toBe(true);
  });

  it("administrator has database:force-delete (genericForceDelete, added 2026-07-25)", () => {
    expect(roleHasCapability("administrator", "database:force-delete")).toBe(true);
  });
});
