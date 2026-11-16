import { describe, it, expect } from "vitest";
import {
  writeActivityLog,
  writeFailedLoginAttempt,
  writeSessionExpired,
} from "../src/activity-log";
import { createMockSupabase } from "./mock-supabase";

describe("activity-log — Activity Logging (Milestone 3)", () => {
  it("writes a login row with the given actor", async () => {
    const supabase = createMockSupabase();
    await writeActivityLog(supabase, { actorId: "a1", action: "login" });
    expect(supabase.__insertedRows).toHaveLength(1);
    expect(supabase.__insertedRows[0].row).toMatchObject({ actor_id: "a1", action: "login" });
  });

  it("writeFailedLoginAttempt records actorId=null with outcome metadata, never a new action value", async () => {
    const supabase = createMockSupabase();
    await writeFailedLoginAttempt(supabase, { ipAddress: "127.0.0.1" });
    const row = supabase.__insertedRows[0].row;
    expect(row.action).toBe("login"); // NOT 'failed_login' — chk_activity_log_action has no such value
    expect(row.actor_id).toBeNull();
    expect(row.metadata).toEqual({ outcome: "failed" });
  });

  it("writeSessionExpired records a logout row with outcome metadata, never a new action value", async () => {
    const supabase = createMockSupabase();
    await writeSessionExpired(supabase, "a1");
    const row = supabase.__insertedRows[0].row;
    expect(row.action).toBe("logout"); // NOT 'session_expired' — same constraint reason
    expect(row.actor_id).toBe("a1");
    expect(row.metadata).toEqual({ outcome: "session_expired" });
  });

  it("does not throw when the insert itself fails (observability must not break the request)", async () => {
    const supabase = createMockSupabase();
    supabase.from = () => ({
      insert: async () => ({ data: null, error: { message: "db unavailable" } }),
    });
    await expect(
      writeActivityLog(supabase, { actorId: "a1", action: "login" }),
    ).resolves.toBeUndefined();
  });
});
