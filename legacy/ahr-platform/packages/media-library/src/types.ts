/**
 * `media_library` row shape, matching the migration exactly
 * (packages/database/migrations/20260724130000_media_library.sql). See
 * ../README.md for why this is a separate table from `@ahr/media`'s
 * `media_asset` rather than an extension of it.
 */
export interface MediaLibraryAssetRecord {
  id: string;
  image_key: string;
  title_ar: string | null;
  title_en: string | null;
  alt_text_ar: string | null;
  alt_text_en: string | null;
  caption_ar: string | null;
  caption_en: string | null;
  storage_path: string;
  width: number | null;
  height: number | null;
  tags: string[];
  /** Crop anchor (0-100, defaults 50/50 = center) — see focal point migration. */
  focal_x: number;
  focal_y: number;
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

export interface UploadAssetInput {
  imageKey: string;
  file: {
    bytes: Uint8Array;
    fileName: string;
    mimeType: string;
  };
  titleAr?: string;
  titleEn?: string;
  altTextAr?: string;
  altTextEn?: string;
  captionAr?: string;
  captionEn?: string;
  tags?: string[];
}

export interface UpdateAssetMetadataInput {
  titleAr?: string;
  titleEn?: string;
  altTextAr?: string;
  altTextEn?: string;
  captionAr?: string;
  captionEn?: string;
  tags?: string[];
  /** 'public' | 'restricted' | 'hidden' — see definition.ts for why this must be set explicitly, not assumed on publish. */
  visibility?: string;
  /** Crop anchor (0-100) — set together, never independently (a focal point is one 2D coordinate). */
  focalX?: number;
  focalY?: number;
}
