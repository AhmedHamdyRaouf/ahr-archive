# AHR Platform v1 — Components Library

**Status:** 🟢 Carried forward from `16 - Components Library.md`, unchanged in substance — this remains the single indexed source of truth; no component is redefined here a second time.

## Purpose
Consolidated index of every named component referenced across the module UI documents and the Design System — pointing to where each is specified, so no component drifts by being documented twice.

## Shared Across Modules
| Component | Defined In | Used By |
|---|---|---|
| `EntityCard` | Design System | Website Designs, Wireframes (Search) |
| `VerificationBadge` | Design System | Website Designs, Wireframes (CMS, Contacts & Organizations) |
| Status Badge | Design System | Wireframes (CMS, Contacts & Organizations, Dashboard, Media Library) |
| `EntityForm` (shared shape) | Wireframes (CMS) | Wireframes (Contacts & Organizations, as `OrganizationForm`) |
| `StatusTransitionControl` | Wireframes (CMS) | Wireframes (Media Library, Contacts & Organizations) |
| `DashboardShell` (Sidebar + Top Bar) | Dashboard Designs | Wireframes (CMS, Contacts & Organizations, Media Library, AI, Notifications) |
| `SiteHeader` / `SiteFooter` | Website Designs | All public pages |
| `LocaleSwitcher` | Website Designs | Website Designs, Dashboard Designs (Top Bar) |
| `SearchBar` / `SearchResultsList` / `CategoryTagFilterBar` | Wireframes (Search) | Website Designs, admin search |

## Module-Specific Components
| Component | Module |
|---|---|
| `SignInForm`, `PasswordResetForm`, `AuthGuard` | Wireframes (Authentication) |
| `ContributionPicker`, `TaxonomyPicker`, `CompoundWorkEditor` | Wireframes (CMS) |
| `WorkDetailTemplate`, `ProjectDetailTemplate` | Website Designs |
| `RelatedRecordsPanel` | Wireframes (Contacts & Organizations) |
| `AISuggestionPanel` | Wireframes (AI) |
| `SettingsGroupEditor`, `ActivityLogTable`, `ModerationQueueTable`, `ModerationReportDetail` | Dashboard Designs |
| `MediaGrid`, `MediaUploadForm`, `MediaAssetDetail` | Wireframes (Media Library) |
| `ModerationBadge` | Wireframes (Notifications), rendered inside Dashboard Designs' Top Bar |

## Live-Index Rule
Any new component introduced during Development must be added to this index in the same review cycle it's introduced — this document stays a live index, not a point-in-time snapshot.

## Duplicate Removed by This Audit
The original doc's cross-references pointed to UI/UX Specification doc numbers (e.g. "Design System (02)"). This version repoints every reference to the new AHR-Experience-Design-v1.0 folder names so the Components Library remains internally consistent within the new deliverable structure — this is the one wording change made, purely a re-pointing of links, not a change of meaning.

---

**Status:** 🟢 Complete, carried forward
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
