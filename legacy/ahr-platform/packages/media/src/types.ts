/**
 * Implements: Database Architecture (Frozen v1) §11 — Media Storage
 * Structure; §11.1 — Media Versioning Strategy; Entity Catalog (Phase 4)
 * — Media. See `../docs/blocked-metadata.md` for what is intentionally
 * absent from these types and why.
 */

/** Exactly the values `chk_media_asset_type` accepts — 'document' is deliberately absent, see docs/blocked-metadata.md §3. */
export const MEDIA_TYPES = ["image", "audio", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

/** Exactly the owner columns that exist on `media_asset` — no 'organization', see docs/blocked-metadata.md §2. */
export const MEDIA_OWNER_TYPES = ["person", "work", "project", "event"] as const;
export type MediaOwnerType = (typeof MEDIA_OWNER_TYPES)[number];

export const OWNER_COLUMN: Record<MediaOwnerType, string> = {
  person: "person_id",
  work: "work_id",
  project: "project_id",
  event: "event_id",
};

/** The full `media_asset` row shape, matching the Milestone 2 migration exactly. */
export interface MediaAssetRecord {
  id: string;
  media_type: MediaType;
  storage_path: string;
  caption_ar: string | null;
  caption_en: string | null;
  person_id: string | null;
  work_id: string | null;
  project_id: string | null;
  event_id: string | null;
  status: string;
  visibility: string;
  verification_status: string;
  source: string | null;
  owner_id: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Technical metadata computed at upload time — see docs/blocked-metadata.md
 * §5: none of this is persisted. It exists purely to be returned in the
 * same request/response cycle as the upload (e.g. for an upload
 * confirmation UI), never re-derivable later from a stored column.
 */
export interface TransientFileMetadata {
  fileSizeBytes: number;
  mimeType: string;
  /** Only populated for image/video where cheaply derivable; null otherwise. */
  width: number | null;
  height: number | null;
  /** Only populated for audio/video where cheaply derivable; null otherwise. */
  durationSeconds: number | null;
}

export interface UploadMediaInput {
  ownerType: MediaOwnerType;
  ownerId: string;
  file: {
    bytes: Uint8Array;
    fileName: string;
    mimeType: string;
  };
  captionAr?: string;
  captionEn?: string;
}

export interface UploadMediaResult {
  asset: MediaAssetRecord;
  transientMetadata: TransientFileMetadata;
}
