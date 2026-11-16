import { describe, it, expect, vi } from "vitest";
import * as auth from "@ahr/auth";
import {
  createEntity,
  updateEntity,
  transitionEntityStatus,
  deleteEntity,
  restoreEntity,
  forceDeleteEntity,
  bulkTransitionEntityStatus,
  type ContentServiceClient,
  type ContentServiceContext,
  type ActivityLogger,
} from "../src/service";
import { UnauthenticatedError } from "@ahr/auth";
import { ForceDeleteBlockedError, NotFoundError } from "@ahr/cms-core";
import type { QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";

// service.ts imports `requireCapability` directly from "@ahr/auth" — that
// is the actual module-resolution boundary this test controls. Spying on
// the re-exported `getSession` binding does NOT work here: @ahr/auth's own
// internal call chain (requireCapability → requireSession → getSession)
// resolves `getSession` via a relative "./session" import at its OWN
// module-definition time, which is a different binding than the one
// re-exported through the package's public index — patching the latter
// does not affect the former. Mocking the actual imported function
// (`requireCapability`) at the package boundary `service.ts` itself uses
// is the correct interception point.
vi.mock("@ahr/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@ahr/auth")>();
  return { ...actual, requireCapability: vi.fn() };
});

const fakeCookies = {} as never;

function makeQueryBuilder(result: ListQueryResult<unknown>): QueryBuilderLike {
  const builder: QueryBuilderLike = {
    range: () => builder,
    order: () => builder,
    eq: () => builder,
    or: () => builder,
    then: (onfulfilled) => Promise.resolve(result).then(onfulfilled as never),
  };
  return builder;
}

function createMockSupabase(
  overrides: {
    insertResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    updateResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    contributionCount?: number;
    /** Row(s) returned for a plain `select("*").eq("id", ...)` on any non-contribution table — used by forceDeleteEntity's pre-delete read. */
    selectResult?: { data: Record<string, unknown>[]; count: number; error: null };
    deleteError?: { message: string } | null;
  } = {},
): ContentServiceClient & { insertCalledWith?: Record<string, unknown> } {
  const state: { insertCalledWith?: Record<string, unknown> } = {};
  const client = {
    from: (table: string) => {
      if (table === "contribution") {
        const builder: QueryBuilderLike = {
          range: () => builder,
          order: () => builder,
          eq: () => builder,
          or: () => builder,
          then: (onfulfilled) =>
            Promise.resolve({
              data: [],
              count: overrides.contributionCount ?? 1,
              error: null,
            }).then(onfulfilled as never),
        };
        return { select: () => builder } as never;
      }
      return {
        select: () =>
          makeQueryBuilder(overrides.selectResult ?? { data: [], count: 0, error: null }),
        insert: (row: Record<string, unknown>) => {
          state.insertCalledWith = row;
          return {
            select: () => ({
              single: async () =>
                overrides.insertResult ?? { data: { id: "new-id", ...row }, error: null },
            }),
          };
        },
        update: (row: Record<string, unknown>) => ({
          eq: () => ({
            select: () => ({
              single: async () =>
                overrides.updateResult ?? { data: { id: "existing-id", ...row }, error: null },
            }),
          }),
        }),
        delete: () => ({ eq: async () => ({ error: overrides.deleteError ?? null }) }),
      } as never;
    },
    get insertCalledWith() {
      return state.insertCalledWith;
    },
  };
  return client as ContentServiceClient & typeof state;
}

function createMockLogger(): ActivityLogger & { calls: unknown[] } {
  const calls: unknown[] = [];
  return {
    calls,
    log: async (input) => {
      calls.push(input);
    },
  };
}

const authenticatedSession = {
  authenticated: true as const,
  authUserId: "auth-1",
  platformUserId: "admin-1",
  personId: "person-1",
  role: "administrator" as const,
};

describe("service — CRUD, Permissions, and CMS integration (Milestone 5)", () => {
  it("createEntity requires an authenticated session (Permissions)", async () => {
    vi.mocked(auth.requireCapability).mockRejectedValue(new UnauthenticatedError());
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase(),
      activityLogger: createMockLogger(),
    };
    await expect(createEntity(ctx, "persons", { name_ar: "أ", name_en: "A" })).rejects.toThrow(
      UnauthenticatedError,
    );
  });

  it("createEntity validates the record against its ResourceDefinition (generic validation, via @ahr/cms-core)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase(),
      activityLogger: createMockLogger(),
    };
    await expect(createEntity(ctx, "persons", { name_ar: "", name_en: "" })).rejects.toThrow();
  });

  it("createEntity enforces Contribution's target rule (entity-specific business rule)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase(),
      activityLogger: createMockLogger(),
    };
    await expect(
      createEntity(ctx, "contributions", { person_id: "p1", role: "composer" }),
    ).rejects.toThrow(/Work, Project, or Event/);
  });

  it("createEntity enforces Press Mention's exactly-one-subject rule", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase(),
      activityLogger: createMockLogger(),
    };
    await expect(
      createEntity(ctx, "press-mentions", { publication_name: "Some Paper" }),
    ).rejects.toThrow(/exactly one subject/);
  });

  it("createEntity succeeds for a valid record and logs a 'create' activity (CMS integration)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase(),
      activityLogger: logger,
    };

    const result = await createEntity(ctx, "persons", { name_ar: "أحمد", name_en: "Ahmed" });
    expect(result.id).toBe("new-id");
    expect(logger.calls).toContainEqual({
      actorId: "admin-1",
      action: "create",
      entityType: "persons",
      entityId: "new-id",
    });
  });

  it("updateEntity rejects a request smuggling a status field (delegates to @ahr/cms-core's rule)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase(),
      activityLogger: createMockLogger(),
    };
    await expect(
      updateEntity(ctx, "works", "w1", { title_en: "New", status: "published" }),
    ).rejects.toThrow(/genericTransitionStatus/);
  });

  it("transitionEntityStatus blocks publishing a Work with zero Contributions (MISSING_CONTRIBUTION)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase({ contributionCount: 0 }),
      activityLogger: createMockLogger(),
    };
    await expect(
      transitionEntityStatus(ctx, "works", "w1", "verified", "published"),
    ).rejects.toThrow(/at least one Contribution/);
  });

  it("transitionEntityStatus allows publishing a Work WITH a Contribution", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase({
        contributionCount: 1,
        updateResult: { data: { id: "w1", status: "published" }, error: null },
      }),
      activityLogger: logger,
    };
    const result = await transitionEntityStatus(ctx, "works", "w1", "verified", "published");
    expect(result.status).toBe("published");
    expect(logger.calls).toContainEqual({
      actorId: "admin-1",
      action: "publish",
      entityType: "works",
      entityId: "w1",
    });
  });

  it("transitionEntityStatus does NOT check Contributions for projects/events (scope discipline)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase({
        contributionCount: 0, // would fail if the rule were (incorrectly) applied here
        updateResult: { data: { id: "proj1", status: "published" }, error: null },
      }),
      activityLogger: createMockLogger(),
    };
    await expect(
      transitionEntityStatus(ctx, "projects", "proj1", "verified", "published"),
    ).resolves.toMatchObject({
      status: "published",
    });
  });

  it("deleteEntity performs a soft delete (archive) and logs 'archive', never a row deletion", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase({
        updateResult: { data: { id: "w1", status: "archived" }, error: null },
      }),
      activityLogger: logger,
    };
    const result = await deleteEntity(ctx, "works", "w1", "published");
    expect(result.status).toBe("archived");
    expect(logger.calls).toContainEqual({
      actorId: "admin-1",
      action: "archive",
      entityType: "works",
      entityId: "w1",
    });
  });

  it("restoreEntity moves archived → published and logs 'restore'", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: ContentServiceContext = {
      cookies: fakeCookies,
      supabase: createMockSupabase({
        updateResult: { data: { id: "w1", status: "published" }, error: null },
      }),
      activityLogger: logger,
    };
    const result = await restoreEntity(ctx, "works", "w1");
    expect(result.status).toBe("published");
    expect(logger.calls).toContainEqual({
      actorId: "admin-1",
      action: "restore",
      entityType: "works",
      entityId: "w1",
    });
  });

  describe("forceDeleteEntity (data owner decision, 2026-07-25)", () => {
    it("requires the separate database:force-delete capability, not content:write", async () => {
      vi.mocked(auth.requireCapability).mockRejectedValue(new UnauthenticatedError());
      const ctx: ContentServiceContext = {
        cookies: fakeCookies,
        supabase: createMockSupabase(),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteEntity(ctx, "works", "w1")).rejects.toThrow(UnauthenticatedError);
      expect(auth.requireCapability).toHaveBeenCalledWith(fakeCookies, "database:force-delete");
    });

    it("writes a pre-delete snapshot, deletes the row, and logs 'force-delete'", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const logger = createMockLogger();
      const supabase = createMockSupabase({
        selectResult: { data: [{ id: "w1", title_en: "Old Song" }], count: 1, error: null },
      });
      const ctx: ContentServiceContext = { cookies: fakeCookies, supabase, activityLogger: logger };

      await forceDeleteEntity(ctx, "works", "w1");

      expect(supabase.insertCalledWith).toMatchObject({
        entity_table: "work",
        entity_id: "w1",
        snapshot: { id: "w1", title_en: "Old Song" },
        deleted_by: "admin-1",
      });
      expect(logger.calls).toContainEqual({
        actorId: "admin-1",
        action: "force-delete",
        entityType: "works",
        entityId: "w1",
      });
    });

    it("throws NotFoundError when the row doesn't exist", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const ctx: ContentServiceContext = {
        cookies: fakeCookies,
        supabase: createMockSupabase({ selectResult: { data: [], count: 0, error: null } }),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteEntity(ctx, "works", "missing")).rejects.toThrow(NotFoundError);
    });

    it("surfaces ForceDeleteBlockedError when another row still references this one", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const ctx: ContentServiceContext = {
        cookies: fakeCookies,
        supabase: createMockSupabase({
          selectResult: { data: [{ id: "person-1" }], count: 1, error: null },
          deleteError: {
            message:
              'update or delete on table "person" violates foreign key constraint "fk_work_person" on table "work"',
          },
        }),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteEntity(ctx, "persons", "person-1")).rejects.toThrow(
        ForceDeleteBlockedError,
      );
    });
  });

  describe("bulkTransitionEntityStatus (Dashboard UX Enhancement Backlog #1)", () => {
    it("requires an authenticated session, same as a single transition", async () => {
      vi.mocked(auth.requireCapability).mockRejectedValue(new UnauthenticatedError());
      const ctx: ContentServiceContext = {
        cookies: fakeCookies,
        supabase: createMockSupabase(),
        activityLogger: createMockLogger(),
      };
      await expect(
        bulkTransitionEntityStatus(ctx, "persons", [{ id: "p1", currentStatus: "verified" }], "published"),
      ).rejects.toThrow(UnauthenticatedError);
    });

    it("transitions every selected item and logs one activity per item", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const logger = createMockLogger();
      const ctx: ContentServiceContext = {
        cookies: fakeCookies,
        supabase: createMockSupabase({
          updateResult: { data: { id: "p1", status: "published" }, error: null },
        }),
        activityLogger: logger,
      };

      const results = await bulkTransitionEntityStatus(
        ctx,
        "persons",
        [
          { id: "p1", currentStatus: "verified" },
          { id: "p2", currentStatus: "verified" },
        ],
        "published",
      );

      expect(results).toEqual([
        { id: "p1", ok: true },
        { id: "p1", ok: true }, // mock's updateResult always returns id "p1" regardless of input row
      ]);
      expect(logger.calls).toHaveLength(2);
    });

    it("reports partial success: one invalid transition doesn't block the other items", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const ctx: ContentServiceContext = {
        cookies: fakeCookies,
        supabase: createMockSupabase({
          updateResult: { data: { id: "p2", status: "published" }, error: null },
        }),
        activityLogger: createMockLogger(),
      };

      const results = await bulkTransitionEntityStatus(
        ctx,
        "persons",
        [
          { id: "p1", currentStatus: "draft" }, // draft → published is not an allowed transition
          { id: "p2", currentStatus: "verified" }, // verified → published is allowed
        ],
        "published",
      );

      expect(results[0]).toMatchObject({ id: "p1", ok: false });
      expect(results[0]?.error).toMatch(/INVALID_STATUS_TRANSITION/);
      expect(results[1]).toMatchObject({ id: "p2", ok: true });
    });
  });
});
