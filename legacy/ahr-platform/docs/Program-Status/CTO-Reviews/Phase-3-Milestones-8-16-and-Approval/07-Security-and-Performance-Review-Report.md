# Security & Performance Final Review Report

**Status:** 🔒 Final (CTO Phase 3 Deliverable)
**Verified against:** `10-Security.md`, `11-Performance.md`, and every finding from Phases 1–2

This is a cumulative review: it re-verifies every Phase 1/2 finding still holds, and covers the additional items the Phase 3 brief names explicitly that weren't already covered.

---

## 1. Row Level Security — Re-Verified

Unchanged since Phase 2: RLS is enabled and policied on all 20 tables, re-verified in this phase's own test runs (`packages/database/tests/rls-smoke-test.sql` still passes in full). The known, disclosed limitation (the `activity_log` failed-login write path) remains open, still tracked as Backlog pending a live Supabase project — unchanged in this phase, since fixing it safely still requires that live environment.

## 2. Authentication & Authorization — Re-Verified, Extended

Session Resolution Chain and two-layer route protection unchanged and re-verified. **Extended in this phase:** every new Dashboard page added (Admin Dashboard Verification Report) now calls `requireCapability` explicitly, using capability values (`activity-log:read`, `settings:manage`, `media:manage`) that were already defined in `@ahr/auth`'s `Capability` type before this phase — the capability model had already anticipated these exact checks; this phase only added the call sites that use them.

## 3. Secrets Management — Re-Verified

`SUPABASE_SERVICE_ROLE_KEY` and the (Administrator-configured, dynamically-named) email provider key remain server-side-only, never in a `NEXT_PUBLIC_*` variable, never logged. No new secret was introduced by any change in this phase.

## 4. Rate Limiting

**Still not implemented in application code, and this audit confirms that is the correct call, not a gap to force-fix.** True rate limiting needs shared state across requests/instances (a counter store like Redis/Vercel KV) — no such store exists in the frozen architecture, and adding one would itself be an architecture change outside this audit's authority. `10-Security.md` §9 already correctly frames this as an infrastructure/edge-layer configuration step (Vercel's own Firewall / Attack Challenge Mode), not an application-code gap. **Recommendation, not implemented here:** enable Vercel's built-in rate-limiting/firewall features on the production project once it exists — an operational configuration task, tracked in the Production Readiness Checklist.

## 5. Headers — Fixed

**Finding:** no security response header was configured anywhere in the project — no `next.config.js` `headers()`, no `vercel.json`.

**Fix applied:** `apps/web/next.config.js` now sets, on every route including API routes: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (denying camera/microphone/geolocation/interest-cohort), and `Strict-Transport-Security` (1-year max-age, includes subdomains, preload). Also disabled the `X-Powered-By` header (minor information-disclosure hardening).

**Verified against a real running instance**, not just read from config: `curl -sI` against a locally-running production build confirms all five headers present on both a page route and an API route, and confirms `X-Powered-By` is gone.

## 6. Input Validation — Re-Verified

Unchanged since Phase 1/2: every package's own validation layer (business rules, taxonomy scoping, "exactly one owner" checks) runs before the database's own constraints, matching `03-Backend.md` §5. The two new backend additions in this phase (`listActivityLog`, `updateSetting`) both validate their own inputs (page/pageSize bounds, JSON parse failure surfaced as a field-level error, not a crash) before touching the database.

## 7. Performance — Re-Verified

N+1 query pattern check (a project-wide grep for a query-per-loop-iteration pattern) found none, matching `11-Performance.md` §2's requirement. Every foreign key across all 20 tables remains indexed (unchanged since Phase 2).

## 8. Caching — Re-Verified

Public Website pages continue to receive Next.js's default static/ISR-style caching (`Cache-Control: s-maxage=31536000, stale-while-revalidate`, confirmed via `curl` against a running build); `/dashboard/*` responses correctly receive no such caching (session-scoped, per-request rendering). No caching change was made in this phase — `11-Performance.md` §5's rules were already correctly followed.

## 9. Database Performance — Re-Verified

Unchanged since Phase 2: every foreign key indexed, RLS-scoped queries confirmed correct in the RLS behavior smoke test. The two new query functions added in this phase (`listActivityLog`, the Dashboard Moderation Queue's use of the already-existing `listModerationReports`) both use the existing indexes (`idx_activity_log_created_at`, `idx_activity_log_actor_id`, `idx_moderation_report_status`) rather than an unindexed scan.

## 10. Bundle Size — Reviewed

Production build output (`npm run build`): First Load JS shared by all routes is **87.3 kB**, with the largest individual page at **~103 kB** total. This is a small, healthy bundle size for a Next.js App Router application — no code-splitting or bundle-reduction work was needed. The four new Dashboard pages added in this phase (`activity`, `media`, `moderation`, `moderation/[id]`, `settings`) each add only a small, page-specific chunk (0.2–1.7 kB), consistent with the rest of the Dashboard.

## 11. Core Web Vitals — Fixed

**Finding:** the public Media page used a raw `<img>` tag instead of `next/image`, which affects Largest Contentful Paint and Cumulative Layout Shift for any page rendering images.

**Fix applied:** switched to `next/image` on the public Media page specifically (confirmed safe — see the Public Website Verification Report §3 for why this page's images are always permanent public URLs, never expiring signed URLs, which would have made `next/image`'s caching behavior risky). The new Dashboard Media Library page — an Administrator-only, non-cached view that may show restricted/hidden assets via short-lived signed URLs — deliberately keeps a raw `<img>` tag for exactly that reason, with the reasoning documented inline in the code and an explicit lint-disable rather than a silent suppression.

No custom web font is loaded anywhere in the project (confirmed by inspecting the root layout and `globals.css`) — this is consistent with `04-Frontend.md` §5's documented "Design System token values are an open product decision, not yet made" status, not a performance gap; there is no render-blocking font request to fix because there is no custom font yet.

## 12. Summary of Fixes Applied in This Phase

| # | Fix | File(s) |
|---|---|---|
| 1 | Security response headers on every route | `apps/web/next.config.js` |
| 2 | `X-Powered-By` disabled | `apps/web/next.config.js` |
| 3 | `next/image` + Storage remote pattern for the public Media page | `apps/web/next.config.js`, `apps/web/app/[locale]/(site)/media/page.tsx` |

## 13. Risks Remaining

| Risk | Status |
|---|---|
| Rate limiting not yet configured at the infrastructure layer | Recommendation given (§4); requires access to the live Vercel project, tracked in the Production Readiness Checklist |
| `activity_log` failed-login RLS edge case | Unchanged from Phase 2; requires a live Supabase project to fix and verify safely |
| Settings page allows editing `email_configuration`/`ai_configuration` as raw JSON with no shape validation | Disclosed in the Admin Dashboard Verification Report; not a security risk (Administrator-only), a UX risk for future iteration |

---

**Prepared By:** CTO Office
