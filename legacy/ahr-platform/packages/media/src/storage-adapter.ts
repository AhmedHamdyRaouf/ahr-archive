/**
 * Implements: Milestone 6 §"Storage abstraction" — "Design the package to
 * work with Supabase Storage, but keep the storage layer abstract so it
 * can be replaced in the future without changing the domain logic."
 *
 * No function in `service.ts` imports `@supabase/supabase-js`'s storage
 * client directly — every storage operation goes through this interface.
 * Swapping Supabase Storage for something else later (e.g. S3) means
 * writing one new adapter, not touching upload/validation/service logic.
 */

export interface StorageUploadResult {
  path: string;
}

export interface StorageAdapter {
  /** Uploads raw bytes to the given path, returning the path actually stored at. */
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<StorageUploadResult>;

  /** Removes the object at the given path. Used only by the sanctioned draft-only hard-delete path (see service.ts). */
  remove(path: string): Promise<void>;

  /** Returns a permanently-usable public URL — only ever called for `visibility = 'public'` assets. */
  getPublicUrl(path: string): string;

  /** Returns a short-lived signed URL — used for `restricted`/`hidden` assets (Database Architecture §11). */
  createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
