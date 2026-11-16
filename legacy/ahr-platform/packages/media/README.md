# @ahr/media

**Status:** 🟢 Milestone 6 — Media Library implemented and tested (39 passing unit tests). Built strictly against the Frozen v1 Database Architecture — no schema changes.

Implements Packages Specification Package 08, as an independent, reusable package. See [`docs/blocked-metadata.md`](./docs/blocked-metadata.md) for the capabilities requested for this milestone that the frozen schema does not support — **read that document first**; it governs every design decision below.

## Storage Abstraction

`storage-adapter.ts` defines `StorageAdapter` — no other module in this package imports `@supabase/supabase-js`'s storage client directly. `SupabaseStorageAdapter` (`supabase-storage-adapter.ts`) is the one real implementation. Replacing Supabase Storage later means writing one new adapter, not touching `service.ts`, `validation.ts`, or `path.ts`.

## Modules

| File                                                 | Responsibility                                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                                           | `media_asset` row shape, exactly as migrated (Milestone 2) — `MEDIA_TYPES` deliberately excludes `'document'`                   |
| `path.ts`                                            | Storage path construction: `{ownerType}/{ownerId}/{assetId}.{ext}` (Database Architecture §11, verbatim)                        |
| `validation.ts`                                      | MIME→media_type derivation (rejects documents with a clear, documented error), file size limits, exactly-one-owner check        |
| `file-metadata.ts`                                   | Transient (never persisted) size/MIME/dimension extraction                                                                      |
| `storage-adapter.ts` / `supabase-storage-adapter.ts` | The Storage abstraction and its one real implementation                                                                         |
| `definition.ts`                                      | `media_asset`'s `ResourceDefinition`, feeding `@ahr/cms-core`'s generic engine                                                  |
| `service.ts`                                         | Upload pipeline, caption updates, lifecycle transitions, archive/restore, file replace (versioning-safe), access URL resolution |

## File Lifecycle

Reuses `@ahr/cms-core`'s exact, already-tested Draft→Review→Verified→Published→Archived graph (Milestone 4) — no separate media-specific lifecycle implementation. Archiving is always a status transition; the underlying Storage object is never removed (No Hard Delete, Phase 1/4).

## A Note on Duplicated Validation Logic

`assertExactlyOneOwner` here is structurally identical to `@ahr/content`'s Press Mention "exactly one subject" check, but is implemented independently rather than imported — Milestones 1–5 are frozen ("do not modify unless fixing a real bug"), and neither package had an existing reason to depend on the other for a few lines of validation. This is a deliberate, acknowledged exception to "no duplicated logic," scoped to one small function.

## Testing

```bash
npm run test --workspace=packages/media       # 39 tests
npm run typecheck --workspace=packages/media
```

No live Supabase project exists yet (Build Manifest item B4) — every test mocks the Storage/database client surfaces this package actually calls.
