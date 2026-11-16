import { describe, it, expect, vi } from "vitest";
import * as auth from "@ahr/auth";
import {
  updateVisibility,
  updateVerificationStatus,
  updateOwner,
  updateSource,
  InvalidMetadataValueError,
  type MetadataServiceContext,
  type MetadataActivityLogger,
} from "../src/metadata-service";
import type { ResourceDefinition, SupabaseLikeClient } from "@ahr/cms-core";

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

const sampleDefinition: ResourceDefinition = {
  tableName: "work",
  label: "Work",
  labelPlural: "Works",
  hasSlug: true,
  hasLifecycle: true,
  fields: [],
};

function createMockDb(updateResult?: {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
}): SupabaseLikeClient {
  return {
    from: () => ({
      select: () =>
        ({ range: () => {}, order: () => {}, eq: () => {}, or: () => {}, then: () => {} }) as never,
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
      update: (row: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            single: async () => updateResult ?? { data: { id: "w1", ...row }, error: null },
          }),
        }),
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
    }),
  } as unknown as SupabaseLikeClient;
}

function createMockLogger(): MetadataActivityLogger & { calls: unknown[] } {
  const calls: unknown[] = [];
  return { calls, log: async (input) => void calls.push(input) };
}

describe("metadata-service — shared metadata field services (Milestone 7)", () => {
  it("updateVisibility rejects a value outside the frozen public|restricted|hidden set", async () => {
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };
    await expect(updateVisibility(ctx, sampleDefinition, "w1", "everyone")).rejects.toThrow(
      InvalidMetadataValueError,
    );
  });

  it("updateVisibility succeeds for a valid value and logs the change", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: logger,
    };

    const result = await updateVisibility(ctx, sampleDefinition, "w1", "restricted");
    expect(result.visibility).toBe("restricted");
    expect(logger.calls).toContainEqual(
      expect.objectContaining({
        action: "update",
        metadata: { field: "visibility", newValue: "restricted" },
      }),
    );
  });

  it("updateVerificationStatus rejects a value outside the frozen set", async () => {
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };
    await expect(
      updateVerificationStatus(ctx, sampleDefinition, "w1", "confirmed"),
    ).rejects.toThrow(InvalidMetadataValueError);
  });

  it("updateVerificationStatus succeeds for any frozen value with NO sequencing enforced", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };
    // Jumping straight to 'verified' with no prior 'pending'/'self_reported' step
    // must succeed — no transition graph is documented for this field.
    await expect(
      updateVerificationStatus(ctx, sampleDefinition, "w1", "verified"),
    ).resolves.toMatchObject({
      verification_status: "verified",
    });
  });

  it("updateOwner logs a 'permission_change' activity with old/new owner in metadata", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const logger = createMockLogger();
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: logger,
    };

    await updateOwner(ctx, sampleDefinition, "w1", "old-admin", "new-admin");
    expect(logger.calls).toContainEqual(
      expect.objectContaining({
        action: "permission_change",
        metadata: { field: "owner_id", previousOwnerId: "old-admin", newOwnerId: "new-admin" },
      }),
    );
  });

  it("updateSource updates the free-text source field", async () => {
    vi.mocked(auth.requireCapability).mockResolvedValue(authenticatedSession);
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb({ data: { id: "w1", source: "Family archive" }, error: null }),
      activityLogger: createMockLogger(),
    };
    const result = await updateSource(ctx, sampleDefinition, "w1", "Family archive");
    expect(result.source).toBe("Family archive");
  });

  it("all metadata updates require an authenticated session", async () => {
    vi.mocked(auth.requireCapability).mockRejectedValue(new auth.UnauthenticatedError());
    const ctx: MetadataServiceContext = {
      cookies: fakeCookies,
      db: createMockDb(),
      activityLogger: createMockLogger(),
    };
    await expect(updateVisibility(ctx, sampleDefinition, "w1", "public")).rejects.toThrow(
      auth.UnauthenticatedError,
    );
  });
});
