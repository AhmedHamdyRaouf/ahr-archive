import { describe, it, expect, vi } from "vitest";
import * as sessionModule from "../src/session";
import {
  requireSession,
  requireCapability,
  isAuthenticatedForRouteProtection,
  UnauthenticatedError,
  ForbiddenError,
} from "../src/policy";

const fakeCookies = {} as any;

describe("policy — Authorization / Route Protection (Milestone 3)", () => {
  it("requireSession throws UnauthenticatedError when there is no session", async () => {
    vi.spyOn(sessionModule, "getSession").mockResolvedValue({ authenticated: false });
    await expect(requireSession(fakeCookies)).rejects.toThrow(UnauthenticatedError);
  });

  it("requireSession returns the session when authenticated", async () => {
    const fakeSession = {
      authenticated: true as const,
      authUserId: "a1",
      platformUserId: "a1",
      personId: "p1",
      role: "administrator" as const,
    };
    vi.spyOn(sessionModule, "getSession").mockResolvedValue(fakeSession);
    const result = await requireSession(fakeCookies);
    expect(result).toEqual(fakeSession);
  });

  it("requireCapability throws Unauthenticated when there is no session at all", async () => {
    vi.spyOn(sessionModule, "getSession").mockResolvedValue({ authenticated: false });
    await expect(requireCapability(fakeCookies, "moderation:manage")).rejects.toThrow(
      UnauthenticatedError,
    );
  });

  it("requireCapability succeeds for administrator + any granted capability", async () => {
    vi.spyOn(sessionModule, "getSession").mockResolvedValue({
      authenticated: true,
      authUserId: "a1",
      platformUserId: "a1",
      personId: "p1",
      role: "administrator",
    });
    const result = await requireCapability(fakeCookies, "settings:manage");
    expect(result.authenticated).toBe(true);
  });

  it("isAuthenticatedForRouteProtection returns a boolean, never throws", async () => {
    vi.spyOn(sessionModule, "getSession").mockResolvedValue({ authenticated: false });
    await expect(isAuthenticatedForRouteProtection(fakeCookies)).resolves.toBe(false);

    vi.spyOn(sessionModule, "getSession").mockResolvedValue({
      authenticated: true,
      authUserId: "a1",
      platformUserId: "a1",
      personId: "p1",
      role: "administrator",
    });
    await expect(isAuthenticatedForRouteProtection(fakeCookies)).resolves.toBe(true);
  });

  it("ForbiddenError message references the capability that was missing", () => {
    const err = new ForbiddenError("moderation:manage");
    expect(err.message).toMatch(/moderation:manage/);
  });
});
