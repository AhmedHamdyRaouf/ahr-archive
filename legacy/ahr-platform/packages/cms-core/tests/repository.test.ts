import { describe, it, expect, vi } from "vitest";
import {
  genericList,
  genericCreate,
  genericUpdate,
  genericTransitionStatus,
  genericSoftDelete,
  genericRestore,
  genericHardDelete,
  genericForceDelete,
  NotFoundError,
  RepositoryError,
  ForceDeleteBlockedError,
} from "../src/repository";
import { InvalidStatusTransitionError } from "../src/status";
import { ValidationError } from "../src/validation";
import type { ResourceDefinition } from "../src/types";
import type { SupabaseLikeClient } from "../src/repository";
import type { QueryBuilderLike, ListQueryResult } from "../src/query";

const sampleDefinition: ResourceDefinition = {
  tableName: "sample_generic_entity",
  label: "Sample",
  labelPlural: "Samples",
  hasSlug: true,
  slugSourceField: "title_en",
  hasLifecycle: true,
  fields: [{ name: "title", type: "bilingual-text", label: "Title", required: true }],
};

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

function createMockClient(
  overrides: Partial<{
    listResult: ListQueryResult<unknown>;
    insertResult: { data: Record<string, unknown> | null; error: { message: string } | null };
    updateResult: { data: Record<string, unknown> | null; error: { message: string } | null };
    deleteError: { message: string } | null;
  }> = {},
): SupabaseLikeClient & {
  insertCalledWith?: Record<string, unknown>;
  updateCalledWith?: Record<string, unknown>;
  deleteCallCount?: number;
} {
  const state: {
    insertCalledWith?: Record<string, unknown>;
    updateCalledWith?: Record<string, unknown>;
    deleteCallCount: number;
  } = { deleteCallCount: 0 };

  const client = {
    from: () => ({
      select: () => makeQueryBuilder(overrides.listResult ?? { data: [], count: 0, error: null }),
      insert: (row: Record<string, unknown>) => {
        state.insertCalledWith = row;
        return {
          select: () => ({
            single: async () =>
              overrides.insertResult ?? { data: { id: "new-id", ...row }, error: null },
          }),
        };
      },
      update: (row: Record<string, unknown>) => {
        state.updateCalledWith = row;
        return {
          eq: () => ({
            select: () => ({
              single: async () =>
                overrides.updateResult ?? { data: { id: "existing-id", ...row }, error: null },
            }),
          }),
        };
      },
      delete: () => ({
        eq: async () => {
          state.deleteCallCount += 1;
          return { error: overrides.deleteError ?? null };
        },
      }),
    }),
    get insertCalledWith() {
      return state.insertCalledWith;
    },
    get updateCalledWith() {
      return state.updateCalledWith;
    },
    get deleteCallCount() {
      return state.deleteCallCount;
    },
  };
  return client as SupabaseLikeClient & typeof state;
}

describe("repository — Generic CRUD framework (Milestone 4)", () => {
  it("genericList returns data + pagination meta", async () => {
    const client = createMockClient({ listResult: { data: [{ id: "1" }], count: 1, error: null } });
    const result = await genericList(
      sampleDefinition,
      { supabase: client, actorId: "admin-1" },
      {
        pagination: { page: 1, pageSize: 20 },
      },
    );
    expect(result.data).toEqual([{ id: "1" }]);
    expect(result.meta.totalItems).toBe(1);
  });

  it("genericList throws RepositoryError on a query error", async () => {
    const client = createMockClient({
      listResult: { data: null, count: null, error: { message: "boom" } },
    });
    await expect(
      genericList(
        sampleDefinition,
        { supabase: client, actorId: "admin-1" },
        {
          pagination: { page: 1, pageSize: 20 },
        },
      ),
    ).rejects.toThrow(RepositoryError);
  });

  it("genericCreate validates input BEFORE hitting the database", async () => {
    const client = createMockClient();
    await expect(
      genericCreate(
        sampleDefinition,
        { supabase: client, actorId: "admin-1" },
        { title_ar: "", title_en: "" },
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("genericCreate always forces status='draft', never trusting caller input", async () => {
    const client = createMockClient();
    await genericCreate(
      sampleDefinition,
      { supabase: client, actorId: "admin-1" },
      { title_ar: "أ", title_en: "A", status: "published" }, // attempt to smuggle a status
    );
    expect(client.insertCalledWith?.status).toBe("draft");
  });

  it("genericCreate sets created_by/updated_by from the actor, not client input", async () => {
    const client = createMockClient();
    await genericCreate(
      sampleDefinition,
      { supabase: client, actorId: "admin-42" },
      { title_ar: "أ", title_en: "A" },
    );
    expect(client.insertCalledWith?.created_by).toBe("admin-42");
    expect(client.insertCalledWith?.updated_by).toBe("admin-42");
  });

  it("genericUpdate rejects a request that tries to set status directly", async () => {
    const client = createMockClient();
    await expect(
      genericUpdate(sampleDefinition, { supabase: client, actorId: "admin-1" }, "id-1", {
        title_en: "New",
        status: "published",
      }),
    ).rejects.toThrow(/genericTransitionStatus/);
  });

  it("genericUpdate throws NotFoundError when the row doesn't exist", async () => {
    const client = createMockClient({ updateResult: { data: null, error: null } });
    await expect(
      genericUpdate(sampleDefinition, { supabase: client, actorId: "admin-1" }, "missing-id", {
        title_en: "X",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("genericTransitionStatus enforces the frozen lifecycle sequence", async () => {
    const client = createMockClient();
    await expect(
      genericTransitionStatus(
        sampleDefinition,
        { supabase: client, actorId: "admin-1" },
        "id-1",
        "draft",
        "published",
      ),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it("genericTransitionStatus succeeds for a valid transition", async () => {
    const client = createMockClient({
      updateResult: { data: { id: "id-1", status: "review" }, error: null },
    });
    const result = await genericTransitionStatus(
      sampleDefinition,
      { supabase: client, actorId: "admin-1" },
      "id-1",
      "draft",
      "review",
    );
    expect((result as Record<string, unknown>).status).toBe("review");
  });

  it("genericTransitionStatus writes an entity_state_transition history row (Milestone 10 bug fix — no trigger was ever built for this)", async () => {
    const client = createMockClient({
      updateResult: { data: { id: "id-1", status: "review" }, error: null },
    });
    await genericTransitionStatus(
      sampleDefinition,
      { supabase: client, actorId: "admin-1" },
      "id-1",
      "draft",
      "review",
    );

    expect(client.insertCalledWith).toMatchObject({
      entity_table: "sample_generic_entity",
      entity_id: "id-1",
      from_status: "draft",
      to_status: "review",
      changed_by: "admin-1",
    });
  });

  it("genericTransitionStatus still succeeds even if the history write itself fails (logging must never block the transition)", async () => {
    const client = createMockClient({
      updateResult: { data: { id: "id-1", status: "review" }, error: null },
      insertResult: { data: null, error: { message: "history table unavailable" } },
    });
    const result = await genericTransitionStatus(
      sampleDefinition,
      { supabase: client, actorId: "admin-1" },
      "id-1",
      "draft",
      "review",
    );
    expect((result as Record<string, unknown>).status).toBe("review");
  });

  it("genericSoftDelete is exactly a transition to 'archived' — never a row deletion", async () => {
    const client = createMockClient({
      updateResult: { data: { id: "id-1", status: "archived" }, error: null },
    });
    await genericSoftDelete(
      sampleDefinition,
      { supabase: client, actorId: "admin-1" },
      "id-1",
      "published",
    );
    expect(client.updateCalledWith?.status).toBe("archived");
  });

  it("genericRestore is exactly the documented archived → published path", async () => {
    const client = createMockClient({
      updateResult: { data: { id: "id-1", status: "published" }, error: null },
    });
    await genericRestore(sampleDefinition, { supabase: client, actorId: "admin-1" }, "id-1");
    expect(client.updateCalledWith?.status).toBe("published");
  });

  it("genericHardDelete refuses to delete anything not still in 'draft' (No Hard Delete)", async () => {
    const client = createMockClient();
    await expect(
      genericHardDelete(
        sampleDefinition,
        { supabase: client, actorId: "admin-1" },
        "id-1",
        "published",
      ),
    ).rejects.toThrow(/only permitted for rows that never left "draft"/);
  });

  it("genericHardDelete succeeds for a row still in 'draft'", async () => {
    const client = createMockClient();
    await expect(
      genericHardDelete(
        sampleDefinition,
        { supabase: client, actorId: "admin-1" },
        "id-1",
        "draft",
      ),
    ).resolves.toBeUndefined();
  });

  it("genericForceDelete writes a full snapshot to entity_hard_delete_log before deleting", async () => {
    const client = createMockClient({
      listResult: { data: [{ id: "id-1", title_en: "X" }], count: 1, error: null },
    });
    await genericForceDelete(sampleDefinition, { supabase: client, actorId: "admin-1" }, "id-1");

    expect(client.insertCalledWith).toMatchObject({
      entity_table: "sample_generic_entity",
      entity_id: "id-1",
      snapshot: { id: "id-1", title_en: "X" },
      deleted_by: "admin-1",
    });
    expect(client.deleteCallCount).toBe(1);
  });

  it("genericForceDelete throws NotFoundError when the row doesn't exist", async () => {
    const client = createMockClient({ listResult: { data: [], count: 0, error: null } });
    await expect(
      genericForceDelete(sampleDefinition, { supabase: client, actorId: "admin-1" }, "missing-id"),
    ).rejects.toThrow(NotFoundError);
    expect(client.deleteCallCount).toBe(0);
  });

  it("genericForceDelete refuses to delete if the pre-delete snapshot write itself fails (never delete without a backup)", async () => {
    const client = createMockClient({
      listResult: { data: [{ id: "id-1" }], count: 1, error: null },
      insertResult: { data: null, error: { message: "log table unavailable" } },
    });
    await expect(
      genericForceDelete(sampleDefinition, { supabase: client, actorId: "admin-1" }, "id-1"),
    ).rejects.toThrow(/Refusing to permanently delete/);
    expect(client.deleteCallCount).toBe(0);
  });

  it("genericForceDelete surfaces ForceDeleteBlockedError when another row still references this one", async () => {
    const client = createMockClient({
      listResult: { data: [{ id: "id-1" }], count: 1, error: null },
      deleteError: {
        message:
          'update or delete on table "sample_generic_entity" violates foreign key constraint "fk_work_sample" on table "work"',
      },
    });
    await expect(
      genericForceDelete(sampleDefinition, { supabase: client, actorId: "admin-1" }, "id-1"),
    ).rejects.toThrow(ForceDeleteBlockedError);
  });

  it("genericForceDelete succeeds and leaves no row (No Hard Delete is deliberately bypassed here)", async () => {
    const client = createMockClient({
      listResult: { data: [{ id: "id-1", status: "published" }], count: 1, error: null },
    });
    await expect(
      genericForceDelete(sampleDefinition, { supabase: client, actorId: "admin-1" }, "id-1"),
    ).resolves.toBeUndefined();
  });

  it("genericCreate calls the revision adapter after a successful write", async () => {
    const client = createMockClient();
    const recordRevision = vi.fn().mockResolvedValue(undefined);
    await genericCreate(
      sampleDefinition,
      { supabase: client, actorId: "admin-1", revisionAdapter: { recordRevision } },
      { title_ar: "أ", title_en: "A" },
    );
    expect(recordRevision).toHaveBeenCalledOnce();
  });
});
