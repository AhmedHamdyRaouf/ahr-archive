import { describe, it, expect, vi } from "vitest";
import * as auth from "@ahr/auth";
import {
  uploadAsset,
  updateAssetMetadata,
  transitionAssetStatus,
  restoreAsset,
  deleteAsset,
  forceDeleteAsset,
  getAssetAccessUrl,
  type MediaLibraryServiceContext,
  type MediaLibraryActivityLogger,
} from "../src/service";
import { MediaLibraryValidationError } from "../src/validation";
import type { StorageAdapter } from "@ahr/media";
import { NotFoundError } from "@ahr/cms-core";
import type { SupabaseLikeClient, QueryBuilderLike, ListQueryResult } from "@ahr/cms-core";

// Same interception point @ahr/media's tests use: service.ts imports
// `requireCapability` directly from "@ahr/auth" — mocking that package
// boundary is what actually works here.
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

function createMockLogger(): MediaLibraryActivityLogger & { calls: unknown[] } {
  const calls: unknown[] = [];
  return { calls, log: async (input) => void calls.push(input) };
}

describe("service — Asset Library upload pipeline, lifecycle, and permissions", () => {
  it("uploadAsset requires an authenticated session with media-library:manage", async () => {
    vi.mocked(auth.requireCapability).mockRejectedValue(new auth.UnauthenticatedError());
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadAsset(ctx, {
        imageKey: "home-hero",
        file: { bytes: new Uint8Array([1, 2, 3]), fileName: "hero.png", mimeType: "image/png" },
      }),
    ).rejects.toThrow(auth.UnauthenticatedError);
  });

  it("uploadAsset rejects a non-image file before touching Storage or the database", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage,
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadAsset(ctx, {
        imageKey: "home-hero",
        file: { bytes: new Uint8Array([1]), fileName: "clip.mp4", mimeType: "video/mp4" },
      }),
    ).rejects.toThrow(MediaLibraryValidationError);
    expect(storage.uploadedPaths).toHaveLength(0);
  });

  it("uploadAsset rejects an invalid image_key before touching Storage", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage,
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadAsset(ctx, {
        imageKey: "Not A Valid Key",
        file: { bytes: new Uint8Array([1]), fileName: "hero.png", mimeType: "image/png" },
      }),
    ).rejects.toThrow(MediaLibraryValidationError);
    expect(storage.uploadedPaths).toHaveLength(0);
  });

  it("uploadAsset succeeds for a valid image, builds a library/ path, and logs 'create'", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const logger = createMockLogger();
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage,
      activityLogger: logger,
    };

    const result = await uploadAsset(ctx, {
      imageKey: "home-hero",
      file: { bytes: new Uint8Array([1, 2, 3]), fileName: "hero.png", mimeType: "image/png" },
      titleEn: "Home Hero",
      tags: ["home", "hero"],
    });

    expect(result.image_key).toBe("home-hero");
    expect(storage.uploadedPaths[0]).toMatch(/^library\/.+\.png$/);
    expect(logger.calls).toContainEqual(
      expect.objectContaining({ actorId: "admin-1", action: "create", entityType: "media_library" }),
    );
  });

  it("uploadAsset rolls back the Storage object if the database insert fails", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const db = createMockDb({ insertResult: { data: null, error: { message: "db unavailable" } } });
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db,
      storage,
      activityLogger: createMockLogger(),
    };

    await expect(
      uploadAsset(ctx, {
        imageKey: "about-photo",
        file: { bytes: new Uint8Array([1]), fileName: "photo.jpg", mimeType: "image/jpeg" },
      }),
    ).rejects.toThrow();

    expect(storage.uploadedPaths).toHaveLength(1);
    expect(storage.removedPaths).toHaveLength(1);
    expect(storage.removedPaths[0]).toBe(storage.uploadedPaths[0]);
  });

  it("updateAssetMetadata updates only the provided fields and logs 'update'", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({
        updateResult: { data: { id: "a1", title_en: "New Title" }, error: null },
      }),
      storage: createMockStorage(),
      activityLogger: logger,
    };

    const result = await updateAssetMetadata(ctx, "a1", { titleEn: "New Title" });
    expect(result.title_en).toBe("New Title");
    expect(logger.calls).toContainEqual(expect.objectContaining({ action: "update" }));
  });

  it("transitionAssetStatus reuses the frozen lifecycle graph (rejects a skipped stage)", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };

    await expect(transitionAssetStatus(ctx, "a1", "draft", "published")).rejects.toThrow(
      /INVALID_STATUS_TRANSITION|cannot move/,
    );
  });

  it("restoreAsset moves archived → published", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({ updateResult: { data: { id: "a1", status: "published" }, error: null } }),
      storage: createMockStorage(),
      activityLogger: createMockLogger(),
    };
    const result = await restoreAsset(ctx, "a1");
    expect(result.status).toBe("published");
  });

  it("deleteAsset archives (never touches Storage) when the asset already left draft", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({ updateResult: { data: { id: "a1", status: "archived" }, error: null } }),
      storage,
      activityLogger: createMockLogger(),
    };
    const result = await deleteAsset(ctx, "a1", "published", "library/a1.png");
    expect(result?.status).toBe("archived");
    expect(storage.removedPaths).toHaveLength(0);
  });

  it("deleteAsset truly removes the row AND Storage object when the asset never left draft", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const storage = createMockStorage();
    const logger = createMockLogger();
    const ctx: MediaLibraryServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      storage,
      activityLogger: logger,
    };
    const result = await deleteAsset(ctx, "a1", "draft", "library/a1.png");
    expect(result).toBeNull();
    expect(storage.removedPaths).toEqual(["library/a1.png"]);
    expect(logger.calls).toContainEqual(expect.objectContaining({ action: "delete" }));
  });

  describe("forceDeleteAsset (data owner decision, 2026-07-25)", () => {
    it("requires the separate database:force-delete capability", async () => {
      vi.mocked(auth.requireCapability).mockRejectedValue(new auth.UnauthenticatedError());
      const ctx: MediaLibraryServiceContext = {
        cookies: fakeCookies,
        db: createMockDb(),
        storage: createMockStorage(),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteAsset(ctx, "a1", "library/a1.png")).rejects.toThrow(
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
          data: [{ id: "a1", image_key: "home-hero", status: "published" }],
          count: 1,
          error: null,
        },
      });
      const ctx: MediaLibraryServiceContext = {
        cookies: fakeCookies,
        db,
        storage,
        activityLogger: logger,
      };

      await forceDeleteAsset(ctx, "a1", "library/a1.png");

      expect(db.insertCalledWith).toMatchObject({
        entity_table: "media_library",
        entity_id: "a1",
        snapshot: { id: "a1", image_key: "home-hero", status: "published" },
        deleted_by: "admin-1",
      });
      expect(storage.removedPaths).toEqual(["library/a1.png"]);
      expect(logger.calls).toContainEqual(
        expect.objectContaining({ action: "force-delete", entityType: "media_library" }),
      );
    });

    it("throws NotFoundError when the row doesn't exist", async () => {
      vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
      const ctx: MediaLibraryServiceContext = {
        cookies: fakeCookies,
        db: createMockDb({ selectResult: { data: [], count: 0, error: null } }),
        storage: createMockStorage(),
        activityLogger: createMockLogger(),
      };
      await expect(forceDeleteAsset(ctx, "missing", "library/missing.png")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  it("getAssetAccessUrl returns a public URL for public assets", async () => {
    const storage = createMockStorage();
    const url = await getAssetAccessUrl(
      { storage },
      { storage_path: "library/a1.png", visibility: "public" },
    );
    expect(url).toBe("https://cdn.example.com/library/a1.png");
  });

  it("getAssetAccessUrl returns a signed URL for restricted/hidden assets", async () => {
    const storage = createMockStorage();
    const url = await getAssetAccessUrl(
      { storage },
      { storage_path: "library/a1.png", visibility: "hidden" },
    );
    expect(url).toBe("https://cdn.example.com/signed/library/a1.png");
  });
});
