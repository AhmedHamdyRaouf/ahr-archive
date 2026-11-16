# AHR Platform v1 — Information Architecture

**Status:** 🟢 Consolidated from Navigation doc (03) + Sitemap/Navigation System references — no new structure invented

## Public Website IA
```
Home
├── About
├── Works → Work Detail
├── Projects → Project Detail
├── Media
├── Recognition
└── Contact
```
Matches the frozen Sitemap exactly. Depth never exceeds two levels from Home (Home → Works → Work Detail) — a deliberately shallow IA appropriate for a credibility-first public archive.

## Dashboard IA
```
Dashboard (home)
├── CMS
│   ├── People
│   ├── Works
│   ├── Projects
│   ├── Events
│   ├── Awards
│   ├── Categories
│   └── Tags
├── Contacts & Organizations
├── Media Library
├── Search (embedded filter within relevant lists — not a separate nav item)
├── Moderation Queue
├── Activity Log
└── Settings
```
`AI` has no standalone navigation entry — embedded within CMS entity forms. `Notifications` has no standalone navigation entry in V1 — represented only by the Moderation badge in the Top Bar.

## Cross-Cutting IA Rules
- The current section is always indicated in the Sidebar (active-state styling) **and**, where applicable, via Breadcrumbs on the content area — never only one or the other.
- Public and Dashboard IAs are structurally independent (different registers, Design Principles §7) but both draw on the same component language (`SiteHeader`/`Sidebar` differ structurally, serve the same role).

## Known IA Gap (carried forward, not resolved here)
No "Profile Management" node exists in either IA — see User Flows §11 / Wireframes/Authentication.md for the full explanation. This is a scope gap in the frozen Packages Specification, not an IA design omission.

---

**Status:** 🟢 Complete for everything currently in scope
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
**Dependencies:** Sitemap, Navigation System, Wireframes/ (per-module detail)
