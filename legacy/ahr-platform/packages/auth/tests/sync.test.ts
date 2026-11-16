import { describe, it, expect } from "vitest";
import { resolvePlatformUser, PlatformUserProvisioningError } from "../src/sync";
import { createMockSupabase } from "./mock-supabase";

describe("sync — platform_user Synchronization (Milestone 3)", () => {
  it("resolves an existing platform_user row by auth.users.id", async () => {
    const supabase = createMockSupabase({
      platformUserRow: { id: "auth-user-1", person_id: "person-1", role: "administrator" },
    });
    const identity = await resolvePlatformUser(supabase, "auth-user-1");
    expect(identity).toEqual({
      platformUserId: "auth-user-1",
      personId: "person-1",
      role: "administrator",
    });
  });

  it("throws PlatformUserProvisioningError when no row exists — never auto-creates one", async () => {
    const supabase = createMockSupabase({ platformUserRow: null });
    await expect(resolvePlatformUser(supabase, "auth-user-2")).rejects.toThrow(
      PlatformUserProvisioningError,
    );
  });

  it("provisioning error message references the frozen no-self-registration rule", async () => {
    const supabase = createMockSupabase({ platformUserRow: null });
    await expect(resolvePlatformUser(supabase, "auth-user-2")).rejects.toThrow(
      /never self-registered/,
    );
  });

  it("propagates a database error distinctly from a missing row", async () => {
    const supabase = createMockSupabase({
      platformUserRow: null,
      platformUserError: { message: "connection lost" },
    });
    await expect(resolvePlatformUser(supabase, "auth-user-3")).rejects.toThrow(
      /Failed to resolve platform_user/,
    );
  });
});
