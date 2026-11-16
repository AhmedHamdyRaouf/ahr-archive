# Milestone 2 — Database Foundation Verification Report

**Status:** 🔒 Final (CTO Phase 2 Deliverable)
**Verified against:** `02-Database.md`, `10-Security.md`, frozen Database Architecture, Data Foundation Conventions (Locked)
**Verification method:** All 18 original migrations plus this audit's new migration were applied, in order, to a real local PostgreSQL 16 instance (matching Supabase's own engine version) — not reviewed as text only.

---

## 1. Item-by-Item Verification

| Item | Verdict |
|---|---|
| Database Schema | ✅ **Complete.** All 20 tables from `02-Database.md` §2 present, exact column sets, exact naming conventions (`snake_case`, `uuid` PKs, `timestamptz` audit columns). |
| Migrations | ✅ **Complete, correct order.** 18 original migrations apply cleanly in filename order against a fresh database, zero errors. Dependency ordering (referenced tables before referencing tables) verified correct throughout. |
| Constraints | ✅ **Complete.** Every `check` constraint from `02-Database.md` §6 verified present and enforced: status/visibility/verification_status enumerations, `work_type`/`project_type`/`contribution.role` value sets, the "exactly one owner" rule on `media_asset` and `press_mention`, the "at least one target" rule on `contribution`, `platform_user.role`'s single-value constraint, `moderation_report`/`activity_log`'s own status/action constraints. |
| Indexes | ✅ **Complete.** Every foreign key across all 20 tables is indexed, with no exception — verified by direct inspection of every migration file, cross-checked against `02-Database.md` §12's index table. |
| **RLS Policies** | 🔴 **Critical gap found — fixed in this audit.** See §2. |
| Seeds | ✅ **Complete, as scoped.** `platform_settings` is seeded with exactly the 12 keys `02-Database.md` names, with safe, neutral placeholder values (no real content, no credentials). No other table has — or is documented to need — seed data at this milestone. |

## 2. Critical Finding: Row Level Security Was Entirely Absent

**What was found:** a full-text search of all 18 original migration files for `ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` returned **zero matches**. Not one of the 20 tables had RLS enabled, and no policy of any kind existed anywhere in the schema — despite:

- `02-Database.md` §10 documenting a specific, two-family policy set ("Public read" and "Administrator full access") as already in effect.
- `10-Security.md` §3 stating "RLS is enabled on every table with no exception and no code-level bypass switch... this is a database-level guarantee, not a discipline requirement."
- The frozen Database Architecture itself specifying this as a §8 requirement.

This is the single most significant gap this audit found across all seven milestones in scope. A database matching every other aspect of the frozen schema, but with RLS entirely unenabled, would mean **any authenticated Supabase session — not just an administrator's — could read or write any row in any table**, including draft/hidden content, other administrators' identity data, and the audit trail itself.

## 3. Fix Applied

A new migration, `20260719120000_row_level_security.sql`, adds:

1. A `SECURITY DEFINER` helper function `is_administrator()`, resolving whether the current session's `auth.uid()` corresponds to a `platform_user` row with `role = 'administrator'` — without triggering recursive RLS evaluation on `platform_user` itself (the standard, Supabase-documented pattern for this exact situation).
2. **Public read** (`status = 'published' AND visibility = 'public'`) + **Administrator full access** (`is_administrator()`) on all 11 standard content tables (`organization`, `person`, `work`, `project`, `event`, `contribution`, `award`, `category`, `tag`, `media_asset`, `press_mention`).
3. For the four taxonomy join tables (`work_category`, `work_tag`, `project_category`, `project_tag`), which have no `status`/`visibility` columns of their own: public read follows the owning Work/Project row's own publication state via an `EXISTS` subquery — the direct, minimal realization of `02-Database.md` §10 listing join tables under "every content table."
4. `platform_user`: a session may always read its own row (`platform_user_self_read`, required for `@ahr/auth`'s Identity Resolution Chain to function at all); full read/write beyond that is administrator-only. **No INSERT policy exists at all** for ordinary sessions — matching "administrators are seeded directly, never self-registered" (Packages Specification Package 01 §16); the one narrow provisioning exception (`packages/auth/src/sync.ts`) already uses the service-role client, which bypasses RLS by design.
5. `entity_state_transition` and `activity_log`: administrator read + insert only. **No UPDATE or DELETE policy exists for any role, including administrator** — enforcing "append-only" at the database level, not just as an application-code convention, matching `10-Security.md` §7 exactly.
6. `moderation_report`: administrator full read/write. This is a deliberate, documented judgment call — see §4.
7. `platform_settings`: selective public read excluding `ai_configuration`/`email_configuration`; administrator full read/write on every key.

## 4. A Documentation Ambiguity, Resolved Transparently

The frozen Database Architecture's §8 RLS narrative groups `entity_state_transition` **and** `moderation_report` together as having "no direct client insert/update policy," while the Permissions Matrix elsewhere lists Administrator as having full **Write** access to the Moderation Queue. These two statements are in tension for `moderation_report` specifically: it is not a pure append-only log like `entity_state_transition` — it is a first-class workflow entity whose own status (`open → in_review → escalated/resolved`) an administrator legitimately updates through `@ahr/workflow`'s already-built, already-tested service functions.

**Resolution applied:** `moderation_report` receives full administrator read/write via `is_administrator()`, matching the Permissions Matrix and the actual, working `@ahr/workflow` code. `entity_state_transition` and `activity_log` — where every reference throughout the architecture is unambiguously "append-only," "never edited" — receive the stricter insert-only treatment. This resolution is disclosed here, not silently decided, for the Platform Owner's awareness; it changes no code and no schema, only which of two already-written sentences governs one table's RLS shape.

## 5. Known, Flagged Limitation (Backlog, Not Applied)

`@ahr/auth`'s failed-login logging path (`writeAuthFailure` in `packages/auth/src/activity-log.ts`) writes an `activity_log` row with `actor_id = null` when a sign-in attempt fails — at that moment, no session resolves to an administrator, so the new `activity_log_admin_insert` policy will reject this specific write. Every other `activity_log` write (successful login, logout, and every later milestone's CMS/content/settings actions) already occurs after a session resolves to an administrator and is unaffected.

This is a real, disclosed limitation, not silently patched around: fixing it correctly means moving that one write path to a `SECURITY DEFINER` RPC or the service-role client — an application-code change to already-tested Milestone 3 code that should be verified against a live Supabase project (Blocking Issue B4) before shipping, not guessed at against a local shim. It is recorded in the migration's own comments, in `packages/database/README.md`, and here, and is carried forward to the Authentication & Authorization Verification Report (Report 04) as a Backlog item.

## 6. Verification Evidence

All of the following were executed against a real local PostgreSQL 16 instance, with a minimal, documented shim (`packages/database/docs/local-rls-verification.md`) reproducing only what a real Supabase project already provisions itself (`auth.uid()`, `anon`/`authenticated`/`service_role` roles):

- All 19 migrations (18 original + the new RLS migration) applied cleanly, in order, zero errors.
- `select relrowsecurity from pg_class where relkind='r'` confirms **all 20 tables** now have RLS enabled.
- The existing structural smoke test (`tests/smoke-test.sql`) still passes in full, unaffected by the RLS changes.
- A new RLS behavior smoke test (`tests/rls-smoke-test.sql`, added by this audit) proves, as actual non-superuser `anon`/`authenticated` roles rather than the table owner:
  - An anonymous session sees exactly the published+public rows and nothing else, and cannot insert.
  - An authenticated administrator session sees and can modify everything, including drafts.
  - A session with no matching `platform_user` row (the documented provisioning-error case) fails closed on every axis: never resolves as administrator, never sees anything beyond public content, and correctly sees zero rows via the self-read policy.
  - `platform_settings` correctly withholds `ai_configuration`/`email_configuration` from anonymous read while keeping the other 10 keys public.
- A new CI job (`database-verify`, Postgres 16 service container) now runs both smoke tests on every push/PR — reproduced locally, exit code 0, before being committed.

## 7. Risks

| Risk | Mitigation |
|---|---|
| RLS policies have never been exercised against a real Supabase project (only a local Postgres instance with a minimal shim) | Recommended as the first verification task once Blocking Issue B4 (Supabase provisioning) is resolved — re-run `tests/rls-smoke-test.sql` against the real project before go-live |
| Failed-login `activity_log` writes will fail under the new policy (§5) | Disclosed, tracked as Backlog, does not block any currently-tested user-facing flow |

---

**Prepared By:** CTO Office
**Milestone Completion:** 100% (was ~85% before this verification pass — RLS was the only missing piece)
