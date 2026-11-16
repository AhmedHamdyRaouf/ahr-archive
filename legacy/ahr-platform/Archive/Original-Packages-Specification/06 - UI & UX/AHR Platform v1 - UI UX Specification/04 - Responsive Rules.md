# AHR Platform v1 — Responsive Rules

**Status:** 🟡 Working — pending review

## Breakpoint Categories

| Category | Approximate range | Primary devices |
|---|---|---|
| Mobile | up to ~767px | Phones |
| Tablet | ~768–1023px | Tablets, small laptops |
| Desktop | ~1024px and up | Laptops, desktops |

These are UX-planning ranges, not final implementation pixel values — Package 09 (Development, per the Final Build Manifest) may refine exact breakpoints without changing the behavior described here.

## Desktop

- Website: full 12-column grid, `SiteHeader` fully expanded, multi-column card grids (Works/Media listings).
- Dashboard: persistent `Sidebar`, data tables shown with all columns, side-by-side bilingual form fields.

## Tablet

- Website: card grids reduce to 2 columns; `SiteHeader` may collapse secondary links into a menu.
- Dashboard: `Sidebar` becomes collapsible/icon-only by default, expandable on demand; tables may hide the least-critical column (e.g. `updated_at`) before hiding status/verification, which are never hidden.

## Mobile

- Website: single-column card grids; `SiteHeader` collapses to a hamburger menu; Search becomes a dedicated icon/expandable bar.
- Dashboard: `Sidebar` replaced entirely by Mobile Navigation (bottom bar or slide-out drawer); tables become stacked card-style rows rather than horizontally scrolling — horizontal table scrolling is treated as a last resort, not a default mobile pattern.
- Bilingual form fields stack vertically (Arabic above/below English, per current locale first).

## Cross-Cutting Rule

Status/verification badges are never the first thing hidden when space is constrained, on any breakpoint or any module — they are core trust information (Design Principles §2), not decoration.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** UX Principles (Phase 7), Design System (doc 02)
