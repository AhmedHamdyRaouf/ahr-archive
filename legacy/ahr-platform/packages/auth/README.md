# @ahr/auth

**Status:** 🟢 Milestone 3 — Identity & Access implemented and tested (34 passing unit tests).

Implements Authentication (Package 01) and the role-aware Authorization layer for AHR Platform v1, strictly per:

- Database Architecture (Frozen v1) §6–§8 — Authentication Model, Roles & Permissions, Row Level Security
- API Specification 02 - Authentication API, 13 - Authentication Rules, 14 - Permissions Matrix
- Identity Model (Phase 4), Identity and Access Architecture (Phase 8)

## Role-Aware, Not Multi-Role-Enabled

Per explicit instruction for Milestone 3: this package is built so that adding a role later (`trainer`, `student`, `creative_member` — Release 2) requires no rewrite — capability lookups are keyed by role (`roles.ts`), not hardcoded per call site. But **exactly one role is active today**: `ACTIVE_ROLES = ['administrator']`, matching the database's own `chk_platform_user_role` constraint exactly. No Super Admin/Editor/Moderator/Contributor/Viewer exists anywhere in this codebase — those were explicitly rejected as out of scope for V1.

## Modules

| File                 | Responsibility                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `supabase-client.ts` | Request-scoped and service-role Supabase client factories                                                                           |
| `session.ts`         | Full Identity Resolution Chain: cookie → Supabase Auth → `platform_user` → role                                                     |
| `sync.ts`            | Resolves an existing `platform_user` row — **never auto-creates one** (no self-registration, Packages Specification Package 01 §16) |
| `roles.ts`           | The one place role/capability data lives                                                                                            |
| `policy.ts`          | Policy Enforcement Point — `requireSession`, `requireCapability`, route-protection check                                            |
| `activity-log.ts`    | Shared `activity_log` writer                                                                                                        |
| `actions.ts`         | Sign In, Sign Out, Forgot/Reset Password, Session check, Permissions, Profile (read-only)                                           |

## A Note on Activity Logging

`activity_log.action` is constrained by `chk_activity_log_action` to a fixed set of values (Database Architecture §2.4) that does **not** include `failed_login` or `session_expired`. Rather than requesting a schema change (out of scope for this milestone) or silently dropping these two required log types, they are recorded as `login`/`logout` rows respectively with `{ outcome: "failed" }` / `{ outcome: "session_expired" }` in `metadata` — see `activity-log.ts` and its tests.

## Testing

```bash
npm run test --workspace=packages/auth   # 34 tests, no live Supabase project required (mocked)
npm run typecheck --workspace=packages/auth
```

No live Supabase project exists yet (Build Manifest item B4) — every test mocks the Supabase client surface this package actually calls (`tests/mock-supabase.ts`).
