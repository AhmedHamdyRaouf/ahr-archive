# AHR Platform v1 — Dashboard Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Package Type:** Authenticated admin shell — hosts every admin-facing surface

Dashboard is the container every admin package renders inside: navigation, layout, platform settings, activity log, and moderation queue. It is not a content package itself — CMS forms (`05-CMS.md`) and future admin surfaces live *inside* this shell, they are not part of it.

---

## 1. Scope

**In scope:** Navigation shell/layout; Settings editor (`platform_settings`); Activity Log viewer (`activity_log`); Moderation Queue (list/detail/resolve for `moderation_report`).
**Out of scope:** Entity-specific CRUD forms (`05-CMS.md` owns those); AI suggestion logic (`14-AI-Integration.md`); media upload mechanics (`05-CMS.md` §5).

## 2. Routes

| Page | Path | Notes |
|---|---|---|
| Dashboard home | `/{locale}/dashboard` | Summary counts: open moderation reports, recent activity |
| Settings | `/{locale}/dashboard/settings` | Grouped key-value editor over `platform_settings` |
| Activity Log | `/{locale}/dashboard/activity` | Filterable (actor/action/date), paginated, read-only |
| Moderation Queue | `/{locale}/dashboard/moderation` | List + detail/resolve view |
| CMS section | `/{locale}/dashboard/cms/{entityType}[/{id}]` | Hosted here, owned by `05-CMS.md` |

Every route under `/dashboard/*` requires an authenticated Administrator session — enforced centrally, not per page (`08-Authentication-and-Authorization.md`).

## 3. Settings Editor

`platform_settings` is a key-value store (`key text PK`, `value jsonb`, `description text`) specifically so the Dashboard can introduce a new setting without a schema migration. Groupings surfaced in the editor: site info, SEO defaults, social links, AI configuration, email configuration, branding assets, feature flags, maintenance mode.

- Most keys are publicly readable (the public site renders from them — see `@ahr/site`'s explicit allowlist).
- `ai_configuration` and `email_configuration` are Administrator-read-only — operational configuration, not display content.
- Write access to every key is Administrator-only.
- A setting that gates visible behavior (e.g., Maintenance Mode) takes effect live, read fresh from `platform_settings` on each relevant request — never requiring a redeploy.

## 4. Activity Log Viewer

Read-only, paginated, filterable by actor/action/date. No UI path may edit or delete a row — `activity_log` is append-only end to end, from the database RLS policy (`02-Database.md` §10) up through this viewer. This is distinct from `entity_state_transition` (content lifecycle history, surfaced per-entity in `05-CMS.md`, not here) — see `11-Performance.md` §"Three Distinct Logs" for the full distinction.

## 5. Moderation Queue

Surfaces `moderation_report` rows through its own lifecycle, entirely separate from content `status`:

```
open → in_review → escalated / resolved
```

- List view: filterable by status, with `idx_moderation_report_status` backing the dominant "show me open reports" query.
- Detail/resolve view: assign to an Administrator, add `resolution_notes` (required to resolve), transition status.
- `@ahr/workflow` owns this lifecycle's business rules (a non-empty `reason` required to open a report; `resolutionNotes` required to resolve) — Dashboard's UI only invokes them, per `03-Backend.md` §2's "no re-implementation per call site."
- A live-derived open-report count (not a stored counter) drives the moderation badge shown in the Dashboard's navigation/top bar.

## 6. Notifications Surfacing

Wired-up events (`moderation_report_opened`/`escalated`/`resolved`, `content_published`) dispatch through `@ahr/notifications`' provider abstraction after the corresponding action succeeds. v1 has no persisted in-app notification inbox — dispatch is fire-and-forget through the configured channel (email today); one channel's failure never blocks another, and never blocks the primary action it's attached to. Full provider detail: `09-Integrations.md`.

## 7. Roles

Only `administrator` exists in v1 — full Dashboard access, no role-scoped views. `08-Authentication-and-Authorization.md` §Permissions Matrix has the authoritative per-surface breakdown.

## Backlog

- Role-scoped Dashboard views once additional roles exist (Release 2).
- Persisted in-app notification inbox and per-user notification preferences (schema gap — see `03-Backend.md` §7).
- Dashboard-level analytics/reporting beyond activity log and moderation counts.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Packages Specification Package 07 (Dashboard), Package 10 (Notifications); Moderation Logic (Phase 6); `02-Database.md`, `06-Dashboard.md` cross-references `05-CMS.md`, `08-Authentication-and-Authorization.md`
