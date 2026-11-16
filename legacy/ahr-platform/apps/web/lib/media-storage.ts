import { SupabaseStorageAdapter, type StorageAdapter } from "@ahr/media";
import { createRouteHandlerSupabaseClient } from "./supabase-server";

/**
 * The one place `apps/web` constructs a real `StorageAdapter` — every
 * Media Library Route Handler calls this rather than instantiating
 * `SupabaseStorageAdapter` inline (Coding Standards).
 */
export function createMediaStorageAdapter(): StorageAdapter {
  return new SupabaseStorageAdapter(createRouteHandlerSupabaseClient());
}
