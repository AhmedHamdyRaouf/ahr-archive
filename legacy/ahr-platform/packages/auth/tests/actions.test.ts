import { describe, it, expect, vi } from "vitest";
import * as supabaseClientModule from "../src/supabase-client";
import { signIn, signOut, requestPasswordReset, resetPassword, checkSession } from "../src/actions";
import { createMockSupabase } from "./mock-supabase";

const fakeCookies = {} as any;

function mockCreateClient(mock: ReturnType<typeof createMockSupabase>) {
  vi.spyOn(supabaseClientModule, "createRequestScopedClient").mockReturnValue(mock as any);
}

describe("actions — Authentication flow (Milestone 3)", () => {
  it("signIn succeeds and writes a login activity_log row for a valid administrator", async () => {
    const mock = createMockSupabase({
      authUser: { id: "auth-user-1" },
      platformUserRow: { id: "auth-user-1", person_id: "person-1", role: "administrator" },
    });
    mockCreateClient(mock);

    const result = await signIn(fakeCookies, { email: "a@example.com", password: "correct" });
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ sessionEstablished: true });
    expect(mock.__insertedRows[0].row).toMatchObject({ action: "login", actor_id: "auth-user-1" });
  });

  it("signIn fails generically on wrong credentials, and logs a failed attempt with no actor", async () => {
    const mock = createMockSupabase({ signInError: { message: "invalid_grant" } });
    mockCreateClient(mock);

    const result = await signIn(fakeCookies, { email: "a@example.com", password: "wrong" });
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe("UNAUTHENTICATED");
    expect(result.error?.message).toBe("Invalid credentials."); // generic — no field-specific detail
    expect(mock.__insertedRows[0].row).toMatchObject({ action: "login", actor_id: null });
  });

  it("signIn fails and signs the Supabase session back out if platform_user resolution fails", async () => {
    const mock = createMockSupabase({
      authUser: { id: "auth-user-1" },
      platformUserRow: null, // provisioning error
    });
    mockCreateClient(mock);

    const result = await signIn(fakeCookies, { email: "a@example.com", password: "correct" });
    expect(result.error?.code).toBe("UNAUTHENTICATED");
    expect(mock.auth.signOut).toHaveBeenCalled();
  });

  it("signOut writes a logout row when a session existed", async () => {
    const mock = createMockSupabase({
      authUser: { id: "auth-user-1" },
      platformUserRow: { id: "auth-user-1", person_id: "person-1", role: "administrator" },
    });
    mockCreateClient(mock);

    const result = await signOut(fakeCookies);
    expect(result.data).toEqual({ signedOut: true });
    expect(mock.__insertedRows[0].row).toMatchObject({ action: "logout", actor_id: "auth-user-1" });
  });

  it("requestPasswordReset always returns requested:true regardless of whether the email exists", async () => {
    const mock = createMockSupabase();
    mockCreateClient(mock);

    const result = await requestPasswordReset(fakeCookies, { email: "nonexistent@example.com" });
    expect(result.data).toEqual({ requested: true });
    expect(result.error).toBeNull();
  });

  it("resetPassword returns a validation error if the update fails", async () => {
    const mock = createMockSupabase();
    mock.auth.updateUser = vi.fn().mockResolvedValue({ error: { message: "expired token" } });
    mockCreateClient(mock);

    const result = await resetPassword(fakeCookies, { newPassword: "newpass123" });
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("checkSession never throws — returns authenticated:false as a normal result", async () => {
    const mock = createMockSupabase({ authUser: null });
    mockCreateClient(mock);

    const result = await checkSession(fakeCookies);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ authenticated: false });
  });
});
