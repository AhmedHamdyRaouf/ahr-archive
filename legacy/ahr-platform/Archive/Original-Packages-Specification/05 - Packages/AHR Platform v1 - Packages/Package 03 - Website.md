# Package 03 — Website

**Status:** 🟡 Working — pending review
**Package Type:** Public-facing frontend (Next.js App Router)

## 1. Package Overview

Website is the public presentation layer — every page a visitor (unauthenticated) can reach. It renders only `published` + `public` content from the Archive domain (Package 04), per Sitemap and Navigation System (Phase 3) and UX Principles (Phase 7).

## 2. Objectives

- Present the Archive credibly and clearly to visitors, in both Arabic and English.
- Never expose Draft/Review/Restricted/Hidden content.
- Provide the entry points other packages (Search, Media Library) surface content through.

## 3. Scope

**In scope:** Home, About, Works (list + detail), Projects (list + detail), Media, Recognition, Contact — exactly the pages in Sitemap (Phase 3), bilingual (`/ar`, `/en`).
**Out of scope:** Any Academy or Creative Network page, stub, or link (Final Build Manifest freeze). Any authenticated/admin page (Package 07).

## 4. Features

- Bilingual routing (`/ar/*`, `/en/*`) per the frozen App Router decision.
- Home page.
- About page (Foundational Personal Brand content).
- Works listing + Work Detail template (including compound-work relationships via `parent_work_id`).
- Projects listing + Project Detail template.
- Media page (public `media_asset` rows).
- Recognition page (`award` rows).
- Contact page.

## 5. User Stories

- As a visitor, I can browse Works and open one to see full details, contributors, and related media.
- As a visitor, I can read About to understand who Ahmed Hamdy Raouf is.
- As a visitor, I can see Recognition (awards) with their granting Organization.
- As a visitor, I can switch between Arabic and English without losing my place.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Every page must render only rows where `status = 'published'` and `visibility = 'public'`. |
| FR-2 | Every page must exist under both `/ar` and `/en`. |
| FR-3 | Work Detail must show linked Contributions (with Person name + role) and linked Media. |
| FR-4 | Site must never 500 on a missing/invalid slug — respond with a proper not-found page. |

## 7. Non-Functional Requirements

- Performance: public pages should be fast for read-heavy traffic (Scalability & Performance Architecture, Phase 8 — cacheable, mostly-static content).
- Accessibility: contrast, screen-reader support, no color-only status signaling (Design System Foundations, Phase 7).
- No admin functionality of any kind leaks into this package.

## 8. Pages

| Page | Path pattern | Source table(s) |
|---|---|---|
| Home | `/{locale}` | Aggregates featured `work`/`person`/`award` |
| About | `/{locale}/about` | `person` (Foundational Personal Brand row) |
| Works list | `/{locale}/works` | `work` |
| Work detail | `/{locale}/works/[slug]` | `work`, `contribution`, `media_asset` |
| Projects list | `/{locale}/projects` | `project` |
| Project detail | `/{locale}/projects/[slug]` | `project`, `contribution`, `media_asset` |
| Media | `/{locale}/media` | `media_asset` |
| Recognition | `/{locale}/recognition` | `award`, `organization` |
| Contact | `/{locale}/contact` | `platform_settings` (`contact_information` key) |

## 9. Components

- `SiteHeader` / `SiteFooter` (Navigation Architecture, Phase 7)
- `EntityCard` (shared with CMS list previews where visually applicable)
- `VerificationBadge`
- `WorkDetailTemplate`, `ProjectDetailTemplate`
- `LocaleSwitcher`

## 10. Navigation Flow

```
Home → Works → Work Detail → (related Works/Person, contextual nav)
Home → About / Recognition / Media / Contact
Any page → LocaleSwitcher → same page, other language
```

## 11. Complete Workflow

```
① Visitor requests a page
② Server component queries only published+public rows (Package 04 domain layer)
③ Page renders with both-language-parity content, current locale selected
④ Not-found slugs render a proper 404, never a raw error
```

## 12. Roles & Permissions

Visitor only (unauthenticated, implicit — Database Architecture §7). No role check happens here beyond "not an admin route."

## 13. Database Tables Used

`work`, `project`, `event`, `person`, `contribution`, `award`, `organization`, `media_asset`, `category`, `tag`, `work_category`, `work_tag`, `project_category`, `project_tag` — read-only.

## 14. APIs Required

Read-only Server Components / Route Handlers per page, all filtered server-side by `status`/`visibility` — never filtered client-side (a security requirement, not just a performance one).

## 15. Validation Rules

N/A for input — this package has no forms. Slug format validation only (reject malformed slugs before querying).

## 16. Business Rules

- Only `published` + `public` rows are ever rendered — enforced at the query layer, backed by Row Level Security (Database Architecture §8) as a second layer of defense.
- Bilingual parity: a page is not considered complete if one language's fields are empty while the other's aren't (Publication Rules, Phase 6).

## 17. Security Considerations

- No admin functionality reachable from this package.
- RLS is the backstop even if a query layer bug exists (defense in depth).
- No user input is ever interpolated into a query (standard injection prevention, applies regardless of ORM/ORM-less approach chosen in Package 04).

## 18. Edge Cases

- A Work with no Media at all → detail page renders gracefully without a media section.
- A Work whose only Contribution's Person is not itself published → the Contribution/Person name may need graceful degradation (display name without a working profile link); flagged for Developer Notes.
- Slug collision after a rename → handled by Package 04's "no breaking URLs" redirect rule (URL Structure, Phase 3), not by this package.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Invalid/missing slug | Proper localized 404 page |
| Backend/database error | Generic "something went wrong" page, no stack trace, logged server-side |

## 20. Acceptance Criteria

- [ ] All 9 pages exist and render under both locales.
- [ ] No draft/restricted/hidden content ever appears.
- [ ] Work Detail correctly shows Contributions and Media.
- [ ] 404 handling works for invalid slugs.

## 21. Dependencies

- **Depends on:** Package 04 (Archive domain layer), Package 08 (Media Library, for asset URLs), Package 09 (Search, if search UI lives on Website).
- **Depended on by:** None (this is the outermost, presentation-only package).

## 22. Future Improvements (Post v1)

- Academy/Creative Network public pages (Release 2).
- Personalization for returning visitors.
- Richer related-content recommendations (Package 06, AI).

## 23. Testing Checklist

- [ ] Every page type renders with real published data.
- [ ] Every page type renders gracefully with zero matching data.
- [ ] Locale switch preserves the current page/slug.
- [ ] No restricted/hidden/draft content is reachable by direct URL guessing.

## 24. UX Notes

- Consistent visual weight between Arabic and English — neither is "the real version" (UX Principles, Phase 7).
- Verification status should be visible on entity displays without requiring a click (Information Presentation, Phase 7).

## 25. Developer Notes

- All page-level data fetching should go through Package 04's domain functions, never direct table queries duplicated in Website — keeps the "at least one Contribution," "published+public only" rules in one place.

---

**Status:**
🟡 Working

**Package:**
03 — Website

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 04 (Archive), Sitemap / Navigation System (Phase 3), UX Principles / Design System Foundations (Phase 7), Database Architecture (Frozen v1)
