# AHR Platform v1.0 — Release Notes

**Release date:** Integration & Validation phase, July 2026
**Release type:** Initial release
**Status:** 🔒 Final — Approved for release as AHR Platform v1.0

---

## What This Release Is

AHR Platform v1.0 delivers the **Archive** component of the AHR ecosystem: a bilingual (Arabic/English) public website documenting Ahmed Hamdy Raouf's career, works, and professional relationships, backed by an administrator Dashboard and CMS. Academy, Creative Network, and the broader AI Platform components are out of scope for v1.0 (Release 2+).

## What's Included

- **Public Website:** Home, About, Works, Projects, Media, Recognition, Contact.
- **Dashboard & CMS:** generic entity management for People, Works, Projects, Events, Awards, Categories, and Tags; Contacts & Organizations; Media Library; Moderation Queue; Activity Log; Settings.
- **11 domain entities:** Person, Organization, Work, Project, Event, Contribution, Award, Media, Press Mention, Category, Tag — fully modeled from business definition through database schema to UI.
- **AI-assisted suggestions** (category/tag and summary suggestions), Administrator-only, provider-agnostic backend (OpenAI as the v1 implementation).
- **Row Level Security** across all 20 database tables.
- **A complete Knowledge Base**: Business Bible, Domain Model, Business Rules, Governance, Terminology, and per-entity content standards — the source of truth for every business decision behind this release.
- **A complete Experience & Design specification**: Design Principles, Design System, Information Architecture, User Flows, Wireframes, Accessibility Guidelines, and every module's screen composition, delivered as a build-ready Markdown specification.

## Known Limitations at Release

These are pre-existing, already-disclosed gaps carried into this release — not defects introduced during Integration:

- **Brand Identity literal values** (logo, hex colors, font families) are Pending Stakeholder Approval. Design Tokens, Color System, and Typography are structurally complete but do not yet carry final literal values.
- **AI suggestions are ephemeral** — no persisted history of past suggestions.
- **Notifications** are represented only by a Moderation-queue badge; there is no general notification inbox.
- **Organization records** do not yet support contact info, internal notes, or media ownership.
- **Administrator self-service profile editing** is not available in v1.
- **No Person/Event/Organization detail pages** on the public Website (Work and Project have detail pages; the others do not, yet).

The full list, with the review path required to unblock each item, is in each track's `Backlog.md` and consolidated in `0. Executive/Validation Report.md` §7.

## Verification Performed Before This Release

- Full pipeline (format, lint, typecheck, test, build) run against the complete, standalone Development package — clean.
- All 19 database migrations applied and both structural and RLS smoke tests run against a real PostgreSQL 16 instance — clean.
- Cross-track validation of entity names, page names, business-rule traceability, design-system alignment, and terminology — see `0. Executive/Validation Report.md` for full findings, including one documented (non-blocking) broken-link issue inside the Knowledge Base's own index.

## Documentation Map

| Question | Where to look |
|---|---|
| "Is v1.0 ready to ship?" | `0. Executive/AHR Platform v1.0 Final Status Report.md` |
| "What exactly is in this release?" | `0. Executive/Product Manifest.md` |
| "How were the three tracks combined?" | `0. Executive/Integration Report.md` |
| "What was checked, and what did you find?" | `0. Executive/Validation Report.md` |
| "Why does AHR exist / what are the business rules?" | `1. Knowledge Base/` |
| "What should the product look like and how should it behave?" | `2. Experience & Design/` |
| "How is it actually built?" | `3. Development/` |

---
**Approved as:** AHR Platform v1.0 — the official, release-ready version of the AHR Platform product.
