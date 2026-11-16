# AHR Platform v1 — Wireframes (Textual Specification)

**Status:** 🟡 Text-based wireframe specification — agreed scope: no image-based wireframe files are produced (see Design Status Report.md for the scope note agreed before this build)

## What "Wireframes" Means in This Deliverable
Each file in this folder describes a screen's structural composition — regions, component placement, hierarchy, and the states that region must support — in enough detail that a designer or design tool could produce the visual wireframe from it directly. This is the textual layer beneath a visual wireframe, not a substitute pretending to be one.

## Index
| File | Module | Screens Covered |
|---|---|---|
| `Authentication.md` | Login/Reset | Sign In, Password Reset Request |
| `CMS.md` | Content authoring | Entity List, Entity Edit, Category Manager, Tag Manager |
| `Archive.md` | Domain layer | N/A — documented as having no screens, by design |
| `Contacts-Organizations.md` | Organizations | Organization List, Organization Detail/Edit |
| `AI.md` | AI Assistant | `AISuggestionPanel` (embedded, not a standalone screen) |
| `Media-Library.md` | Media | Library Grid/List, Upload, Asset Detail |
| `Search.md` | Search | Search Results (public); embedded admin search |
| `Notifications.md` | Open Reports badge | Top Bar badge only (no standalone screen) |

Website and Dashboard shell-level composition (SiteHeader/Footer, Sidebar/Top Bar, Home/About/Works/etc.) is documented in `Website Designs/` and `Dashboard Designs/` respectively, not duplicated here — this folder covers module-interior screens only, to avoid the same layout being described in two places.

---
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
