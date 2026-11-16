# AHR Platform v1 — Folder Structure

**Status:** 🔒 Frozen

## `apps/web` Internal Structure

```
apps/web/
├── app/
│   └── [locale]/                  # 'ar' | 'en' — the frozen bilingual routing decision
│       ├── (site)/                 # Public Website route group
│       │   ├── page.tsx             # Home
│       │   ├── about/
│       │   ├── works/
│       │   │   └── [slug]/
│       │   ├── projects/
│       │   │   └── [slug]/
│       │   ├── media/
│       │   ├── recognition/
│       │   ├── contact/
│       │   └── search/
│       ├── login/
│       │   └── reset/
│       └── dashboard/               # Authenticated route group
│           ├── cms/
│           │   └── [entityType]/
│           │       └── [id]/
│           ├── contacts/
│           │   └── [id]/
│           ├── media/
│           │   └── [id]/
│           ├── moderation/
│           │   └── [id]/
│           ├── activity/
│           └── settings/
├── app/api/                          # Route Handlers (where a Server Action isn't the fit — 08)
├── components/                        # Shared UI components (16 - Components Library mapping)
├── middleware.ts                       # Route protection (Authentication)
└── package.json
```

## `packages/*` Internal Structure

Every package follows the same internal shape, regardless of its specific responsibility:

```
packages/<name>/
├── src/
│   ├── index.ts       # Public exports ONLY — no deep imports from outside (Coding Standards)
│   └── ...             # Internal modules, not exported directly
├── package.json
└── README.md            # What this package owns, per Packages Specification
```

## `packages/database` Structure (already established, Milestone 2)

```
packages/database/
├── docs/
│   └── data-foundation-conventions.md
├── migrations/            # Numbered, applied in order, never edited after shipping
└── tests/
    └── smoke-test.sql
```

## Rule on Route Groups

`(site)` and `dashboard` are deliberately separate route groups within the same app, matching Design Principles' "Public and Admin are different registers, same system" — this is a folder-structure decision, not a new architectural one.

## Rule on Entity-Type Path Segments

`[entityType]` folders (CMS) implement the generic entity family documented in `03 - CMS API.md` — one set of components/handlers parameterized by the entity type, never one folder per entity type duplicating the same logic (API Conventions doc 15's "generic family" principle, applied to the folder structure itself).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Project Structure (02), API Specification, Sitemap (Phase 3)
