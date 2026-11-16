# AHR Platform v1 — Notifications UI

**Status:** 🟡 Working — pending review, **V1 scope is intentionally minimal — see §13 of Packages Specification Package 10**

## 1. Purpose
Make the Administrator aware of open moderation reports without needing to check the Moderation Queue manually — the only notification-worthy event with a concrete data source in V1's frozen schema (Packages Specification Package 10).

## 2. User Types
Administrator only.

## 3. Entry Points
The `ModerationBadge` in the Dashboard Top Bar, visible on every Dashboard screen.

## 4. Screen List
None — no dedicated Notifications screen exists in V1. The badge links directly into the Moderation Queue (Dashboard UI, doc 12).

## 5. Screen Hierarchy
N/A — this module has no screens of its own.

## 6. Navigation Flow
```
Any Dashboard page → ModerationBadge (count) → click → Moderation Queue
```

## 7. User Journey
Administrator notices the badge count while working elsewhere in the Dashboard → clicks it → is taken directly to the Moderation Queue → reviews and resolves.

## 8. Wireframe Description
A small count badge (number + icon) in the Top Bar — no dropdown panel, no notification list, no per-item detail rendered here (that's the Moderation Queue's job).

## 9. Layout Structure
Embedded within `DashboardShell`'s `TopBar` (Dashboard UI, doc 12, §9) — not a standalone layout.

## 10. Components Used
`ModerationBadge` only.

## 11. Tables
None.

## 12. Cards
None.

## 13. Forms
None.

## 14. Buttons
The badge itself is the only interactive element (acts as a link/button to the Moderation Queue).

## 15. Filters
None.

## 16. Search Experience
None.

## 17. Empty States
Zero open reports: badge shows nothing (or a visually quiet zero-state), never a persistently distracting "0" that competes for attention with real counts elsewhere.

## 18. Loading States
If the count query is momentarily unavailable, the badge is omitted rather than shown broken (Packages Specification Package 10 §19) — it never shows a stale or clearly-wrong number.

## 19. Error States
Count query failure: badge silently omits itself; no error message shown in the Top Bar (a failed notification-count badge is not worth interrupting the Administrator's current task over).

## 20. Success States
N/A.

## 21. Responsive Behaviour
Badge remains visible in the Top Bar at every breakpoint, including within Mobile Navigation's collapsed header.

## 22. Accessibility Notes
The badge's count must be announced to screen readers (e.g. "3 open moderation reports"), not conveyed by color/number alone.

## 23. Permissions
Administrator-only — the sole recipient of any notification in V1.

## 24. UX Rules
**Do not imply a general notification system exists anywhere in the UI copy** — label this "Open Reports," not "Notifications," until the schema gap (Packages Specification Package 10 §13) is resolved and a real feed exists (Packages Specification Package 10 §24).

## 25. Future Improvements
A full notification feed (pending the `notification` table decision); email delivery channel; Release 2 role-to-role notifications (collaboration requests, enrollment updates).

---

**Status:** 🟡 Working — scope intentionally minimal; schema gap unresolved
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 10, Package 07; Notification Experience (Phase 7)
