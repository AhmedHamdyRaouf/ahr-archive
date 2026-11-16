# AHR Platform v1 — Dashboard UI

**Status:** 🟡 Working — pending review

## 1. Purpose
The authenticated shell hosting every admin package, plus Settings, Activity Log, and Moderation Queue, per Packages Specification Package 07.

## 2. User Types
Administrator only.

## 3. Entry Points
Post-login redirect; direct navigation to any `/dashboard/*` path (subject to Authentication's route protection).

## 4. Screen List
Dashboard Home, Settings, Activity Log, Moderation Queue (list + detail).

## 5. Screen Hierarchy
```
Dashboard (home)
├── Settings
├── Activity Log
└── Moderation Queue → Moderation Report Detail
```
(CMS, Contacts & Organizations, Media Library, Search-admin-view render inside this shell but are documented in their own module docs.)

## 6. Navigation Flow
See Navigation (doc 03).

## 7. User Journey
Administrator lands on Dashboard Home (summary counts) → navigates via Sidebar to any admin section → returns to Home or moves directly between sections without returning "home" each time (Navigation Architecture, Phase 7).

## 8. Wireframe Description
Persistent Sidebar (left, Desktop) + Top Bar (locale, Moderation badge, account) + main content area. Dashboard Home shows summary cards (open reports count, recent activity snippet).

## 9. Layout Structure
`DashboardShell` = `Sidebar` + `TopBar` + content slot, used by every admin package's pages (Packages Specification Package 07 §9).

## 10. Components Used
`DashboardShell`, `SettingsGroupEditor`, `ActivityLogTable`, `ModerationQueueTable`, `ModerationReportDetail`, `ModerationBadge`.

## 11. Tables
Activity Log: Actor, Action, Entity (if applicable), Date, IP (Administrator-only sensitive column). Moderation Queue: Entity, Reason, Status, Reported date, Assigned to, Actions.

## 12. Cards
Dashboard Home summary cards (Open Reports count, Recent Activity).

## 13. Forms
Settings editor: grouped key-value forms (site info, SEO, social, AI configuration, email configuration, branding, feature flags, maintenance mode) — each `platform_settings` key rendered with an input type matching its expected shape (text, toggle, structured sub-fields for JSON objects like social links).

## 14. Buttons
Settings: Save (per group). Moderation: Resolve, Escalate (with a required notes field on Resolve).

## 15. Filters
Activity Log: actor, action type, date range. Moderation Queue: status.

## 16. Search Experience
Not a primary feature of this module — Activity Log/Moderation Queue use filters (§15) rather than free-text search in V1.

## 17. Empty States
Zero activity/zero open reports: calm "nothing to show" states, and for Moderation Queue specifically, an explicitly positive framing ("No open reports — all clear") rather than a neutral blank state, since this is good news for the Administrator.

## 18. Loading States
Standard Table skeleton loading, consistent with CMS UI.

## 19. Error States
Settings validation errors shown inline per field/key, matching the expected value shape (Packages Specification Package 07 §19).

## 20. Success States
Toast on Settings save; visible status change on Moderation actions.

## 21. Responsive Behaviour
Sidebar → collapsible icon rail (Tablet) → Mobile Navigation (Mobile), per Responsive Rules (doc 04). Dashboard Home summary cards reflow from a row to a stack.

## 22. Accessibility Notes
Moderation badge count must be announced to screen readers (not just visually rendered); Settings toggles always paired with a text label of their current state.

## 23. Permissions
Administrator-only for all screens; `ai_configuration`/`email_configuration` settings keys are never exposed to any non-administrator context (there being none in V1, this is a forward-looking safeguard for Release 2 roles).

## 24. UX Rules
Maintenance Mode toggle must never lock the Administrator out of the Dashboard itself — it only affects Visitor-facing rendering (Packages Specification Package 07 §17).

## 25. Future Improvements
Role-scoped navigation (Release 2); richer analytics on Dashboard Home; assignable moderation reports once more than one Administrator exists.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 07, Package 01; Dashboard Structure (Phase 3)
