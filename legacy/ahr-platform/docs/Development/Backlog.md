# AHR Platform v1 — Development Backlog

**Status:** 🔒 Final (Development Audit, Development track)
**Purpose:** Every idea, feature, or improvement identified across all CTO phases (Deliverables v1.0, Phase 2, Phase 3, this Development Audit) that is explicitly **outside Master Roadmap v1.0** or **outside the Development track's own scope this phase** — recorded here, not implemented, not silently dropped.

Nothing in this document is approved for building. Each item requires its own explicit decision (an architecture review, a design pass, a business decision, or simply "not yet") before it becomes real work.

---

## Explicitly Outside Master Roadmap v1.0 (Release 2 / Never)

- AHR Academy and AHR Creative Network — entire modules, Release 2.
- Additional roles (`trainer`, `student`, `creative_member`) and any role-scoped views that depend on them.
- Mobile application.
- Multiple Postgres schemas / true cross-module data isolation (only relevant once Academy/Creative Network are actually planned).
- Turborepo, Husky, Commitlint — confirmed (Phase 2) never part of the approved architecture; not added. A dedicated ADR is the correct path if the Platform Owner wants to adopt any of them later.
- Multi-factor authentication; session revocation ("sign out everywhere"); social sign-on; self-service profile editing.
- Additional AI providers behind the existing `aiClient` abstraction (`@ahr/ai`); AI-assisted moderation triage (still fully human-decided if ever added); any Academy/Creative Network AI capability.

## Database — Pending a Dedicated Architecture Review Round (Not Silently Added)

- ~~`ai_recommendation_log` table~~ ✅ **Built 2026-07-21** — see `packages/database/migrations/20260721100000_ai_recommendation_log.sql`, approved via Decision Log item E3. AI suggestions are now persisted with a recorded accept/edit/reject outcome.
- `media_asset_link` join table — would unblock multi-entity media linking (`packages/media/docs/blocked-metadata.md`).
- ~~`organization_id` on `media_asset`~~ ✅ **Built 2026-07-21** — see `packages/database/migrations/20260721120000_organization_schema_expansion.sql`, approved via Decision Log item E5. Organization is now a valid `media_asset` owner type, alongside contact info, internal notes, and Category/Tag assignment for Organization.
- A `document` value for `media_asset.media_type` — would unblock document uploads.
- Richer `media_asset` descriptive metadata (title, alt text, copyright, credits, a tag join table) beyond the current `caption_ar`/`caption_en`.
- `media_asset_version` table — history/versioning for replaced media files (the seam already exists, `02-Database.md` §11.1).
- Native Postgres `enum` types for `status`/`role`, if constraint maintenance ever becomes a real burden (currently `text` + `check`, deliberately, for low-friction evolution).
- `pgvector` semantic search columns.
- Postgres full-text search (`tsvector`/GIN index) to replace the current `ILIKE`-based search heuristic.

## Application Features — Deferred, Not Built This Phase

- **AI suggestion UI** (a panel embedded in CMS forms, per `04-Frontend.md` §6's visual contract for AI-generated content). The backend (`@ahr/ai`, `POST /api/ai/suggest`) is complete and tested as of this Development Audit; the UI itself is Experience & Design track work, explicitly out of scope for this Development-only phase.
- **Media Library upload UI** in the Dashboard (file picker + owner-entity selector). The list view and the underlying, already-tested `POST /api/media` endpoint both exist; only the upload form itself is not built.
- **A friendlier, field-structured Settings editor**, replacing the current raw-JSON-per-key editor, once each setting's shape is worth its own dedicated form.
- Bulk actions across CMS entities and Moderation reports (bulk categorize, bulk archive, bulk assign).
- Optimistic locking / conflict detection for concurrent CMS edits (v1 is last-write-wins by design).
- A persisted in-app notification inbox and per-user notification preferences (currently a fixed, single v1 default — `packages/notifications/docs/blocked-notifications.md`).
- SMS/push notification channels behind the existing `NotificationProvider` abstraction.

## Testing — Deferred, Not Built This Phase

- A full, browser-driven end-to-end test suite (tooling selection, scenario coverage, CI wiring).
- An HTTP-level API test suite exercising Route Handlers directly (current coverage is at the underlying function level, which each Route Handler is a thin, verified wrapper around).
- A deliberate process for setting, then enforcing, a coverage threshold as a CI gate, once a baseline history exists (coverage reporting itself was added this phase — see the Development Status Report).
- Automated accessibility test tooling (currently a manual review checklist item).

## Infrastructure / Operations — Requires a Live Environment, Not a Code Change

- A named monitoring/observability tool selection.
- A dedicated error-tracking service.
- Rate limiting configured at the infrastructure/edge layer (Vercel Firewall/Attack Challenge Mode or equivalent).
- Confirming Supabase backup/point-in-time recovery is enabled, and its retention window.
- Running an actual rollback drill (redeploy-to-previous-version and restore-from-backup), per `rollback-plan.md`.
- A dedicated CDN/edge-cache layer beyond what Vercel/Supabase Storage already provide, if a specific, measured performance need emerges.

## Business / Content / Organizational — Not Engineering's to Decide

- The canonical legacy data source among conflicting records (Blocking Issue B5) — blocks legacy data migration execution.
- Final Design System token values (brand palette, typography) — an open product/design decision; components are already built against token *names*, not hardcoded values.
- Named on-call/support ownership for the moment of public launch.
- A formal legal/compliance procedure for a permanent-deletion exception request (only relevant if such a request is ever actually made).

---

**Prepared By:** CTO Office
**Note:** This document consolidates every Backlog section from CTO Deliverables v1.0 (Phase 1), CTO Phase 2 Deliverables, CTO Final (Phase 3) Deliverables, and this Development Audit into one place. It replaces the need to cross-reference each document's own Backlog section individually, but does not supersede or change any of them.
