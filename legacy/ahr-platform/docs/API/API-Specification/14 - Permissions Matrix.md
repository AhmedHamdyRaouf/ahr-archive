# AHR Platform v1 — Permissions Matrix

**Status:** 🔒 Frozen

Version 1 has exactly one active role, `administrator` (Database Architecture §7), plus the implicit unauthenticated Visitor case. This matrix is intentionally simple for that reason — it is not abbreviated, it is complete.

| Package | Read (public) | Read (authenticated) | Write | Delete/Archive |
|---|---|---|---|---|
| Authentication | — | Administrator (own session only) | Administrator (own session only) | — |
| CMS | — | Administrator | Administrator | Administrator |
| Website | ✅ Visitor (published+public only) | — | — | — |
| Archive | N/A — no direct HTTP API (see 05 - Archive API) | | | |
| Contacts & Organizations | — | Administrator | Administrator | Administrator |
| AI | — | Administrator | Administrator (suggestion requests only; no persisted resource to delete in V1) | — |
| Dashboard (Settings) | ✅ Visitor, partial (site info/SEO/branding/social only — Database Architecture §8) | Administrator (full, including `ai_configuration`/`email_configuration`) | Administrator | — |
| Dashboard (Activity Log) | — | Administrator (read-only) | — (system-written only) | — (append-only, never editable/deletable) |
| Dashboard (Moderation Queue) | — | Administrator | Administrator | — |
| Media Library | ✅ Visitor (published+public only, via Website) | Administrator (all statuses) | Administrator | Administrator (archive only, per No Hard Delete) |
| Search | ✅ Visitor (published+public only) | Administrator (unfiltered, CMS-embedded) | — | — |
| Notifications | — | Administrator | — (system-derived only) | N/A (see 11 - Notifications API — most requested actions are blocked, schema gap) |

## Reserved for Release 2

`trainer`, `student`, `creative_member` roles are reserved values in `platform_user.role`'s design (Database Architecture §7) but have **zero permissions rows in this matrix** — they cannot authenticate or hold any permission in V1, because they cannot exist yet.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Database Architecture (Frozen v1) §7–§8, Packages Specification (all packages)
