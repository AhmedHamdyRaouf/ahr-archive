import { describe, it, expect, vi } from "vitest";
import * as auth from "@ahr/auth";
import {
  openModerationReport,
  transitionModerationReport,
  assignModerationReport,
} from "../src/moderation-service";
import { ModerationValidationError } from "../src/validation";
import { InvalidModerationTransitionError } from "../src/moderation-graph";
import type { WorkflowContext, WorkflowActivityLogger } from "../src/types";
import type { SupabaseLikeClient } from "@ahr/cms-core";

// Same interception point proven since Milestone 5: service functions
// import `requireCapability` directly from "@ahr/auth" — that is the
// actual module-resolution boundary this test controls.
vi.mock("@ahr/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@ahr/auth")>();
  return { ...actual, requireCapability: vi.fn() };
});

const fakeCookies = {} as never;

const authenticatedSession = {
  authenticated: true as const,
  authUserId: "auth-1",
  platformUserId: "admin-1",
  personId: "person-1",
  role: "administrator" as const,
};

function createMockDb(
  overrides: {
    insertResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    updateResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
  } = {},
): SupabaseLikeClient {
  return {
    from: (_table: string) => ({
      select: () => ({
        range: function (this: unknown) {
          return this;
        },
        order: function (this: unknown) {
          return this;
        },
        eq: function (this: unknown) {
          return this;
        },
        or: function (this: unknown) {
          return this;
        },
        then: (fn: (r: unknown) => unknown) =>
          Promise.resolve(fn({ data: [], count: 0, error: null })),
      }),
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () =>
            overrides.insertResult ?? { data: { id: "new-report-id", ...row }, error: null },
        }),
      }),
      update: (row: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            single: async () =>
              overrides.updateResult ?? { data: { id: "existing-report-id", ...row }, error: null },
          }),
        }),
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  } as unknown as SupabaseLikeClient;
}

function createMockLogger(): WorkflowActivityLogger & { calls: unknown[] } {
  const calls: unknown[] = [];
  return { calls, log: async (input) => void calls.push(input) };
}

describe("moderation-service — Approval and review flows (Milestone 10)", () => {
  it("openModerationReport requires an authenticated session with moderation:manage", async () => {
    vi.mocked(auth.requireCapability).mockRejectedValue(new auth.UnauthenticatedError());
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };

    await expect(
      openModerationReport(ctx, {
        entityTable: "work",
        entityId: "w1",
        reason: "Copyright concern",
      }),
    ).rejects.toThrow(auth.UnauthenticatedError);
  });

  it("openModerationReport requires a non-empty reason", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };

    await expect(
      openModerationReport(ctx, { entityTable: "work", entityId: "w1", reason: "" }),
    ).rejects.toThrow(ModerationValidationError);
  });

  it("openModerationReport succeeds, starts at 'open', and logs a 'create' activity", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: logger,
    };

    const report = await openModerationReport(ctx, {
      entityTable: "work",
      entityId: "w1",
      reason: "Copyright concern",
    });

    expect(report.status).toBe("open");
    expect(report.reported_by).toBe("admin-1");
    expect(logger.calls).toContainEqual(
      expect.objectContaining({
        actorId: "admin-1",
        action: "create",
        entityType: "moderation_report",
      }),
    );
  });

  it("transitionModerationReport enforces the report's own lifecycle graph", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };

    await expect(transitionModerationReport(ctx, "r1", "open", "resolved")).rejects.toThrow(
      InvalidModerationTransitionError,
    );
  });

  it("transitionModerationReport requires resolutionNotes when resolving", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };

    await expect(transitionModerationReport(ctx, "r1", "in_review", "resolved")).rejects.toThrow(
      ModerationValidationError,
    );
  });

  it("transitionModerationReport succeeds when resolving with notes, and logs the activity", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb({ updateResult: { data: { id: "r1", status: "resolved" }, error: null } }),
      activityLogger: logger,
    };

    const report = await transitionModerationReport(ctx, "r1", "in_review", "resolved", {
      resolutionNotes: "Confirmed with the rights holder — no violation.",
    });

    expect(report.status).toBe("resolved");
    expect(logger.calls).toContainEqual(
      expect.objectContaining({
        actorId: "admin-1",
        action: "update",
        entityType: "moderation_report",
      }),
    );
  });

  it("transitionModerationReport writes an entity_state_transition row for entity_table='moderation_report'", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const calls: Array<{ table: string; row: unknown }> = [];
    const db = {
      from: (table: string) => ({
        insert: (row: Record<string, unknown>) => {
          calls.push({ table, row });
          return { select: () => ({ single: async () => ({ data: { id: "x" }, error: null }) }) };
        },
        update: (row: Record<string, unknown>) => ({
          eq: () => ({
            select: () => ({ single: async () => ({ data: { id: "r1", ...row }, error: null }) }),
          }),
        }),
        select: () => ({
          then: (fn: (r: unknown) => unknown) =>
            Promise.resolve(fn({ data: [], count: 0, error: null })),
        }),
        delete: () => ({ eq: async () => ({ error: null }) }),
      }),
    } as unknown as SupabaseLikeClient;

    const ctx: WorkflowContext = { cookies: fakeCookies, db, activityLogger: createMockLogger() };
    await transitionModerationReport(ctx, "r1", "open", "in_review");

    const historyCall = calls.find((c) => c.table === "entity_state_transition");
    expect(historyCall?.row).toMatchObject({
      entity_table: "moderation_report",
      entity_id: "r1",
      from_status: "open",
      to_status: "in_review",
      changed_by: "admin-1",
    });
  });

  it("assignModerationReport updates assigned_to and logs the change", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: WorkflowContext = {
      cookies: fakeCookies,
      db: createMockDb({
        updateResult: { data: { id: "r1", assigned_to: "admin-2" }, error: null },
      }),
      activityLogger: logger,
    };

    const report = await assignModerationReport(ctx, "r1", "admin-2");
    expect(report.assigned_to).toBe("admin-2");
    expect(logger.calls).toContainEqual(expect.objectContaining({ action: "update" }));
  });
});
