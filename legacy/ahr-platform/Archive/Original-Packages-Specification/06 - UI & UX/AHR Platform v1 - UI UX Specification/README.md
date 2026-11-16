# AHR Platform v1 — UI/UX Specification

## Overview

This is the single source of truth for every screen, flow, and visual convention in AHR Platform v1, built strictly on the frozen **Packages Specification** and **Database Architecture**. No React, HTML, CSS, or Figma output exists here — this is specification only, per your instructions.

## Document Index

| Doc | Content |
|---|---|
| 01 — Design Principles | The 8 principles governing every screen |
| 02 — Design System | Typography, color, spacing, grid, and every listed component, as **categories/roles**, not final values (actual visual values remain Blocking Issue B10) |
| 03 — Navigation | Public and Dashboard navigation structures |
| 04 — Responsive Rules | Desktop/Tablet/Mobile behavior |
| 05 — User Flows | 11 requested flows — **one (Profile Management) flags a real gap, not invented content** |
| 06–15 — Module UI docs | One per package, matching the Packages Specification exactly |
| 16 — Components Library | Consolidated index of every named component and where it's defined |
| 17 — Accessibility | Cross-cutting accessibility rules |
| 18 — UX Guidelines | Cross-cutting tone, error, loading, and confirmation conventions |

## What This Document Does NOT Do

Per your explicit instructions: it does not invent new modules, new database entities, React/HTML/CSS code, or Figma output. Where the Packages Specification or Database Architecture already flagged a gap (Package 05's contact-info fields, Package 06's suggestion persistence, Package 10's notification feed), this specification **carries that gap forward** into the relevant UI documents rather than papering over it with an invented field or screen.

## New Gap Surfaced by This Pass

**Profile Management** (requested as one of the 11 User Flows) has no corresponding screen anywhere in the Packages Specification — Authentication (Package 01) covers sign-in/out/reset only. This is documented in User Flows (05, §11) as an open item, not silently filled in with an invented screen.

## Cross-Reference Summary

| This document's module doc | Corresponds to Packages Specification | Corresponds to Database Architecture |
|---|---|---|
| 06 Authentication UI | Package 01 | §6 Authentication Model, §7 Roles |
| 07 CMS UI | Package 02 | §2 (8 core entities), §9 Business Rules |
| 08 Website UI | Package 03 | §2 (read-only, published+public) |
| 09 Archive UI | Package 04 | Domain layer — no UI, by design |
| 10 Contacts & Organizations UI | Package 05 | `organization` — **schema gap carried forward** |
| 11 AI UI | Package 06 | **Schema gap carried forward** (no recommendation-log table) |
| 12 Dashboard UI | Package 07 | `platform_settings`, `activity_log`, `moderation_report` |
| 13 Media Library UI | Package 08 | `media_asset`, §11/§11.1 Media Storage/Versioning |
| 14 Search UI | Package 09 | §16 Search Readiness |
| 15 Notifications UI | Package 10 | **Schema gap carried forward** (no notification table) |

---

**Status:**
🟡 Working — pending your approval

**Prepared By:**
Claude

**Approved By:**
Pending
