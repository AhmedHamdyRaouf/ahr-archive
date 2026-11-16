# @ahr/media — Specified but Blocked (Database Architecture Frozen v1)

**Status:** Documented gap, not implemented. Revisit only via an official Database Architecture Review Round (v2 or a dedicated revision) — never worked around in code.

Milestone 6 was scoped against the **Frozen v1 Database Architecture** exactly as it exists (`media_asset` table, migrated in Milestone 2). Several capabilities requested for Milestone 6 have no supporting column, constraint value, or relationship shape in that frozen schema. Per explicit instruction, none of them are implemented via a workaround, invented column, or constraint change — they are listed here, exactly the way `moderation_report`/`platform_settings`/`activity_log` were listed as gaps before they were added to the schema, and the way Contacts & Organizations' contact-info/tags gap remains listed today.

## 1. Multi-Entity Linking (a single asset reusable across many entities)

**Requested:** "A single media asset must be reusable and linkable to multiple entities."

**Blocked because:** `media_asset` enforces `chk_media_asset_owner_present` — **exactly one** of `person_id`/`work_id`/`project_id`/`event_id` may be set, never more than one, and there is no join table (no `media_asset_link`, unlike `work_category`/`work_tag`). This is not an oversight; it was a deliberate Data Integrity Rules decision (Phase 4) enforced by a real, tested database constraint since Milestone 2.

**What exists instead:** One media asset belongs to exactly one owning entity. To show the "same" image on two records today, the file must be uploaded twice, as two separate `media_asset` rows.

**Path to unblocking:** A `media_asset_link` join table (`media_asset_id`, `entity_table`, `entity_id`), mirroring the `work_category` pattern — a Database Architecture Review Round decision, not made here.

## 2. Organization as an Owner Type — ✅ Resolved 2026-07-21

**Requested:** Attaching media to Organizations (implied by "linkable to ... Organizations, etc.").

**Update 2026-07-21:** Approved by the data owner (Database Architecture Review Round item E5, `docs/Program-Status/Decision-Log.md`). `media_asset.organization_id` now exists (`packages/database/migrations/20260721120000_organization_schema_expansion.sql`), and `chk_media_asset_owner_present` was dropped and recreated to require exactly one of `person_id`/`work_id`/`project_id`/`event_id`/`organization_id`.

**What exists now:** Media can be attached to Person, Work, Project, Event, **or Organization**.

## 3. Documents as a Media Type

**Requested:** Support Images, Audio, Video, **and Documents**.

**Blocked because:** `chk_media_asset_type` constrains `media_type` to exactly `'image' | 'audio' | 'video'` — `'document'` is not, and has never been, a valid value. Inserting a row with `media_type = 'document'` is rejected by the database itself.

**What exists instead:** This package's upload pipeline and Storage abstraction are format-agnostic (they can move any file's bytes into Supabase Storage) — but `createMediaAsset` refuses to persist a `media_asset` row for a document-shaped upload, with a clear `UNSUPPORTED_MEDIA_TYPE` error pointing here, rather than silently miscategorizing it as `'image'` or bypassing the constraint.

## 4. Rich Descriptive Metadata

**Requested:** Title, Alt Text, Description, Copyright, Credits, Tags.

**Blocked because:** `media_asset` has exactly two descriptive columns: `caption_ar`, `caption_en`. There is no `title` (separate from caption), no `alt_text`, no `copyright`, no `credits`, and no tag join table for `media_asset` (unlike `work_tag`/`project_tag`).

**What exists instead:** `caption_ar`/`caption_en` are the only editable descriptive fields, and are used as the closest available field for a title/short-description role. Alt text on the public Website today falls back to caption (per Website UI, doc 08 §22 — this was already the design before Milestone 6).

## 5. File/Technical Metadata (size, MIME type, dimensions, duration)

**Requested:** Persisted file size, MIME type, dimensions (images/videos), duration (audio/video).

**Blocked because:** No columns exist for any of these on `media_asset`.

**What exists instead:** The upload pipeline (`file-metadata.ts`) still **computes** file size, MIME type, and (where cheaply derivable) dimensions/duration at upload time — this information is returned to the caller and can be shown in the upload confirmation UI in the same request/response cycle, but it is **not persisted** anywhere. Reloading the asset later will not show it again.

---

## Summary Table

| Requested capability                               | Status     | What ships instead in V1                                     |
| -------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| Multi-entity linking                               | 🔴 Blocked | Single-owner only (existing `chk_media_asset_owner_present`) |
| Organization as owner                              | 🔴 Blocked | Person / Work / Project / Event only                         |
| Documents as a type                                | 🔴 Blocked | Image / Audio / Video only (`chk_media_asset_type`)          |
| Title / Alt Text / Copyright / Credits / Tags      | 🔴 Blocked | `caption_ar` / `caption_en` only                             |
| Persisted file size / MIME / dimensions / duration | 🔴 Blocked | Computed transiently at upload time, not stored              |

**None of the above is implemented as a workaround.** Every one requires a Database Architecture Review Round before it can move from this document into real code.
