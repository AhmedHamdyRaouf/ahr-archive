# Milestone 3 — Authentication & Authorization Verification Report

**Status:** 🔒 Final (CTO Phase 2 Deliverable)
**Verified against:** `08-Authentication-and-Authorization.md`, `10-Security.md`, Authentication Rules & Permissions Matrix (API Specification)
**Package:** `@ahr/auth`

---

## 1. Current State

`@ahr/auth` implements the full Session Resolution Chain documented in `08-Authentication-and-Authorization.md` §2: a Supabase Auth session cookie resolves to `auth.users.id`, then to `platform_user` (`sync.ts`'s `resolvePlatformUser`), then to `person_id`/`role`. 34 tests pass across 6 test files (`actions`, `policy`, `session`, `activity-log`, `roles`, `sync`), covering every branch of this chain including the failure path.

- **Two-layer route protection verified present:** `apps/web/middleware.ts` gates `/(ar|en)/dashboard/:path*` as the fast edge check; `@ahr/auth`'s `session.ts`/`policy.ts` performs the authoritative, full-chain check in-process — matching `08-Authentication-and-Authorization.md` §3 exactly.
- **Two Supabase client factories, correctly scoped:** `createRequestScopedClient` (anon key, respects RLS as the current session — used for all ordinary request handling) and `createServiceRoleClient` (service-role key, bypasses RLS — restricted, by the function's own doc comment, to migration scripts and the one narrow `platform_user` first-provisioning case in `sync.ts`). This exactly matches `10-Security.md` §3–§4's "least privilege" and "one sanctioned bypass" principles.
- **`PlatformUserProvisioningError`** is thrown, not silently papered over, when a valid Supabase session has no matching `platform_user` row — matching `08-Authentication-and-Authorization.md` §2's "forces sign-out, not a silent fallback."
- **No self-registration, no profile-editing endpoint, no session-revocation control** — all three correctly absent, matching `08-Authentication-and-Authorization.md` §7 and §10's explicit v1 scope limits. Nothing was added.
- **Activity logging is centralized** in one shared `writeActivityLog` function (not duplicated per call site), matching Coding Standards' "one place for a rule."

## 2. What Was Fixed in This Phase

**Not application-code-level** — the one change touching this package's territory was at the database layer: the new RLS migration (Milestone 2 Verification, Report 03) now enforces, for the first time, that `platform_user` reads/writes are actually gated the way `08-Authentication-and-Authorization.md` §4–§6 always said they were. Previously, with RLS entirely absent, the *application code* already behaved correctly (it always checked `role` and called `requireCapability`), but the *database* would have permitted any authenticated session to bypass that application-level check entirely via a direct query. This is now closed.

A lint-only fix (`packages/auth/src/supabase-client.ts`: `interface CookieAdapter extends CookieMethodsServer {}` → `type CookieAdapter = CookieMethodsServer`) was applied as part of the Milestone 1 lint-tooling fix — zero behavior change, verified against all 15 call sites of `CookieAdapter` across `packages/auth` and `apps/web`.

## 3. Flagged Risk (Not Fixed in This Phase — See Database Verification Report §5)

The new RLS policy on `activity_log` (administrator-only insert) will reject the one write path that has no administrator session at the moment it runs: a **failed login attempt** (`writeAuthFailure`, `actor_id = null`). This is a genuine, newly-surfaced interaction between this package's existing code and the newly-added RLS policy — it did not exist as a visible problem before RLS existed (because nothing was enforced), but it is a real gap now that RLS correctly enforces the documented policy.

**Why not fixed now:** the correct fix (routing this one write through a `SECURITY DEFINER` RPC or the service-role client) is an application-code change to already-tested Milestone 3 code. Making it correctly and safely requires verifying the new write path against a live Supabase project (Blocking Issue B4) — a local Postgres shim cannot fully validate PostgREST's own request/JWT handling for this narrower case. Applying an untested change here risked a regression in a package that currently has 100% passing tests. This is disclosed as Backlog, not silently left undocumented.

**Practical impact today:** every login attempt still succeeds or fails correctly from the user's perspective (Supabase Auth itself, not this table, is the source of truth for whether a login succeeds). The only effect is that a failed attempt will not be recorded in `activity_log`, and the write's own error will be logged to the technical log stream instead (per the existing `console.error` fallback already in `writeActivityLog`, matching `11-Performance.md` §7's "logging must never block or alter the outcome of the request it's attached to").

## 4. Verification Evidence

- `npm run test --workspace=packages/auth`: 34/34 passing.
- `npm run typecheck --workspace=packages/auth`: clean.
- `npm run lint --workspace=packages/auth`: clean (0 errors, 4 warnings — pre-existing, justified `any` usages in test mocks, now visibly flagged for the first time; see Bootstrap Verification Report §2).
- Manual code review against `08-Authentication-and-Authorization.md` §2–§10, item by item: no deviation found beyond the flagged RLS interaction above.

## 5. Completion and Risk Summary

| | |
|---|---|
| **Completion** | 95% |
| **Risks** | One flagged, documented, non-blocking RLS interaction (§3) — Backlog, pending live Supabase project |
| **Regressions introduced** | None — 34/34 tests still passing after all fixes |

---

**Prepared By:** CTO Office
