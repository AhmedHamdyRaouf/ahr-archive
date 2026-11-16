/**
 * Implements: Milestone 5 §"Media" — "Integrate with the Media Picker
 * abstraction from Milestone 4. DO NOT build the Media Library package."
 *
 * `media_asset` always points TO an owning entity (Data Integrity Rules,
 * Phase 4: exactly one of person_id/work_id/project_id/event_id) — there
 * is no scalar "cover media" column on any Archive entity to attach a
 * MediaPickerField to directly. The real integration point is therefore:
 * (a) list media already attached to a record (reverse relation), and
 * (b) let the Administrator attach an EXISTING media_asset by id, using
 * Milestone 4's RawIdMediaPickerAdapter — no upload, no browsing UI,
 * since that's Media Library's job in a later milestone.
 */

export type MediaOwnerType = "person" | "work" | "project" | "event";

const OWNER_COLUMN: Record<MediaOwnerType, string> = {
  person: "person_id",
  work: "work_id",
  project: "project_id",
  event: "event_id",
};

export interface MediaRelationsClient {
  from(table: "media_asset"): {
    select(columns: string): {
      eq(
        field: string,
        value: string,
      ): Promise<{ data: unknown[] | null; error: { message: string } | null }>;
    };
    update(row: Record<string, unknown>): {
      eq(
        field: string,
        value: unknown,
      ): Promise<{ data: unknown | null; error: { message: string } | null }>;
    };
  };
}

/** Lists media_asset rows currently attached to a given owner (read-only relation). */
export async function listRelatedMedia(
  client: MediaRelationsClient,
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<unknown[]> {
  const { data, error } = await client
    .from("media_asset")
    .select("*")
    .eq(OWNER_COLUMN[ownerType], ownerId);

  if (error) {
    throw new Error(`Failed to list media for ${ownerType}="${ownerId}": ${error.message}`);
  }
  return data ?? [];
}

/**
 * Attaches an EXISTING media_asset (selected via MediaPickerField, which
 * in V1 just accepts its id — RawIdMediaPickerAdapter) to a given owner,
 * by setting the appropriate owner FK column. The database's own
 * `chk_media_asset_owner_present` constraint still enforces "exactly one
 * owner" underneath this — this function does not re-implement that
 * check, it relies on it (defense in depth, same posture as every other
 * write path in this platform).
 */
export async function attachExistingMedia(
  client: MediaRelationsClient,
  mediaAssetId: string,
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<void> {
  const { error } = await client
    .from("media_asset")
    .update({ [OWNER_COLUMN[ownerType]]: ownerId })
    .eq("id", mediaAssetId);

  if (error) {
    throw new Error(`Failed to attach media_asset "${mediaAssetId}": ${error.message}`);
  }
}
