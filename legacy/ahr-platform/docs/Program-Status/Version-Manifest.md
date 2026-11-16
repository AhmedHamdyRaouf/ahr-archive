# AHR Platform v1.0 — Version Manifest

**Status:** 🔒 Final

This document records the version identity of every integrated component and confirms version alignment across the three tracks. Checked as part of Cross Validation (see `Validation Report.md` §2).

---

## 1. Product-Level Version

**AHR Platform v1.0** — first integrated release. All three tracks independently label their deliverable `v1.0`; no version mismatch was found.

## 2. Track Versions

| Track | Declared version | Source folder (as delivered) |
|---|---|---|
| Knowledge Base | v1.0 | `AHR-Knowledge-Base-v1.0` |
| Experience & Design | v1.0 | `AHR-Experience-Design-v1.0` |
| Development | v1.0 | `AHR-Platform-Development-v1.0` |

## 3. Development Track — Internal Build Lineage

The Development track's `v1.0` is itself the result of three internal phases, already merged into one codebase before this Integration phase began:

1. **CTO Deliverables v1.0** (Phase 1) — initial architecture and implementation.
2. **CTO Phase 2 Deliverables** — verification/fix pass (RLS, milestone verification reports).
3. **CTO Final (Phase 3) Deliverables** — final review, security/performance/testing sign-off, CTO approval.
4. **Development Audit** (this delivery's immediate predecessor) — closed the one remaining gap (AI Integration package) and re-verified the full pipeline end-to-end.

These phase artifacts (verification reports, phase-specific zips) are preserved for traceability in `0. Executive/Archive - Pre-Integration Source Material/Superseded Development Track Zips/` — they are historical inputs, not separate product versions.

## 4. Database Schema Version

20 tables, 19 migrations, as documented in `3. Development/Technical-Documentation/02-Database.md`. This was the authoritative schema version for v1.0 as originally frozen — the standalone `AHR-Platform-v1-Database-Architecture.md` found at the project root of the original upload is an earlier-stage draft of the same schema and has been archived (see `Integration Report.md` §2).

**Amendment (2026-07-21):** 4 further tables (`ai_recommendation_log`, `notification`, `organization_category`, `organization_tag`) plus 2 column additions to `organization` and 1 to `media_asset` were added via the Database Architecture Review Round this document's own source material anticipated, approved by the data owner — see `docs/Program-Status/Decision-Log.md` items E3/E4/E5 and `docs/Database/Database-Architecture-Overview.md` for the current, authoritative 22-table / 24-migration state. This section's original "20 tables, 19 migrations" describes the schema as originally frozen, not the current live schema.

## 5. Documentation Corpus Version

The Knowledge Base's `AHR-Knowledge-Foundation-v1.0/` corpus (10 documents) is the single most authoritative source document set and is preserved, unedited, inside `1. Knowledge Base/` under its respective topic folders (Business Bible, Domain Model, Business Rules, Standards, Terminology, Core Documents). It is not a separate version — it is the primary reference the Knowledge Base track was built from.

## 6. Version Alignment Result

✅ **No version conflicts found.** All three tracks converge on v1.0. No track references a different, incompatible version number for the product or for a shared artifact (schema, entity model, design tokens grammar).

---
**Confirmed By:** Release Manager & PMO — Product Integration & Validation phase
