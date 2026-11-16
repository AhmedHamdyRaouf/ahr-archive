# AHR Platform v1 — Design System

**Status:** 🟢 Structurally complete — visual values ratified 2026-07-21 (see below)
**Source:** carried forward and expanded from `06 - UI & UX/.../02 - Design System.md` (unchanged in substance; expanded with a Table of Contents and cross-links into the new Design Tokens/, Color System/, Typography/ folders so the same rule is never stated in two places with a risk of drifting apart).

> **Open Decision B10 — Ratified 2026-07-21:** actual visual values (hex colors, font families) were an explicit open business decision; the data owner has now instructed this system to mirror `ahmedhamdyraouf.com` directly, and the literal color palette and font families have been sourced from that site's live CSS. See `Design Tokens/`, `Color System/`, and `Typography/` for the ratified values, and `docs/Program-Status/Decision-Log.md` for the record. A standalone logo/wordmark file remains outstanding (the live site itself has none) — see `Brand Identity/README.md`.

## Table of Contents
1. Typography (roles) — see also `Typography/`
2. Colors (roles) — see also `Color System/`
3. Spacing
4. Grid
5. Border Radius
6. Shadows (Elevation)
7. Icons — see also `Icons & Assets/`
8. Component Specifications (Buttons through Mobile Navigation)

## 1. Typography (roles)
| Role | Purpose |
|---|---|
| Display | Page-level headings (Home hero, Work title on detail page) |
| Heading 1–3 | Section headings, nested by hierarchy |
| Body | Primary reading text (bios, descriptions) |
| Body Small | Secondary/metadata text (dates, captions) |
| Label | Form labels, table headers, badges |

Rules: one type scale, shared by Arabic and English (each language gets its own font-family assignment once B10 resolves, but the same scale of sizes/weights); no more than 3 weight variants in the whole system (regular, medium, bold).

## 2. Colors (roles, not values)
| Role | Purpose |
|---|---|
| Primary | Master Brand actions, links, focus states |
| Secondary | Supporting accents, Sub-Brand differentiation |
| Neutral (scale) | Text, backgrounds, borders — the majority of every screen |
| Success | Published / Verified / Resolved states |
| Warning | Review / Pending / Escalated states |
| Danger | Archived-as-warning contexts, destructive confirmation, error states |
| Info | Neutral system messages, AI-suggestion panels |

Rule: color is never the only signal for status — always paired with a label or icon (see Accessibility Guidelines/).

## 3. Spacing
A single base unit, multiplied consistently (1×, 2×, 3×, 4×, 6×, 8×, 12×) — no arbitrary one-off spacing values on any screen. Dense admin tables use the smaller multiples; public Website content areas use the larger ones (Design Principles §7).

## 4. Grid
12-column grid on Desktop, collapsing per Responsive Designs/. Content areas (Website reading content) constrain to a comfortable reading measure; Dashboard data tables may use the full available width.

## 5. Border Radius
A small fixed scale (none / small / medium / full-round): full-round only for pills/badges/avatars, small/medium for cards and inputs, none for dense table cells.

## 6. Shadows (Elevation)
Four elevation levels: flat (inline content), low (resting cards), medium (dropdowns, popovers), high (modals/dialogs). Elevation communicates layering, not decoration.

## 7. Icons
One consistent icon set/style (line-based, single stroke weight) across the entire platform. See `Icons & Assets/` for sourcing status. Icons never stand alone for a critical action without a text label in the Dashboard.

## 8. Component Specifications
Full specifications for Buttons, Inputs, Selects, Textareas, Checkboxes/Radios/Toggles, Tables, Pagination, Breadcrumbs, Tabs, Dialogs, Toasts, Alerts, Badges, Chips, Cards, Drawers, Sidebars, Navigation (Primary), Top Bar, Footer, and Mobile Navigation are maintained in `Components Library/README.md` as the single indexed source — duplicated here in the original spec only insofar as the roles above depend on them; component-level detail is not repeated in two places.

---

**Status:** 🟡 Structure approved-carry-forward; **visual values remain Blocking Issue B10 — flagged again in Design Status Report.md and Backlog.md, not resolved by this audit**
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
**Dependencies:** Design Principles/, Components Library/, Database Architecture Frozen v1 (§B10)
