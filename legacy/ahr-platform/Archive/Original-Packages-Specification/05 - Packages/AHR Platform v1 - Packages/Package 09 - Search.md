# Package 09 — Search

**Status:** 🟡 Working — pending review
**Package Type:** Backend service + public/admin UI component

## 1. Package Overview

Implements Search Architecture (Phase 3) and Search Readiness (Database Architecture §16): PostgreSQL full-text search over `person`, `work`, `project`, `event`, `organization`, filtered to published+public for the public-facing surface.

## 2. Objectives

- Let visitors find Works/People/Projects/Events/Organizations by name/title/description, in either language.
- Prioritize verified, published content, per Search Architecture (Phase 3).

## 3. Scope

**In scope:** Full-text search over the five primary searchable entities, bilingual, with Category/Tag filtering layered on top.
**Out of scope:** AI semantic/vector search (Database Architecture §16 documents the future seam only — not built in V1); Academy/Creative Network content (doesn't exist in V1).

## 4. Features

- Public search bar/page, querying published+public rows only.
- Result ranking: direct name/title match first, then verified-status preference, per Search Architecture (Phase 3).
- Category/Tag filters layered on top of full-text results.
- Admin-side search within Package 02's entity lists (searches across all statuses, Administrator-only).

## 5. User Stories

- As a visitor, I can search for a name or work title and get relevant published results in my current language.
- As a visitor, searching in Arabic finds the same underlying entities as searching in English.
- As the Administrator, I can search across Draft/Review/Published content in CMS list views, not just published content.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Public search must only return `status='published'` and `visibility='public'` rows. |
| FR-2 | Search must match against both `_ar` and `_en` fields regardless of the query's language. |
| FR-3 | Verified content ranks above self-reported/pending content, all else equal (Search Architecture, Phase 3). |
| FR-4 | Admin search (within CMS) is not subject to the published+public filter — Administrators search everything they can already see. |

## 7. Non-Functional Requirements

- Search should return results quickly enough to feel responsive on a typical public page (no specific numeric SLA fixed in V1, per Technical Architecture's "no numeric thresholds at the architecture level").

## 8. Pages

| Page | Path | Notes |
|---|---|---|
| Search results | `/{locale}/search?q=...` | Public |

Admin search has no dedicated page — it's a filter control embedded in Package 02's existing list views.

## 9. Components

- `SearchBar` (public, in `SiteHeader`)
- `SearchResultsList`
- `CategoryTagFilterBar`

## 10. Navigation Flow

```
Any public page → SearchBar → /search?q=... → result → Work/Project/Person/Event/Organization detail page
```

## 11. Complete Workflow

```
① Visitor submits a query
② Query runs against the five searchable entities' generated tsvector columns
   (Database Architecture §16 — added as an additive migration, not a redesign)
③ Results ranked: exact name/title match → verified status → relevance
④ Visitor optionally narrows by Category/Tag
⑤ Visitor opens a result → routed to the corresponding Package 03 detail page
```

## 12. Roles & Permissions

Visitors get the published+public-filtered public search. Administrators get the unfiltered admin search, embedded in Package 02.

## 13. Database Tables Used

`person`, `work`, `project`, `event`, `organization` (read, via generated `tsvector` columns per Database Architecture §16), plus `category`/`tag`/join tables for filtering.

## 14. APIs Required

- `search(query, locale, filters)` — public, filtered.
- `adminSearch(query, entityType, filters)` — Administrator-only, unfiltered by status.

## 15. Validation Rules

- Empty query returns an empty/prompt state, not an error.
- Query length capped to a reasonable maximum to prevent abuse (specific number is a Package 11/Security Hardening concern, not fixed here).

## 16. Business Rules

- Search never exposes non-public content to an unauthenticated request — this is enforced at the query layer and backed by Row Level Security (defense in depth, same posture as Package 03).
- Search Architecture (Phase 3): the five entities are searched directly; Award/Media/Press are discoverable *through* them, not independently indexed.

## 17. Security Considerations

- Public search query must be parameterized (no raw string concatenation into the `tsquery`), standard injection prevention.
- Admin search still requires an authenticated session (Package 01), even though it returns unfiltered results.

## 18. Edge Cases

- Query with no results → empty state with a suggestion to broaden the search, not a bare "no results" dead end (UX Principles, Phase 7).
- Query matching both an Arabic and English field of the same row → the row appears once, not duplicated.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Search backend error | Generic "search is temporarily unavailable" message, logged server-side |
| Malformed query syntax (special characters) | Sanitized/escaped before reaching `tsquery`, never surfaced as a raw error |

## 20. Acceptance Criteria

- [ ] Public search returns only published+public results.
- [ ] Bilingual matching works regardless of query language.
- [ ] Verified content ranks above unverified, all else equal.
- [ ] Admin search returns results across all statuses.
- [ ] Category/Tag filters correctly narrow results.

## 21. Dependencies

- **Depends on:** Package 04 (Archive, for the underlying data), Database Architecture (Frozen v1) §16.
- **Depended on by:** Package 03 (public search UI), Package 02 (admin list search).

## 22. Future Improvements (Post v1)

- AI semantic/vector search (`pgvector`, Database Architecture §16 — documented seam only).
- Search analytics (popular queries, zero-result queries).

## 23. Testing Checklist

- [ ] Published+public filter holds for every entity type.
- [ ] Arabic query finds English-only-matching content and vice versa where a bilingual field pair exists.
- [ ] Ranking order matches the documented priority (exact match → verified → relevance).
- [ ] Admin search is not filtered by status.

## 24. UX Notes

- No-results state should still feel helpful, not like a dead end (suggest categories/tags to browse instead).

## 25. Developer Notes

- The `tsvector` generation and GIN index are additive migrations on existing tables (Database Architecture §16) — this package does not require any new tables.

---

**Status:**
🟡 Working

**Package:**
09 — Search

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 04 (Archive), Search Architecture (Phase 3), Search & Discovery Experience (Phase 7), Database Architecture (Frozen v1) §16
