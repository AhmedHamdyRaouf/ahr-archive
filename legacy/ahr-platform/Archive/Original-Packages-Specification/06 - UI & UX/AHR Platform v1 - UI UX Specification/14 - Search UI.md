# AHR Platform v1 — Search UI

**Status:** 🟡 Working — pending review

## 1. Purpose
Let visitors and Administrators find Works, People, Projects, Events, and Organizations, per Packages Specification Package 09.

## 2. User Types
Visitor (public, filtered to published+public); Administrator (admin search, unfiltered by status, embedded in CMS/Contacts & Organizations list views).

## 3. Entry Points
Public: `SearchBar` in `SiteHeader`, on every Website page. Admin: inline search box atop CMS/Contacts & Organizations Entity List screens (not a separate page).

## 4. Screen List
Search Results (`/{locale}/search`) — public only. Admin search has no dedicated screen (embedded control).

## 5. Screen Hierarchy
```
/search (public, standalone)
```
Admin search is not part of a standalone hierarchy — see CMS UI (doc 07) and Contacts & Organizations UI (doc 10).

## 6. Navigation Flow
See User Flows doc 05, §4.

## 7. User Journey
Visitor types a query → sees ranked results → optionally filters by Category/Tag → opens a result → routed to its detail page. Administrator types a query in an Entity List's search box → list filters in place, no page navigation.

## 8. Wireframe Description
Public Search Results: a search input at the top (pre-filled with the current query), a filter bar (Category/Tag) beside or below it, and a result list using the same `EntityCard` as other listings.

## 9. Layout Structure
`SearchBar` (input) + `CategoryTagFilterBar` + `SearchResultsList` (public). Admin: search input directly integrated into each module's existing `FilterBar`.

## 10. Components Used
`SearchBar`, `SearchResultsList`, `CategoryTagFilterBar`, `EntityCard` (reused, not a new result-specific card).

## 11. Tables
None on the public side. Admin search filters the existing Entity List table in place.

## 12. Cards
Public results use `EntityCard`, identical to other Website listings, so a search result never looks like a different kind of thing than browsing directly.

## 13. Forms
None beyond the search input itself.

## 14. Buttons
Submit (or live-as-you-type, a Package 10/Development-stage decision not fixed at the UX-spec level) + clear-query control.

## 15. Filters
Category, Tag — layered on top of the text query, per Packages Specification Package 09 §4.

## 16. Search Experience
Ranking: exact name/title match first, then verified-status preference, then relevance (Search Architecture, Phase 3) — this ordering must be visually evident (verified items don't need to be labeled "ranked higher," but should visually lead when tied on relevance).

## 17. Empty States
Zero results: a helpful message plus suggested Categories/Tags to browse instead — never a bare "no results" dead end (Packages Specification Package 09 §18, UX Principles Phase 7).

## 18. Loading States
Results list shows a skeleton while the query executes; the search input itself never appears to "freeze."

## 19. Error States
Backend search failure: "search is temporarily unavailable" message, logged server-side, search input remains usable for retry.

## 20. Success States
N/A in the confirmation sense — a populated, ranked result list is itself the success state.

## 21. Responsive Behaviour
Filter bar collapses into an expandable control on Mobile (Responsive Rules, doc 04); result cards follow the same grid reflow as other Website listings.

## 22. Accessibility Notes
Search input must be reachable via a skip-link or early Tab order on every page it appears on (it's in `SiteHeader`, present platform-wide); result count should be announced to screen readers after a query completes.

## 23. Permissions
Public search is filtered to published+public content only, enforced server-side (never trust a client-side filter) — this is a security requirement, not just a UX one (Packages Specification Package 09 §17).

## 24. UX Rules
A search result must never expose more information than the same entity's normal public detail page would — search is a discovery path, not a bypass of visibility rules.

## 25. Future Improvements
AI semantic/vector search (Database Architecture §16 — documented seam only); search analytics (popular/zero-result queries).

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 09, Package 03, Package 04; Search Architecture (Phase 3), Search & Discovery Experience (Phase 7)
