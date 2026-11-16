# AHR Platform v1 — Design System

**Status:** 🟡 Working — pending review

**Important framing, carried forward from Visual Identity Rules (Phase 2) and Design System Foundations (Phase 7), and unchanged by this document:** actual visual values (hex colors, font families, logo) remain an explicit open decision (Blocking Issue B10, Database Architecture Frozen v1). This document specifies **categories, roles, and rules** — the structure every value will slot into — not the values themselves. Nothing here should be read as a creative decision already made.

## Typography

| Role | Purpose |
|---|---|
| Display | Page-level headings (Home hero, Work title on detail page) |
| Heading 1–3 | Section headings, nested by hierarchy |
| Body | Primary reading text (bios, descriptions) |
| Body Small | Secondary/metadata text (dates, captions) |
| Label | Form labels, table headers, badges |

Rules: one type scale, shared by Arabic and English (each language gets its own font-family assignment later, but the same scale of sizes/weights); no more than 3 weight variants in the whole system (regular, medium, bold) to avoid visual noise.

## Colors (roles, not values)

| Role | Purpose |
|---|---|
| Primary | Master Brand actions, links, focus states |
| Secondary | Supporting accents, Sub-Brand differentiation within Visual Identity Rules' bounds (Phase 2) |
| Neutral (scale) | Text, backgrounds, borders — the majority of every screen |
| Success | Published/Verified/Resolved states |
| Warning | Review/Pending/Escalated states |
| Danger | Archived-as-a-warning contexts, destructive action confirmation, error states |
| Info | Neutral system messages, AI-suggestion panels |

Rule: color is never the only signal for status — always paired with a label or icon (Accessibility, doc 17).

## Spacing

A single base unit, multiplied consistently (e.g. 1×, 2×, 3×, 4×, 6×, 8×, 12×) — no arbitrary one-off spacing values on any screen. Dense admin tables use the smaller multiples; public Website content areas use the larger ones, per Design Principles §7.

## Grid

12-column grid on Desktop, collapsing per Responsive Rules (doc 04). Content areas (Website reading content) constrain to a comfortable reading measure; Dashboard data tables may use the full available width.

## Border Radius

A small fixed scale (none / small / medium / full-round) — used consistently: full-round only for pills/badges/avatars, small/medium for cards and inputs, none for dense table cells.

## Shadows (Elevation)

Four elevation levels: flat (0 — inline content), low (cards resting on the page), medium (dropdowns, popovers), high (modals/dialogs). Elevation communicates layering, not decoration — nothing gets a shadow "for style" alone.

## Icons

One consistent icon set/style (line-based, single stroke weight) across the entire platform — Website and Dashboard share the same icon language. Icons never stand alone for a critical action without a text label in the Dashboard (icon-only is acceptable only for universally understood, low-stakes actions).

## Component Specifications

### Buttons
Variants: Primary, Secondary, Tertiary/Ghost, Destructive. States: default, hover, focus, disabled, loading. Destructive actions (archive, delete-if-ever-applicable) always use the Destructive variant, never Primary.

### Inputs
Single-line text, with label above (never placeholder-as-label), helper text slot, error text slot. Bilingual fields (`_ar`/`_en`) render as a labeled pair, side by side on Desktop, stacked on Mobile.

### Selects
Native-feeling dropdown for single choice (e.g. `work_type`); for the constrained `check`-list values (Database Architecture §6–§8), the Select only ever offers the values the database itself allows — no free text where the schema constrains it.

### Textareas
For `description_*`/`bio_*` fields — resizable vertically, with a visible character-count only where a practical limit exists.

### Checkboxes / Radios / Toggles
Checkboxes for multi-select (Tag assignment). Radios for mutually exclusive choice with few options. Toggles for binary settings (`platform_settings` booleans like Maintenance Mode) — a toggle always labels both its on and off meaning, not just a colored switch.

### Tables
Used throughout Dashboard list views (Package 02/05/07/08). Columns: status/verification badges always leftmost or immediately after the name column, never buried to the far right. Row-level actions in a consistent trailing column.

### Pagination
Simple page-based pagination for admin tables; "load more"/infinite scroll is acceptable on the public Website's Works/Media listings, not in the Dashboard (predictability over convenience for admin work).

### Breadcrumbs
Used on Website detail pages and nested Dashboard sections — always reflects the actual navigational path (Navigation Architecture, Phase 7), never a decorative shortened version.

### Tabs
Used within a single entity's edit screen (e.g. a Work's "Details" / "Contributions" / "Media" tabs) — never used to hide required validation errors on an unvisited tab silently.

### Dialogs
Reserved for confirmation of consequential actions (status transitions, archiving) — never used for routine forms that belong on their own page.

### Toasts
Brief, non-blocking confirmation of a completed action (saved, published). Never used for information the user must not miss (errors requiring action use inline/Alert treatment instead).

### Alerts
Inline, persistent-until-dismissed or persistent-until-resolved messaging — used for the "this record has an open moderation report" warning (Package 02 §18) and similar standing conditions.

### Badges
Status/verification indicators — small, label + icon, using the Color roles above (Success/Warning/Danger/Info/Neutral).

### Chips
Used for Tags (removable, in taxonomy assignment UI) — visually distinct from status Badges so the two concepts are never confused.

### Cards
The primary way entities are previewed in lists on both Website and Dashboard (`EntityCard`, per the Packages Specification) — consistent anatomy: title, status/verification indicator, short metadata, primary action.

### Drawers
Used for secondary, contextual detail (e.g. viewing an Organization's Related Records, Package 05) without leaving the current list.

### Sidebars
The Dashboard's primary navigation container (Package 07) — persistent on Desktop, collapsible on Tablet, replaced by Mobile Navigation on Mobile.

### Navigation (Primary)
Public Website's `SiteHeader` and Dashboard's `Sidebar` are structurally different components serving the same navigational role in their respective registers (Design Principles §7).

### Top Bar
Dashboard-only: houses the locale switcher, the Moderation badge (Package 10), and the account/sign-out control.

### Footer
Public Website only: secondary links, not a repeat of primary navigation (Navigation System, Phase 3).

### Mobile Navigation
A bottom or slide-out menu replacing the Sidebar/SiteHeader on small screens — see Responsive Rules (doc 04) for the breakpoint behavior.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Visual Identity Rules (Phase 2), Design System Foundations (Phase 7) — actual values remain Blocking Issue B10
