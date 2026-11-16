# @ahr/database

# @ahr/database

**Status:** 🟢 All 24 tables are migrated and validated (20 from Database Architecture Frozen v1, plus `ai_recommendation_log`/`notification`/`organization_category`/`organization_tag` added 2026-07-21 via the Database Architecture Review Round — see `docs/Program-Status/Decision-Log.md` items E3/E4/E5). Row Level Security is enabled and policied on every table (added Phase 2 CTO Audit — see §RLS below; previously a gap, now closed; the three 2026-07-21 additions define their own RLS inline in their own migration files, since the original consolidated RLS migration below is historical and immutable).

Structural conventions are fixed in [`docs/data-foundation-conventions.md`](./docs/data-foundation-conventions.md) (🔒 Approved & Locked — official database standard for the AHR Platform).

## Migrations

`migrations/` contains 22 migrations, in dependency order, implementing every entity in Entity Catalog (Phase 4), the four tables added during the Database Architecture review round, Row Level Security, and three further additions approved 2026-07-21:

1. Extensions + shared `set_updated_at()` trigger function
2. `entity_state_transition` (shared, append-only history log)
3. `organization`
4. `person`
5. `work` (self-referencing for compound works)
6. `project`
7. `event`
8. `contribution` (the core Person ↔ Work/Project/Event link — enforces "at least one target" via a real `check` constraint)
9. `award` (requires an `organization_id`)
10. `category` (self-referencing hierarchy, domain-scoped)
11. `tag` (non-hierarchical)
12. `media_asset` (polymorphic subject via four nullable FKs + "exactly one" `check` constraint — no generic entity_type/entity_id column, so referential integrity stays enforced by real foreign keys)
13. `press_mention` (same polymorphic-subject pattern as `media_asset`)
14. Taxonomy join tables (`work_category`, `work_tag`, `project_category`, `project_tag`)
15. `platform_user` (bridges Supabase `auth.users` to `person`; `id` = `auth.users.id`, not independently generated)
16. `moderation_report` (Moderation Logic, Phase 6 — closes Blocking Issue B2)
17. `platform_settings` (key-value global configuration, seeded with the 12 keys named in Database Architecture §2.3)
18. `activity_log` (append-only actor-action audit trail, distinct from `entity_state_transition`)
19. **`row_level_security`** (Phase 2 CTO Audit fix — see below)
20. **`ai_recommendation_log`** (added 2026-07-21, Decision Log item E3 — durable AI-suggestion history with its own inline RLS)
21. **`notification`** (added 2026-07-21, Decision Log item E4 — per-recipient notification inbox with its own inline RLS)
22. **`organization_schema_expansion`** (added 2026-07-21, Decision Log item E5 — `organization.contact_information`/`internal_notes`, `media_asset.organization_id` as a fifth valid owner, `organization_category`/`organization_tag` join tables with their own inline RLS)

No business logic beyond mechanical `updated_at` maintenance and RLS enforcement is implemented — the rest begins in later milestones per Solution Decomposition (Phase 9).

## Row Level Security (Phase 2 CTO Audit fix)

Migration 19 (`20260719120000_row_level_security.sql`) enables RLS on the original 20 tables and implements the exact policy shape Database Architecture (Frozen v1) §8 specifies. Migrations 20–22 (2026-07-21) each enable and policy RLS for their own new table(s) inline, since migration 19 is historical and immutable — this is the correct pattern for any further new table too.

- **Public read** (`status = 'published' AND visibility = 'public'`) on every content table, and the equivalent owning-entity check on the four taxonomy join tables.
- **Administrator full access** everywhere, via a `SECURITY DEFINER` helper `is_administrator()` (avoids recursive RLS on `platform_user` itself — the standard Supabase pattern for this case).
- `platform_user`: a session may always read its own row (`platform_user_self_read`); no INSERT policy exists at all for `anon`/`authenticated` (administrators are seeded directly, never self-registered).
- `entity_state_transition` / `activity_log`: administrator read + insert only — **no UPDATE or DELETE policy exists for any role**, enforcing "append-only" at the database level, not just as an application convention.
- `moderation_report`: administrator full read/write (it is a workflow entity with its own status transitions, not a pure log — matching Permissions Matrix, not the log-table treatment).
- `platform_settings`: selective public read excluding `ai_configuration`/`email_configuration`; administrator full read/write.

**Known, flagged limitation:** a failed login attempt has no resolvable administrator session at the moment `@ahr/auth` tries to write its `activity_log` row, so that specific write will be rejected by RLS as currently policied. Every other `activity_log` write (successful login/logout, and every CMS/content action) already occurs after a session resolves to an administrator and is unaffected. Recommended remediation — moving that one write path to a `SECURITY DEFINER` RPC or the service-role client — is Backlog, not applied here, since it is an application-code change that needs verification against a live Supabase project (Blocking Issue B4), not a schema change.

## Verifying the schema

```bash
# apply all migrations to a fresh database
for f in migrations/*.sql; do psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"; done

# run the self-rolling-back structural integrity smoke test
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/smoke-test.sql

# run the self-rolling-back RLS behavior smoke test (see docs/local-rls-verification.md
# for the one-time local shim this needs if you are not pointed at a real Supabase project)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/rls-smoke-test.sql
```

The smoke test (`tests/smoke-test.sql`) verifies, against a real Postgres instance, that:

- `contribution` rejects a row with no Work/Project/Event target (Data Integrity Rules, Phase 4).
- `media_asset` rejects zero owners and rejects two simultaneous owners, accepting only exactly one.
- `ON DELETE RESTRICT` blocks deleting a `person` row still referenced elsewhere (No Hard Delete, Phase 1/4).
- The shared `updated_at` trigger actually advances the timestamp.
- The `status` `check` constraint rejects a value outside the approved Data Lifecycle sequence.
- `platform_user` enforces a 1:1 Person↔User relationship and rejects roles not yet valid in V1.
- `moderation_report` and `activity_log` reject invalid status/action values.
- `platform_settings` is seeded correctly with its 12 initial keys.

The RLS behavior smoke test (`tests/rls-smoke-test.sql`, added Phase 2 CTO Audit) verifies, as non-superuser `anon`/`authenticated` roles (not the table owner, which always bypasses RLS):

- An anonymous session sees only published+public content and cannot write.
- An authenticated administrator sees and can modify everything.
- A session with no matching `platform_user` row fails closed — never treated as administrator, never granted broader-than-public read.
- `platform_settings` correctly withholds `ai_configuration`/`email_configuration` from anonymous read.

Both smoke tests wrap everything in a transaction and `ROLLBACK` at the end, so they are safe to run against any environment, including production, without leaving test data behind.
