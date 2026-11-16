import { VISIBILITY_VALUES, type ResourceDefinition } from "@ahr/cms-core";

/**
 * Feeds `@ahr/cms-core`'s generic engine so `media_library` reuses the
 * exact same, already-tested Draft→Review→Verified→Published→Archived
 * graph as every other table — no separate lifecycle implementation.
 *
 * `image_key`/`storage_path`/`width`/`height`/`tags` are NOT listed as
 * generic form fields: `image_key` is set once at upload and never
 * hand-edited afterward (same reasoning `@ahr/media`'s definition.ts
 * gives for `storage_path`), `storage_path`/`width`/`height` are set by
 * the upload pipeline, and `tags` is a `text[]` column — `@ahr/cms-core`'s
 * `FieldType` union has no array type, so it's handled directly by
 * `service.ts`/the dashboard form instead of the generic validator.
 *
 * None of title/alt_text/caption is `required: true` — `genericCreate`
 * runs full validation (not partial) at creation time, so a required
 * bilingual field would block uploading a draft before both languages are
 * filled in. Same posture `@ahr/media`'s definition.ts takes with caption
 * (optional there too): metadata can be completed afterward via the edit
 * screen, before the asset is promoted out of draft.
 *
 * `visibility` IS listed (unlike `status`, which only ever changes via
 * `genericTransitionStatus`, never a raw field update — see repository.ts).
 * It defaults to `'hidden'` on insert (migration default, matching every
 * other table), and nothing in `@ahr/cms-core`'s generic engine ever
 * changes it automatically on publish — an asset genuinely needs both
 * `status = 'published'` AND `visibility = 'public'` before this table's
 * RLS `..._public_read` policy exposes it to a public-site read, so this
 * has to be a real, editable field here rather than assumed implicit.
 *
 * `focal_x`/`focal_y` (data owner request 2026-07-25, focal point
 * migration): the crop anchor an Administrator sets by clicking the
 * preview image in the edit screen, consumed wherever a page renders this
 * asset inside a fixed-aspect-ratio `object-cover` frame (e.g. About's
 * `AssetImage`) so the important part of a photo isn't cropped away.
 * Listed here (not upload-only like `storage_path`) because — unlike
 * `image_key` — it's meant to be revisited after upload as many times as
 * needed, same posture as `visibility`.
 */
export const mediaLibraryDefinition: ResourceDefinition = {
  tableName: "media_library",
  label: "Asset",
  labelPlural: "Asset Library",
  hasSlug: false,
  hasLifecycle: true,
  fields: [
    { name: "title", type: "bilingual-text", label: "Title" },
    { name: "alt_text", type: "bilingual-text", label: "Alt Text" },
    { name: "caption", type: "bilingual-text", label: "Caption" },
    { name: "visibility", type: "select", label: "Visibility", options: VISIBILITY_VALUES },
    { name: "focal_x", type: "number", label: "Focal Point X" },
    { name: "focal_y", type: "number", label: "Focal Point Y" },
  ],
};
