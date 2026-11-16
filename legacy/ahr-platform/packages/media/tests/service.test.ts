import { describe, it, expect, vi } from "vitest";
import * as auth from "@ahr/auth";
import {
  uploadMedia,
  updateMediaCaption,
  transitionMediaStatus,
  archiveMedia,
  forceDeleteMedia,
  restoreMedia,
  replaceMediaFile,
  getMediaAccessUrl,
  type MediaServiceContext,
  type MediaActivityLogger,
} from "../src/service";
import { MediaValidationError } from "../src/validation";
import type { StorageAdapter } from "../src/storage-adapter";
import { NotFoundError } from "@ahr/cms-core";
import type { SupabaseLikeClient, QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";

// Same interception point proven in Milestone 5's tests: service.ts imports
// `requireCapability` directly from "@ahr/auth" — mocking that package
// boundary (not the internal getSession binding) is what actually works.
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

function createMockStorage(
  overrides: { uploadShouldFail?: boolean } = {},
): StorageAdapter & { uploadedPaths: string[]; removedPaths: string[] } {
  const uploadedPaths: string[] = [];
  const removedPaths: string[] = [];
  return {
    uploadedPaths,
    removedPaths,
    upload: async (path) => {
      if (overrides.uploadShouldFail) throw new Error("storage down");
      uploadedPaths.push(path);
      return { path };
    },
    remove: async (path) => {
      removedPaths.push(path);
    },
    getPublicUrl: (path) => `https://cdn.example.com/${path}`,
    createSignedUrl: async (path) => `https://cdn.example.com/signed/${path}`,
  };
}

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

function createMockDb(
  overrides: {
    insertResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    updateResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
    deleteError?: { message: string } | null;
    selectResult?: { data: Record<string, unknown>[]; count: number; error: null };
  } = {},
): SupabaseLikeClient & { insertCalledWith?: Record<string, unknown> } {
  const state: { insertCalledWith?: Record<string, unknown> } = {};
  const client = {
    from: () => ({
      select: () =>
        makeQueryBuilder(overrides.selectResult ?? { data: [], count: 0, error: null }),
      insert: (row: Record<string, unknown>) => {
        state.insertCalledWith = row;
        return {
          select: () => ({
            single: async () =>
              overrides.insertResult ?? { data: { id: row.id, ...row }, error: null },
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
    }),
    get insertCalledWith() {
      return state.insertCalledWith;
    },
  };
  return client as unknown as SupabaseLikeClient & typeof state;
}

function createMockLogger(): MediaActivityLogger & { calls: unknown[] } {
  const calls: unknown[] = [];
  return { calls, log: async (input) => void calls.push(input) };
}

describe("service — Media Library upload pipeline, lifecycle, and permissions (Milestone 6)", () => {
  it("uploadMedia requires an authenticated session with media:manage", async () => {
    vi.mocked(auth.requireCapability).mockRejectedValue(new auth.UnauthenticatedError());
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadMedia(ctx, {
        ownerType: "work",
        ownerId: "w1",
        file: { bytes: new Uint8Array([1, 2, 3]), fileName: "cover.png", mimeType: "image/png" },
      }),
    ).rejects.toThrow(auth.UnauthenticatedError);
  });

  it("uploadMedia rejects an unsupported media type (document) before touching Storage or the database", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage,
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadMedia(ctx, {
        ownerType: "work",
        ownerId: "w1",
        file: {
          bytes: new Uint8Array([1, 2, 3]),
          fileName: "report.pdf",
          mimeType: "application/pdf",
        },
      }),
    ).rejects.toThrow(MediaValidationError);
    expect(storage.uploadedPaths).toHaveLength(0);
  });

  it("uploadMedia succeeds for a valid image, builds the correct path, and logs 'create'", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const logger = createMockLogger();
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage,
      activityLogger: logger,
    };

    const result = await uploadMedia(ctx, {
      ownerType: "work",
      ownerId: "w1",
      file: { bytes: new Uint8Array([1, 2, 3]), fileName: "cover.png", mimeType: "image/png" },
      captionEn: "Cover art",
    });

    expect(result.asset.media_type).toBe("image");
    expect(result.asset.work_id).toBe("w1");
    expect(storage.uploadedPaths[0]).toMatch(/^work\/w1\/.+\.png$/);
    expect(result.transientMetadata.fileSizeBytes).toBe(3);
    expect(logger.calls).toContainEqual(
      expect.objectContaining({ actorId: "admin-1", action: "create", entityType: "media_asset" }),
    );
  });

  it("uploadMedia rolls back the Storage object if the database insert fails", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const db = createMockDb({ insertResult: { data: null, error: { message: "db unavailable" } } });
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db,
      storage,
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadMedia(ctx, {
        ownerType: "person",
        ownerId: "p1",
        file: { bytes: new Uint8Array([1]), fileName: "photo.jpg", mimeType: "image/jpeg" },
      }),
    ).rejects.toThrow();

    expect(storage.uploadedPaths).toHaveLength(1);
    expect(storage.removedPaths).toHaveLength(1);
    expect(storage.removedPaths[0]).toBe(storage.uploadedPaths[0]);
  });

  it("uploadMedia rejects zero or multiple owners (exactly-one-owner rule)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadMedia(ctx, {
        ownerType: "work",
        ownerId: "", // falsy -> zero owners after mapping
        file: { bytes: new Uint8Array([1]), fileName: "x.png", mimeType: "image/png" },
      }),
    ).rejects.toThrow(/exactly one owner/);
  });

  it("updateMediaCaption updates only the caption fields and logs 'update'", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({
        updateResult: { data: { id: "a1", caption_en: "New caption" }, error: null },
      }),
      storage: createMockStorage(),
      activityLogger: logger,
    };

    const result = await updateMediaCaption(ctx, "a1", { captionEn: "New caption" });
    expect(result.caption_en).toBe("New caption");
    expect(logger.calls).toContainEqual(expect.objectContaining({ action: "update" }));
  });

  it("transitionMediaStatus reuses the exact frozen lifecycle graph (rejects a skipped stage)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };

    await expect(transitionMediaStatus(ctx, "a1", "draft", "published")).rejects.toThrow(
      /INVALID_STATUS_TRANSITION|cannot move/,
    );
  });

  it("transitionMediaStatus logs 'publish' when moving to published", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({ updateResult: { data: { id: "a1", status: "published" }, error: null } }),
      storage: createMockStorage(),
      activityLogger: logger,
    };
    await transitionMediaStatus(ctx, "a1", "verified", "published");
    expect(logger.calls).toContainEqual(expect.objectContaining({ action: "publish" }));
  });

  it("archiveMedia performs a soft delete (archive) and NEVER touches Storage", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({ updateResult: { data: { id: "a1", status: "archived" }, error: null } }),
      storage,
      activityLogger: createMockLogger(),
    };
    const result = await archiveMedia(ctx, "a1", "published");
    expect(result.status).toBe("archived");
    expect(storage.removedPaths).toHaveLength(0); // No Hard Delete — the file stays
  });

  describe("forceDeleteMedia (data owner decision, 2026-07-25)", () => {
    it("requires the separate database:force-delete capability", async () => {
      vi.mocked(auth.requireCapability).mockRejectedValue(new auth.UnauthenticatedError());
      const ctx: MediaServiceContext = {
        cookies: fakeCookies,
        db: createMockDb(),
        storage: createMockStorage(),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteMedia(ctx, "a1", "work/w1/a1.png")).rejects.toThrow(
        auth.UnauthenticatedError,
      );
      expect(auth.requireCapability).toHaveBeenCalledWith(fakeCookies, "database:force-delete");
    });

    it("snapshots the row, deletes it, removes the Storage object, and logs 'force-delete' — regardless of status", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const storage = createMockStorage();
      const logger = createMockLogger();
      const db = createMockDb({
        selectResult: {
          data: [{ id: "a1", media_type: "image", status: "published" }],
          count: 1,
          error: null,
        },
      });
      const ctx: MediaServiceContext = { cookies: fakeCookies, db, storage, activityLogger: logger };

      await forceDeleteMedia(ctx, "a1", "work/w1/a1.png");

      expect(db.insertCalledWith).toMatchObject({
        entity_table: "media_asset",
        entity_id: "a1",
        snapshot: { id: "a1", media_type: "image", status: "published" },
        deleted_by: "admin-1",
      });
      expect(storage.removedPaths).toEqual(["work/w1/a1.png"]);
      expect(logger.calls).toContainEqual(
        expect.objectContaining({ action: "force-delete", entityType: "media_asset" }),
      );
    });

    it("throws NotFoundError when the row doesn't exist", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const ctx: MediaServiceContext = {
        cookies: fakeCookies,
        db: createMockDb({ selectResult: { data: [], count: 0, error: null } }),
        storage: createMockStorage(),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteMedia(ctx, "missing", "x")).rejects.toThrow(NotFoundError);
    });
  });

  it("restoreMedia moves archived → published", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({ updateResult: { data: { id: "a1", status: "published" }, error: null } }),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };
    const result = await restoreMedia(ctx, "a1");
    expect(result.status).toBe("published");
  });

  it("replaceMediaFile writes a NEW path, never overwriting the old one, and updates storage_path", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const ctx: MediaServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({
        updateResult: { data: { id: "a1", storage_path: "work/w1/a1.png" }, error: null },
      }),
      storage,
      activityLogger: createMockLogger(),
    };

    const result = await replaceMediaFile(ctx, "a1", "work", "w1", {
      bytes: new Uint8Array([9, 9]),
      fileName: "cover-v2.png",
      mimeType: "image/png",
    });

    expect(storage.uploadedPaths).toHaveLength(1);
    expect(result.storage_path).toBe("work/w1/a1.png");
  });

  it("getMediaAccessUrl returns a public URL for public assets", async () => {
    const storage = createMockStorage();
    const url = await getMediaAccessUrl(
      { storage },
      { storage_path: "work/w1/a1.png", visibility: "public" },
    );
    expect(url).toBe("https://cdn.example.com/work/w1/a1.png");
  });

  it("getMediaAccessUrl returns a signed URL for restricted/hidden assets", async () => {
    const storage = createMockStorage();
    const url = await getMediaAccessUrl(
      { storage },
      { storage_path: "work/w1/a1.png", visibility: "restricted" },
    );
    expect(url).toBe("https://cdn.example.com/signed/work/w1/a1.png");
  });
});
