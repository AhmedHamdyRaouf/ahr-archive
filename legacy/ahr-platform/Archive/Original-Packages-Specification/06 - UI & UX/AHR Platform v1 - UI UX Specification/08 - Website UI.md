# AHR Platform v1 — Website UI

**Status:** 🟡 Working — pending review

## 1. Purpose
Present the published Archive credibly to visitors, bilingually, per Packages Specification Package 03.

## 2. User Types
Visitor (unauthenticated) only.

## 3. Entry Points
Direct URL, search engines, shared links to specific Work/Project/Person pages, internal navigation.

## 4. Screen List
Home, About, Works (list), Work Detail, Projects (list), Project Detail, Media, Recognition, Contact.

## 5. Screen Hierarchy
```
Home
├── About
├── Works → Work Detail
├── Projects → Project Detail
├── Media
├── Recognition
└── Contact
```
Matches Sitemap (Phase 3) exactly.

## 6. Navigation Flow
See Navigation (doc 03) and User Flows (doc 05, §5).

## 7. User Journey
Visitor lands on Home (or a deep link) → explores Works/Projects/Recognition → opens details → discovers related content via contextual links → optionally uses Search.

## 8. Wireframe Description
Home: hero + featured Works/Recognition sections. List pages: filterable card grid. Detail pages: title block, bilingual body content, Contributions list, related Media gallery, contextual related-content section at the bottom.

## 9. Layout Structure
`SiteHeader` (sticky) → page content (12-column grid, constrained reading width for body text) → `SiteFooter`.

## 10. Components Used
`EntityCard`, `VerificationBadge`, `WorkDetailTemplate`, `ProjectDetailTemplate`, `LocaleSwitcher`, `SearchBar`.

## 11. Tables
None — public pages use Cards, not admin-style tables.

## 12. Cards
`EntityCard`: image (if available), title, short excerpt, verification indicator, link to detail.

## 13. Forms
Contact page only: a simple contact form (if specified) or static contact details from `platform_settings` — Packages Specification does not define a contact-form submission mechanism in V1, so this defaults to displaying static contact information only, not a form with backend handling, unless clarified in a future round.

## 14. Buttons
Primary: "View Work" / "Read more" style card actions. No destructive actions exist on this public surface.

## 15. Filters
Works/Projects listings may filter by Category/Tag (Search UI, doc 14, shared logic).

## 16. Search Experience
`SearchBar` in `SiteHeader` → `/search` results page — see Search UI (doc 14).

## 17. Empty States
A list page with zero published items (unlikely post-launch, possible pre-launch) shows a calm "nothing published yet" message, not an error.

## 18. Loading States
Server-rendered pages primarily; any client-side data (e.g. related content) shows a lightweight skeleton, never a spinner-only blank page.

## 19. Error States
Invalid/missing slug → proper localized 404. Backend error → generic "something went wrong" page (Packages Specification Package 03 §19).

## 20. Success States
N/A in the traditional sense (no user actions to confirm) — locale switching should feel instantaneous with no flash of unstyled/untranslated content.

## 21. Responsive Behaviour
See Responsive Rules (doc 04) — card grids reflow 3→2→1 columns Desktop→Tablet→Mobile; `SiteHeader` collapses to a hamburger menu on Mobile.

## 22. Accessibility Notes
All imagery has bilingual alt text sourced from `media_asset` captions; heading hierarchy is never skipped for visual-size reasons.

## 23. Permissions
Fully public — no authentication anywhere in this module.

## 24. UX Rules
Never render Draft/Review/Restricted/Hidden content, under any circumstance, including via direct URL guessing (Packages Specification Package 03 §16–§18).

## 25. Future Improvements
Personalization for returning visitors; richer AI-driven related-content recommendations (Package 06); Academy/Creative Network pages (Release 2).

---

**Status:** 🟡 Working — item §13 (Contact form mechanism) flagged for clarification
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 03, Package 04, Package 09; Sitemap/Navigation System (Phase 3)
