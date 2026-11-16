# AHR Platform v1 — Components Library

**Status:** 🟡 Working — pending review

Consolidated index of every named component referenced across the module UI documents (06–15) and the Design System (02). This document does not redefine them — it points to where each is specified, so no component is documented in two places with the risk of drifting apart.

## Shared Across Modules

| Component | Defined In | Used By |
|---|---|---|
| `EntityCard` | Design System (02) | Website (08), Search (14) |
| `VerificationBadge` | Design System (02) | Website (08), CMS (07), Contacts & Organizations (10) |
| Status Badge | Design System (02) | CMS (07), Contacts & Organizations (10), Dashboard (12), Media Library (13) |
| `EntityForm` (shared shape) | CMS UI (07) §13 | Contacts & Organizations (10, as `OrganizationForm`) |
| `StatusTransitionControl` | CMS UI (07) §10 | Media Library (13), Contacts & Organizations (10) |
| `DashboardShell` (Sidebar + Top Bar) | Dashboard UI (12) §9 | CMS (07), Contacts & Organizations (10), Media Library (13), AI (11, embedded), Notifications (15, embedded) |
| `SiteHeader` / `SiteFooter` | Website UI (08) §9 | All public pages |
| `LocaleSwitcher` | Website UI (08) §10 | Website (08), Dashboard Top Bar (12) |
| `SearchBar` / `SearchResultsList` / `CategoryTagFilterBar` | Search UI (14) | Website (08), CMS/Contacts & Organizations admin search |

## Module-Specific Components

| Component | Module |
|---|---|
| `SignInForm`, `PasswordResetForm`, `AuthGuard` | Authentication (06) |
| `ContributionPicker`, `TaxonomyPicker`, `CompoundWorkEditor` | CMS (07) |
| `WorkDetailTemplate`, `ProjectDetailTemplate` | Website (08) |
| `RelatedRecordsPanel` | Contacts & Organizations (10) |
| `AISuggestionPanel` | AI (11) |
| `SettingsGroupEditor`, `ActivityLogTable`, `ModerationQueueTable`, `ModerationReportDetail` | Dashboard (12) |
| `MediaGrid`, `MediaUploadForm`, `MediaAssetDetail` | Media Library (13) |
| `ModerationBadge` | Notifications (15), rendered inside Dashboard's Top Bar |

## Rule

Any new component introduced during development must be added to this index in the same review cycle it's introduced — this document is meant to stay a live index, not a point-in-time snapshot that silently goes stale.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Design System (02), all module UI documents (06–15)
