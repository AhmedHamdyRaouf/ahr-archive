import { describe, it, expect, vi } from "vitest";
import { SupabaseStorageAdapter } from "../src/supabase-storage-adapter";
import type { SupabaseClient } from "@supabase/supabase-js";

function createMockSupabase(
  overrides: {
    uploadError?: { message: string } | null;
    removeError?: { message: string } | null;
    publicUrl?: string;
    signedUrl?: string;
    signedUrlError?: { message: string } | null;
  } = {},
) {
  const uploadFn = vi.fn().mockResolvedValue({ data: {}, error: overrides.uploadError ?? null });
  const removeFn = vi.fn().mockResolvedValue({ data: {}, error: overrides.removeError ?? null });
  const getPublicUrlFn = vi.fn().mockReturnValue({
    data: { publicUrl: overrides.publicUrl ?? "https://example.com/public/path" },
  });
  const createSignedUrlFn = vi.fn().mockResolvedValue({
    data: overrides.signedUrlError
      ? null
      : { signedUrl: overrides.signedUrl ?? "https://example.com/signed/path" },
    error: overrides.signedUrlError ?? null,
  });

  const supabase = {
    storage: {
      from: () => ({
        upload: uploadFn,
        remove: removeFn,
        getPublicUrl: getPublicUrlFn,
        createSignedUrl: createSignedUrlFn,
      }),
    },
  } as unknown as SupabaseClient;

  return { supabase, uploadFn, removeFn, getPublicUrlFn, createSignedUrlFn };
}

describe("SupabaseStorageAdapter — the one real StorageAdapter implementation (Milestone 6)", () => {
  it("upload() calls Supabase Storage with upsert:false (versioning rule — never overwrite in place)", async () => {
    const { supabase, uploadFn } = createMockSupabase();
    const adapter = new SupabaseStorageAdapter(supabase);

    const result = await adapter.upload("work/w1/a1.png", new Uint8Array([1, 2, 3]), "image/png");

    expect(result.path).toBe("work/w1/a1.png");
    expect(uploadFn).toHaveBeenCalledWith(
      "work/w1/a1.png",
      expect.anything(),
      expect.objectContaining({ contentType: "image/png", upsert: false }),
    );
  });

  it("upload() throws a clear error on Storage failure", async () => {
    const { supabase } = createMockSupabase({ uploadError: { message: "bucket not found" } });
    const adapter = new SupabaseStorageAdapter(supabase);
    await expect(adapter.upload("x", new Uint8Array(), "image/png")).rejects.toThrow(
      /bucket not found/,
    );
  });

  it("remove() calls Storage remove with the given path", async () => {
    const { supabase, removeFn } = createMockSupabase();
    const adapter = new SupabaseStorageAdapter(supabase);
    await adapter.remove("work/w1/a1.png");
    expect(removeFn).toHaveBeenCalledWith(["work/w1/a1.png"]);
  });

  it("getPublicUrl() returns the URL Supabase Storage computes", () => {
    const { supabase } = createMockSupabase({ publicUrl: "https://cdn.example.com/media/x.png" });
    const adapter = new SupabaseStorageAdapter(supabase);
    expect(adapter.getPublicUrl("x.png")).toBe("https://cdn.example.com/media/x.png");
  });

  it("createSignedUrl() returns a signed URL for restricted/hidden assets", async () => {
    const { supabase } = createMockSupabase({
      signedUrl: "https://cdn.example.com/signed/x.png?token=abc",
    });
    const adapter = new SupabaseStorageAdapter(supabase);
    const url = await adapter.createSignedUrl("x.png", 3600);
    expect(url).toBe("https://cdn.example.com/signed/x.png?token=abc");
  });

  it("createSignedUrl() throws a clear error on failure", async () => {
    const { supabase } = createMockSupabase({ signedUrlError: { message: "not found" } });
    const adapter = new SupabaseStorageAdapter(supabase);
    await expect(adapter.createSignedUrl("x.png", 3600)).rejects.toThrow(/not found/);
  });
});
