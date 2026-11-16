# @ahr/site

**Status:** 🟢 Milestone 8 — Public Website foundation implemented and tested (33 passing unit tests). Built strictly against the frozen architecture — no schema changes, no redesigns.

Pure, framework-free logic consumed by `apps/web`'s public-facing pages: bilingual routing utilities, SEO metadata/sitemap building, the public-readable `platform_settings` subset, the Design System's token catalog, and the primary navigation structure. No Next.js dependency, no UI — that lives in `apps/web/components/site` and `apps/web/app/[locale]/(site)`.

## Modules

| File                 | Responsibility                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `locale.ts`          | `SUPPORTED_LOCALES`, direction, path-locale-swapping (for the LocaleSwitcher)                                               |
| `seo.ts`             | Page title/description/canonical/hreflang-alternate building                                                                |
| `sitemap-builder.ts` | Static (Sitemap, Phase 3) + dynamic (published Work/Project slugs) sitemap entries                                          |
| `site-settings.ts`   | The public-readable `platform_settings` subset — an explicit allowlist, never `ai_configuration`/`email_configuration`      |
| `theme-tokens.ts`    | Design System (doc 02) token catalog — categories + neutral placeholder values, not final brand values (Blocking Issue B10) |
| `navigation.ts`      | Primary nav items, matching the frozen Sitemap exactly — no Search entry (Package 09 not yet built)                         |

## Corrections Made This Milestone

**Home moved into a `(site)` route group.** The Development Specification's own folder structure (doc 03) called for this from the start; Milestone 3 placed Home directly under `app/[locale]/page.tsx` instead. URLs are unaffected — this only corrects the internal file structure to match the already-frozen documentation.

## A Note on Theme Values

`theme-tokens.ts`'s color placeholders are **not the approved brand palette** — Visual Identity Rules (Phase 2) and Design System Foundations (Phase 7) both leave the actual values as Blocking Issue B10, unresolved. The values here match the placeholder set already established in `apps/web/app/globals.css` (from an earlier milestone) — this file and that CSS block must be kept in sync manually (a CSS file can't import TypeScript); a mismatch between them is a bug.

## Testing

```bash
npm run test --workspace=packages/site        # 33 tests
npm run typecheck --workspace=packages/site
```
