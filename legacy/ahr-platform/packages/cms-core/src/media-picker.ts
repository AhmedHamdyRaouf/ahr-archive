/**
 * Implements: Milestone 4 — "Media Picker abstraction (without
 * implementing Media Library package)."
 *
 * A future "media" field (types.ts FieldType) in any ResourceDefinition
 * needs a way to let the Administrator pick a `media_asset` row. The real
 * picker (browsing/uploading/selecting from the Media Library, Packages
 * Specification Package 08) does not exist yet — this module defines the
 * interface a form field calls, plus one default implementation that
 * simply accepts a raw `media_asset.id` (uuid) typed in directly, so CMS
 * Foundation is usable end-to-end before Media Library exists.
 */

export interface MediaPickerSelection {
  mediaAssetId: string;
}

export interface MediaPickerAdapter {
  /**
   * Resolves a selection into whatever the caller needs to display it
   * (e.g. a thumbnail URL) — the default adapter can't resolve anything
   * real yet (no Media Library), so it returns the id unchanged as a
   * placeholder label.
   */
  describeSelection(selection: MediaPickerSelection): Promise<{ label: string }>;
}

/**
 * Default adapter — no browsing/upload UI, just accepts a raw
 * media_asset.id. Swapped for a real Media Library-backed adapter later
 * (Milestone covering Package 08) without changing any form that uses the
 * "media" field type.
 */
export class RawIdMediaPickerAdapter implements MediaPickerAdapter {
  async describeSelection(selection: MediaPickerSelection): Promise<{ label: string }> {
    return { label: selection.mediaAssetId };
  }
}
