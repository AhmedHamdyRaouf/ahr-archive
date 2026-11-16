# Milestone 8 — Public Website Verification Report

**Status:** 🔒 Final (CTO Phase 3 Deliverable)
**Verified against:** `04-Frontend.md`, `01-Architecture.md` §6, `09-Integrations.md`
**Package/Surface:** `@ahr/site` + `apps/web/app/[locale]/(site)/*`

---

## 1. Current State

`@ahr/site` provides the pure, testable logic the Public Website's pages consume: locale utilities, SEO metadata building, sitemap building, the public-settings shape, navigation structure, and theme-token cataloging — 33 tests pass across 6 test files, all green.

The actual route group (`apps/web/app/[locale]/(site)/*`) renders: home (`/[locale]`), About, Contact, Works (list + detail), Projects (list + detail), Recognition, Media, and Search — plus `robots.ts` and `sitemap.ts` at the app root. All of these render server-side, reading only `status = 'published' AND visibility = 'public'` content, matching `01-Architecture.md` §6's "no session check performed, no cost paid" for this route group.

## 2. What Was Verified

- Bilingual routing (`/ar`, `/en` path segments) confirmed working end-to-end in a real production build — every page renders under both locales.
- `robots.ts`/`sitemap.ts` build correctly (confirmed in the production build output: `○ /robots.txt`, `ƒ /sitemap.xml`).
- No session/authentication cost is paid for any route in this group — confirmed by inspecting `apps/web/middleware.ts`'s matcher, which only covers `/dashboard/:path*`.

## 3. What Was Fixed in This Phase

- **Core Web Vitals — image optimization.** The public `/media` page used a raw `<img>` tag. Since this page's query is hard-filtered to `visibility = 'public'` content, `getMediaAccessUrl` always resolves a permanent public Storage URL for it (never an expiring signed URL — `05-CMS.md` §5), so it was safe to switch to `next/image` without any caching/staleness risk. Fixed, and `next.config.js` was given the corresponding `images.remotePatterns` entry for the Supabase Storage public-object path. Verified with a full rebuild: zero lint warnings, zero typecheck errors.
- **Security response headers.** Every Public Website route (like every other route in the app) now receives `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`, verified against a running production build with `curl -sI`. See the Security & Performance Final Review Report for full detail — this is a cross-cutting fix, not specific to this milestone, but it materially affects every page this milestone renders.

## 4. Verification Evidence

- `npm run test --workspace=packages/site`: 33/33 passing.
- `npm run build`: all Public Website routes build correctly, static where content allows it (`●`), dynamic where a slug or query parameter requires it (`ƒ`).
- `curl -sI` against a running instance confirms security headers and `Cache-Control: s-maxage=31536000, stale-while-revalidate` on the homepage.

## 5. Completion, Risks, and Backlog

| | |
|---|---|
| **Completion** | 95% |
| **Risks** | None found beyond the platform-wide items already tracked in the Security & Performance Final Review Report |
| **Backlog** | Final Design System token values (brand palette, typography) remain an open product/design decision outside engineering scope, per `04-Frontend.md` §5 — unchanged by this audit |

---

**Prepared By:** CTO Office
