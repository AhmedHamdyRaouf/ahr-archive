import { SupabaseStorageAdapter, type StorageAdapter } from "@ahr/media";
import { createRouteHandlerSupabaseClient } from "./supabase-server";

/**
 * The one place `apps/web` constructs a `StorageAdapter` for Asset Library
 * Route Handlers — reuses `@ahr/media`'s Supabase Storage implementation
 * as-is (same bucket, different path prefix; see @ahr/media-library's
 * path.ts), rather than writing a second, near-identical adapter.
 */
export function createMediaLibraryStorageAdapter(): StorageAdapter {
  return new SupabaseStorageAdapter(createRouteHandlerSupabaseClient());
}
