# AHR Platform v1 — API Specification

## Overview

This is the complete, formal API contract for AHR Platform v1 — built strictly on the six frozen documents (Vision, Build Manifest, Technology Stack, Database Architecture, Packages Specification, UI/UX Specification). No source code, no implementation, no OpenAPI generation — documentation only, per your instructions.

## Document Index

| Doc | Content |
|---|---|
| 01 — API Standards | REST style, resource naming, response envelope, pagination, verb mapping, locale handling |
| 02 — Authentication API | Login, Logout, Refresh Token, Forgot/Reset Password, Profile (read-only, flagged gap), Permissions, Session |
| 03 — CMS API | Generic entity family (List/Get/Create/Update/Transition/Taxonomy) for all 8 CMS entities |
| 04 — Website API | Public, read-only endpoints for every Sitemap page |
| 05 — Archive API | Documents that **no HTTP API exists** for this package, by design |
| 06 — Contacts & Organizations API | Organization CRUD + Related Records; contact/notes/tags endpoints flagged blocked |
| 07 — AI API | The one live suggestion endpoint; history/persistence endpoints flagged blocked |
| 08 — Dashboard API | Settings, Activity Log (read-only), Moderation Reports |
| 09 — Media Library API | Upload, Delete (archive semantics), Update Metadata, Replace File, Download, Preview; Version History flagged blocked |
| 10 — Search API | Global, Archive, Media, Organization, CMS (admin) search |
| 11 — Notifications API | One real endpoint (moderation count); everything else flagged blocked |
| 12 — Error Codes | Standard error object shape and code table |
| 13 — Authentication Rules | Session mechanism, role validation, session management |
| 14 — Permissions Matrix | Complete Package × Role permission table |
| 15 — API Conventions | Endpoint documentation template, generic-family principle, idempotency, timestamps |

## What Carried Forward From Prior Documents

Every schema gap already surfaced in the Packages Specification and UI/UX Specification reappears here as **"Specified but Blocked"** endpoints — not omitted, not worked around with an invented table. This keeps the three documents (Packages Spec → UI/UX Spec → API Spec) in lockstep: a reader following any single module from spec to spec sees the same boundary in the same place every time.

| Gap | First surfaced in | Carried into this document |
|---|---|---|
| Organization contact info/notes/tags | Packages Specification Package 05 §13 | 06 - Contacts & Organizations API |
| AI suggestion persistence | Packages Specification Package 06 §13 | 07 - AI API |
| General notification feed | Packages Specification Package 10 §13 | 11 - Notifications API |
| Media version history | Database Architecture §11.1 (documented seam only) | 09 - Media Library API |
| Profile Management | UI/UX Specification, User Flows (05) §11 | 02 - Authentication API (Profile is read-only) |

## One New Observation From This Pass

**Media's `DELETE` endpoint does not delete.** Per No Hard Delete (Phase 1/4), `DELETE /api/media/{id}` archives a previously-published asset rather than removing it — this is called out explicitly in 09 - Media Library API rather than left as a surprising implicit behavior behind a verb that normally implies removal.

## Consistency Review Performed

- Every endpoint uses the response envelope and error format from `01 - API Standards` / `12 - Error Codes` — no package deviates.
- Every endpoint's Required Role matches `14 - Permissions Matrix`.
- Every entity-lifecycle endpoint (CMS, Contacts & Organizations, Dashboard's Moderation Reports) uses the same `POST .../transition` shape, with one explicitly-flagged exception (Media's status field, accepted via `PATCH` for its simpler lifecycle — noted in 09, not silently inconsistent).
- No endpoint references a database table or column outside the Frozen v1 Database Architecture.

## Final Consistency Review — Findings and Fix

Before freezing, a full pass was performed against the 9 criteria requested (endpoint↔package mapping, endpoint↔database-entity mapping, UI/UX representation, no undocumented/orphan/duplicate endpoints, naming consistency, permission consistency, unified error format). **One real gap was found and fixed, not just noted:**

**`press_mention` had no owning package or CRUD endpoints anywhere in the original draft.** Media (owned by Media Library) and every other content entity (owned by CMS) had a home; Press Mention did not — it only ever appeared as a read-only reference inside Contacts & Organizations' Related Records. This has been corrected: **Press Mention is now part of CMS API's generic entity family** (`03 - CMS API.md`, `entityType = press-mentions`), following the same "exactly one subject" pattern already used for `media_asset`.

**This same gap exists in the already-frozen UI/UX Specification** (CMS UI, doc 07, §4 Screen List has no Press Mentions entry) — that document is not modified here, since modifying a frozen document requires the official revision process. Flagging it explicitly so the Development Specification (next phase) and any future architecture revision account for it.

Every other check passed without needing a fix: no undocumented/duplicate endpoints (Search API's "CMS Search" and CMS API's own `q` filter are the same capability documented from two angles, not two implementations — noted explicitly in `10 - Search API.md`); naming, permissions, and error format are consistent across all 11 package documents.

---

**Status:**
🔒 Frozen

**Prepared By:**
Claude

**Approved By:**
Architecture Review
