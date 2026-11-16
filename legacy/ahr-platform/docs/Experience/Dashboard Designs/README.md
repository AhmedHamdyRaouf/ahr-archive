# AHR Platform v1 — Dashboard Designs

**Status:** 🟢 Carried forward and organized from original UI/UX Specification, Dashboard UI

## Screens
Dashboard Home, Settings, Activity Log, Moderation Queue (list + detail). CMS, Contacts & Organizations, Media Library, and admin Search render inside this shell but are documented in `Wireframes/`.

## Shell Composition
`DashboardShell` = persistent `Sidebar` (Desktop) + `TopBar` (locale switcher, Open Reports badge, account/sign-out) + content slot — used by every admin package's pages. Dashboard Home shows summary cards (open reports count, recent activity snippet).

## Components
`DashboardShell`, `SettingsGroupEditor`, `ActivityLogTable`, `ModerationQueueTable`, `ModerationReportDetail`, `ModerationBadge`.

## Settings Structure
Grouped key-value forms: site info, SEO, social, AI configuration, email configuration, branding (pending Brand Identity B10), feature flags, maintenance mode — each rendered with an input type matching its expected shape.

## State Coverage Required
Empty (zero activity/zero open reports → explicitly positive framing: "No open reports — all clear," since this is good news for the Administrator) · Loading (standard Table skeleton) · Error (Settings validation inline per field/key) · Success (Toast on save; visible status change on Moderation actions).

## Hard Rule
Maintenance Mode toggle must never lock the Administrator out of the Dashboard itself — it only affects Visitor-facing rendering.

## Cross-References
IA: `Information Architecture/README.md` · Responsive behavior: `Responsive Designs/README.md` · Module screens rendered inside this shell: `Wireframes/`

---
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
