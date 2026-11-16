# AHR Platform v1 — Mobile Designs

**Status:** 🟢 Included in v1.0 scope, as the Mobile breakpoint of the responsive Website and Dashboard — there is no separate native mobile app in v1.0 scope, and this audit does not add one (would be an out-of-scope feature).

## Scope Clarification
"Mobile Designs" in this platform means the Mobile breakpoint (≤ ~767px) of the same responsive Website and Dashboard documented in `Responsive Designs/README.md` — not a distinct native iOS/Android application. This is consistent with the frozen Packages Specification, which defines no native app package.

## Website at Mobile
Single-column card grids; `SiteHeader` collapses to a hamburger menu; Search becomes a dedicated icon/expandable bar.

## Dashboard at Mobile
`Sidebar` replaced entirely by Mobile Navigation (bottom bar or slide-out drawer); tables become stacked card-style rows rather than horizontally scrolling — horizontal table scroll is a last resort, not a default mobile pattern. Bilingual form fields stack vertically (current locale first).

## Cross-Cutting Rule
Status/verification badges are never the first thing hidden when space is constrained, at any breakpoint or module.

## If a Native App Is Wanted Later
That would be a v2.0/Release 2 scope decision, not a v1.0 Experience & Design gap — logged in `Backlog.md` as an idea, not designed against here.

---
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
