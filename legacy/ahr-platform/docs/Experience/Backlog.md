# AHR Platform v1 — Experience & Design Backlog

**Rule applied throughout this audit:** nothing on this list is designed against or resolved elsewhere in this deliverable — it is recorded here, out of v1.0 scope, per instructions not to add features beyond AHR Platform v1.0.

## Open Decisions (blocking — need a business/stakeholder decision, not a design decision)
1. ~~**B10 — Brand Identity literal values**~~ ✅ **Resolved 2026-07-21** — palette, fonts, numerals, and logo approach ratified from the live site; Arabic display-font pairing still open. See Decision Log item B10/C1.
2. ~~**Profile Management scope decision**~~ ✅ **Resolved 2026-07-21 — IN SCOPE for v1.0** (Decision Log item C2). Tracked as new Development item A11.
3. ~~**Contact page mechanism**~~ ✅ **Resolved 2026-07-21** — the live site uses direct-channels only (no form backend needed). See Decision Log item C3.
4. **Organization schema gap** — contact info, internal notes, external links, Tag/Category assignment for Organizations (Contacts & Organizations — carried-forward gap, Database Architecture Review Round 2).
5. ~~**AI suggestion persistence**~~ ✅ **Resolved 2026-07-21** — `ai_recommendation_log` built and wired (Decision Log item E3).
6. **Notification table** — whether a general `notification` table/feed is added beyond the current Open-Reports-only badge (Notifications UI — carried-forward gap).
7. ~~**Icon set selection**~~ ✅ **Resolved 2026-07-21** — `lucide-react` chosen (Decision Log item C4; `docs/Experience/Icons & Assets/README.md`).

## Ideas Surfaced During This Audit (explicitly NOT designed against — v2.0/Release 2 candidates only)
- Native mobile application (Mobile Designs/README.md — v1.0 is responsive web only).
- Multi-factor authentication and "remember this device" (Authentication).
- Bulk actions in CMS list views; optimistic-locking conflict UI for concurrent edits.
- Role-scoped navigation once more than one Administrator role exists.
- Assignable moderation reports once more than one Administrator exists.
- AI semantic/vector search.
- Search analytics (popular/zero-result queries).
- File versioning UI (`media_asset_version`) once that schema exists.
- Additional Personas (e.g. "Researcher," "Press") — would require both a scope decision and real user research (UX Research/README.md).

## Explicitly Out of Scope for This Backlog
Any change to approved Business Rules, Architecture, or Database decisions — those are not backlog items, they are outside this audit's authority entirely, per the engagement's own instructions.

---
**Maintained By:** Chief Experience & Design Officer (this audit) — this file should be reviewed at the start of any future Experience & Design work before designing something new, so nothing here is quietly re-invented from scratch.
