import { describe, it, expect } from "vitest";
import { getSessionForClient } from "../src/session";
import { createMockSupabase } from "./mock-supabase";

describe("session — Session Handling (Milestone 3)", () => {
  it("returns unauthenticated when there is no auth user", async () => {
    const supabase = createMockSupabase({ authUser: null });
    const result = await getSessionForClient(supabase);
    expect(result.authenticated).toBe(false);
  });

  it("returns unauthenticated when Supabase Auth errors", async () => {
    const supabase = createMockSupabase({ authUser: null, authError: { message: "expired" } });
    const result = await getSessionForClient(supabase);
    expect(result.authenticated).toBe(false);
  });

  it("returns unauthenticated (provisioning error) when no platform_user row exists", async () => {
    const supabase = createMockSupabase({
      authUser: { id: "auth-user-1" },
      platformUserRow: null,
    });
    const result = await getSessionForClient(supabase);
    expect(result.authenticated).toBe(false);
  });

  it("returns unauthenticated if platform_user.role is not an active V1 role", async () => {
    const supabase = createMockSupabase({
      authUser: { id: "auth-user-1" },
      platformUserRow: { id: "auth-user-1", person_id: "person-1", role: "editor" },
    });
    const result = await getSessionForClient(supabase);
    expect(result.authenticated).toBe(false);
  });

  it("returns a fully-resolved session for a valid administrator", async () => {
    const supabase = createMockSupabase({
      authUser: { id: "auth-user-1" },
      platformUserRow: { id: "auth-user-1", person_id: "person-1", role: "administrator" },
    });
    const result = await getSessionForClient(supabase);
    expect(result.authenticated).toBe(true);
    if (result.authenticated) {
      expect(result.authUserId).toBe("auth-user-1");
      expect(result.personId).toBe("person-1");
      expect(result.role).toBe("administrator");
    }
  });
});
