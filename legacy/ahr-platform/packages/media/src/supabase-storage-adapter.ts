import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageAdapter, StorageUploadResult } from "./storage-adapter";

/**
 * Implements: Database Architecture (Frozen v1) §11 — "Bucket: media" (one
 * bucket for V1, not one per entity type — see that section's own
 * reasoning, reused here rather than re-derived).
 */
const MEDIA_BUCKET = "media";

/**
 * The only file in this package that imports `@supabase/supabase-js`'s
 * storage client — every other module depends on the `StorageAdapter`
 * interface (`storage-adapter.ts`), not this concrete implementation.
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  constructor(private readonly supabase: SupabaseClient) {}

  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<StorageUploadResult> {
    const { error } = await this.supabase.storage.from(MEDIA_BUCKET).upload(path, bytes, {
      contentType,
      upsert: false, // Milestone 4/§11.1 versioning rule: never overwrite in place — replace always writes a new path.
    });

    if (error) {
      throw new Error(`Failed to upload to Storage at "${path}": ${error.message}`);
    }

    return { path };
  }

  async remove(path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(MEDIA_BUCKET).remove([path]);
    if (error) {
      throw new Error(`Failed to remove Storage object at "${path}": ${error.message}`);
    }
  }

  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async createSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data) {
      throw new Error(
        `Failed to create signed URL for "${path}": ${error?.message ?? "unknown error"}`,
      );
    }
    return data.signedUrl;
  }
}
