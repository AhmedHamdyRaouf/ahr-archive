# AHR Platform v1 — Navigation

**Status:** 🟡 Working — pending review

## Public Website Navigation (Primary — `SiteHeader`)

```
Home | About | Works | Projects | Media | Recognition | Contact        [Search] [ar/en]
```

Matches Sitemap (Phase 3) exactly — no Academy/Creative Network entries (Final Build Manifest freeze). Depth never exceeds two levels from Home (Navigation System, Phase 3): Home → Works → Work Detail.

## Public Website Footer Navigation

Secondary, non-duplicative: legal/policy links (if any exist later), contact info (from `platform_settings`), social links (from `platform_settings`) — never a second copy of the primary nav.

## Dashboard Navigation (Primary — `Sidebar`)

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
├── Search (admin view, embedded as a filter within relevant lists — not a separate nav item; see Search UI doc 14)
├── Moderation Queue
├── Activity Log
└── Settings
```

`AI` (Package 06) has no standalone navigation entry — it is embedded within CMS entity forms (Packages Specification, Package 06 §8). `Notifications` (Package 10) has no standalone navigation entry either in V1 — it is the Moderation badge in the Top Bar, linking directly to the Moderation Queue.

## Dashboard Top Bar

```
[Sidebar toggle]                    [Moderation badge] [Locale switch] [Account ▾ (Sign out)]
```

## Navigation Consistency Rule

The current section is always indicated in the Sidebar (active-state styling) and, where applicable, via Breadcrumbs on the content area itself — never only one or the other.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Sitemap, Navigation System (Phase 3), Navigation Architecture (Phase 7), Dashboard Structure (Phase 3)
