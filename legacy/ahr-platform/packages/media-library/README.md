# @ahr/media-library

**Status:** 🟡 Infrastructure only — built 2026-07-24 at the data owner's explicit request. The `media_library` table, this package, its Route Handlers, and its dashboard page all exist and work, but **nothing on the public site or in any other CMS entity references it yet.** That wiring is a deliberate next step, not done here.

## Why this is a separate package from `@ahr/media`

`@ahr/media` owns `media_asset` — frozen v1, governed, **entity-owned** content media. Every row is provenance-tied to exactly one Person/Work/Project/Event/Organization (`chk_media_asset_owner_present`), and "a single asset reusable across multiple entities" is explicitly documented as **blocked** in `packages/media/docs/blocked-metadata.md` §1, pending a formal Database Architecture Review Round.

`@ahr/media-library` owns `media_library` — a separate, additive table for a different responsibility: **ungoverned, reusable design/UI assets** (hero banners, decorative photography, icons) meant to be referenced by key across many static pages (Home, About, Works, Projects, Training, Media, etc.), with no single entity's provenance attached. This does **not** reopen or work around the `media_asset` block — it never claims to be entity-owned in the first place, so the blocked capability (governed content media reused across entities) remains genuinely unimplemented, exactly as documented.

Both packages still follow the same locked Data Foundation Conventions (shared id/created_at/updated_at shape, the one fixed `draft → review → verified → published → archived` status sequence, RLS with no exception) — see the migration's own header comment for the full reasoning.

## Storage

Reuses `@ahr/media`'s `StorageAdapter` interface and `SupabaseStorageAdapter` implementation directly (no new adapter, no new Supabase bucket) — uploads land in the same `media` Storage bucket, under a `library/{assetId}.{ext}` path prefix (`path.ts`), distinct from `media_asset`'s `{ownerType}/{ownerId}/{assetId}.{ext}` prefix.

## Modules

| File            | Responsibility                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `types.ts`        | `media_library` row shape, exactly as migrated                                                      |
| `path.ts`         | Storage path construction — `library/{assetId}.{ext}`                                               |
| `validation.ts`   | Image-only MIME check, file size limit, `image_key` format check                                     |
| `definition.ts`   | `media_library`'s `ResourceDefinition`, feeding `@ahr/cms-core`'s generic engine                     |
| `service.ts`      | Upload pipeline, metadata updates, lifecycle transitions, delete (archive-or-hard-delete), access URL |

## File Lifecycle

Reuses `@ahr/cms-core`'s exact Draft→Review→Verified→Published→Archived graph — no separate lifecycle. An asset only becomes publicly readable (per this migration's RLS `media_library_public_read` policy) once it reaches `published` + `visibility = 'public'`, same as every other content table. "Delete" in the dashboard archives any asset that ever left `draft` (file kept, per No Hard Delete); an asset still in `draft` is genuinely removed — row and Storage object both — matching the one documented exception in Data Lifecycle (Phase 4).

## Testing

```bash
npm run test --workspace=packages/media-library
npm run typecheck --workspace=packages/media-library
```
