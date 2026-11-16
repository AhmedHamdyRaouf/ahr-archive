# AHR Platform v1 — Responsive Designs

**Status:** 🟢 Carried forward from original UI/UX Specification, Responsive Rules — unchanged in substance

## Breakpoint Categories
| Category | Approximate range | Primary devices |
|---|---|---|
| Mobile | up to ~767px | Phones |
| Tablet | ~768–1023px | Tablets, small laptops |
| Desktop | ~1024px and up | Laptops, desktops |

These are UX-planning ranges, not final implementation pixel values — Development may refine exact breakpoints without changing the behavior described here.

## Desktop
Website: full 12-column grid, `SiteHeader` fully expanded, multi-column card grids. Dashboard: persistent `Sidebar`, full-column data tables, side-by-side bilingual form fields.

## Tablet
Website: card grids reduce to 2 columns; `SiteHeader` may collapse secondary links into a menu. Dashboard: `Sidebar` becomes collapsible/icon-only by default; tables may hide the least-critical column (e.g. `updated_at`) before hiding status/verification, which are never hidden.

## Mobile
See `Mobile Designs/README.md` for the full breakdown.

## Cross-Cutting Rule
Status/verification badges are never the first thing hidden when space is constrained, on any breakpoint or module — core trust information, not decoration.

---
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
