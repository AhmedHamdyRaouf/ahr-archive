# Admin Dashboard Verification Report

**Status:** 🔒 Final (CTO Phase 3 Deliverable)
**Verified against:** `06-Dashboard.md`, `08-Authentication-and-Authorization.md` §5, Packages Specification Package 07/10
**Surface:** `apps/web/app/[locale]/dashboard/*`, `@ahr/workflow` (moderation backend)

**A note on "User Dashboard":** the Phase 3 brief lists "User Dashboard" as a milestone to review separately from "Admin Dashboard." No such surface exists in the frozen architecture, and none should be built: `08-Authentication-and-Authorization.md` §4 is explicit that exactly one role (`administrator`) is active in v1 — there is no second account type ("User") to have a separate dashboard. This is confirmed, not a gap; building one would be adding a feature outside Master Roadmap v1.0. This report covers the one Dashboard surface that actually exists.

---

## 1. Critical Finding: Four Navigation Links Led Nowhere

**What was found:** `apps/web/components/dashboard/sidebar.tsx` — present since Milestone 3 — already listed navigation links for Contacts & Organizations, Media Library, Moderation Queue, Activity Log, and Settings. **Only the CMS entity links actually had a corresponding page.** The Dashboard home page's own placeholder text admitted this directly: *"Moderation Queue, Activity Log, and Settings arrive in later milestones."* But by the time of this audit, no later milestone had ever built them — the backend for all three was fully built and fully tested (`@ahr/workflow` for moderation: 25 tests; `activity_log`'s write path in `@ahr/auth`; `platform_settings` seeded since Milestone 2), yet an Administrator clicking any of these four sidebar links would hit a 404.

This is the most significant functional gap this audit found across Milestones 8–13: a Dashboard whose own navigation promised capability the UI never delivered, despite the backend being ready and tested.

## 2. What Was Fixed

### 2.1 Contacts & Organizations — a broken link, not a missing feature

The sidebar linked to `/dashboard/contacts`, which never existed. Investigation found `organizations` was already a fully-registered `entityType` in `@ahr/content`'s `ENTITY_DEFINITIONS` — meaning the already-working generic `/dashboard/cms/[entityType]` route already handles Organizations correctly with **zero new code**. The sidebar's href was corrected to point there. This was a one-line fix, not a missing feature.

### 2.2 Media Library — new page, existing backend

Built `apps/web/app/[locale]/dashboard/media/page.tsx`: a list view over every `media_asset`, using the exact same `genericList`/`getMediaAccessUrl` calls the already-working public Media page uses, but without the public-only status/visibility filter (an Administrator sees every asset). No new backend code — `@ahr/media`'s Milestone 6 work already provided everything this page needed.

**Scoped out of this fix, tracked as Backlog:** an upload UI (file picker + owner-entity selector). The already-tested `POST /api/media` endpoint is unaffected and ready for that UI whenever it is built — this fix closes "the link goes nowhere," not "build a full upload experience," which is a separate, larger piece of UI/UX design work.

### 2.3 Moderation Queue — new pages, existing backend

Built `/dashboard/moderation` (list, filterable by status, matching `06-Dashboard.md` §5) and `/dashboard/moderation/[id]` (detail view + a resolve/transition form). Both call `@ahr/workflow`'s already-built, already-tested functions (`listModerationReports`, `getModerationReport` directly from the Server Component; the resolve form posts to the already-existing, already-tested `POST /api/moderation-reports/[id]/transition` Route Handler — reusing the tested API layer rather than duplicating its validation client-side). No new backend code was needed for this surface.

### 2.4 Activity Log — new page, plus one new backend function

Built `/dashboard/activity` (read-only, paginated, filterable by actor/action, matching `06-Dashboard.md` §4). Unlike Moderation, this required one new backend function: **no read/query function for `activity_log` existed anywhere** — only the write side (`writeActivityLog`) had ever been built (Milestone 3 only ever needed to write to this table, never to read it back). Added `listActivityLog` to `@ahr/auth` (the same file that already owns `activity_log` writes), with 6 new unit tests. This function is read-only by construction: it contains no `UPDATE`/`DELETE` call, matching the append-only guarantee `10-Security.md` §7 enforces independently at the RLS layer regardless of this function's own behavior.

**A real bug was caught by writing the test first:** the initial implementation called Supabase's `.range()` (the terminal, promise-resolving call) *before* applying the `.eq()`/`.gte()`/`.lte()` filters, which silently made every filter a no-op. The dedicated test for "applies filters only when provided" failed immediately, the ordering was corrected, and the test suite re-run confirmed the fix. This is recorded here as a concrete example of why a new function ships with its own tests rather than being trusted on inspection alone.

### 2.5 Settings — new page, plus one new backend service

Built `/dashboard/settings` (a generic key-value editor over all 12 `platform_settings` keys, matching `06-Dashboard.md` §3's "the Dashboard can introduce a new setting without any migration"). No admin read/write service existed for the full table — only narrow, single-purpose public readers existed (`@ahr/site`'s public settings allowlist, `@ahr/notifications`' email-configuration reader). Added `apps/web/lib/settings-admin.ts` (`listAllSettings`, `updateSetting`) as an app-level helper, deliberately not added to any existing package: no package's own declared Milestone scope claims ownership of `platform_settings` admin CRUD, and expanding an existing package's scope for a single consumer would itself be a small scope decision needing its own review — this follows the exact precedent already set by `apps/web/lib/moderation.ts`. Every save writes a `settings_change` `activity_log` row (already a valid value in `chk_activity_log_action` — no schema change).

Wired via a Next.js Server Action (`updateSettingAction`), not a new Route Handler: this is a Dashboard-internal form submission, not an external API contract `07-API.md`'s endpoint-family table needs to document.

### 2.6 Capability Checks Added for Consistency

All four new/fixed pages now call `requireCapability` explicitly before reading their data (`moderation:manage`, `activity-log:read`, `settings:manage`, `media:manage`) — matching the pattern the existing CMS and API routes already use, rather than relying solely on the Dashboard layout's coarser "is there a session at all" check. Notably, `"activity-log:read"` and `"settings:manage"` were **already defined** in `@ahr/auth`'s `Capability` type before this audit — the capability model had already anticipated these exact pages; only the pages themselves were missing.

## 3. Verification Evidence

- `npm run build`: all new routes (`/dashboard/activity`, `/dashboard/media`, `/dashboard/moderation`, `/dashboard/moderation/[id]`, `/dashboard/settings`) compile and appear correctly in the route manifest, with the correct static/dynamic split.
- `npm run typecheck --workspace=@ahr/web`: clean.
- `npm run lint --workspace=@ahr/web`: clean, 0 errors, 0 warnings.
- `npm run test --workspace=packages/auth`: 40/40 passing (34 original + 6 new for `listActivityLog`).
- Full regression pass (`npm run test --workspaces --if-present`): all 318 tests across 9 packages still passing.

## 4. Completion, Risks, and Backlog

| | |
|---|---|
| **Completion** | 90% (was ~50% before this phase — four of five documented Dashboard surfaces beyond CMS had no page at all) |
| **Risks** | The Settings page allows editing any key as raw JSON, including `ai_configuration`/`email_configuration` — appropriate for an Administrator-only surface, but a malformed edit to `email_configuration` could silently break outbound notifications until corrected (no schema-level validation of a JSON value's *shape*, only that it's valid JSON) — worth a friendlier, field-structured editor in a future iteration, not a blocking risk today. |
| **Backlog** | Media Library upload UI (§2.2); a friendlier, field-structured Settings editor per known setting shape instead of raw JSON; bulk moderation actions; role-scoped Dashboard views once a second role exists (Release 2). |

---

**Prepared By:** CTO Office
