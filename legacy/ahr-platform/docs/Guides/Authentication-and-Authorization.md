# AHR Platform v1 — Authentication & Authorization Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)
**Provider:** Supabase Auth exclusively — no parallel credential store, no custom token format, no header-based API key scheme.

---

## 1. Principle: Identity vs. Session vs. Role

Three distinct concepts, never conflated:

| Concept | What it answers | Where it lives |
|---|---|---|
| **Identity** (`person`) | Who this individual is, conceptually | `person` table |
| **Session/Authentication** (`auth.users` → `platform_user`) | Is this request currently authenticated, and as whom | Supabase Auth + `platform_user` bridge |
| **Authorization/Role** (`platform_user.role`) | What this session is allowed to do | `platform_user.role` |

A role change never requires changing the underlying identity; identity resolution is fully separate from the authorization decision.

## 2. Session Resolution Chain

```
① Request arrives with a Supabase Auth session cookie
② Supabase server client validates and decodes it → auth.users.id
③ Server resolves platform_user by auth.users.id
④ Server resolves person via platform_user.person_id
⑤ platform_user.role is now known for the remainder of the request
```

Any failure at steps ②–④ results in `UNAUTHENTICATED` (401) — never a silent fallback to an anonymous/Visitor context for an endpoint that required authentication. A session that cannot resolve to a `platform_user` is treated as a provisioning error, not a normal expired-session case, and forces sign-out.

## 3. Two-Layer Route Protection (Defense in Depth)

| Layer | Where | What it checks |
|---|---|---|
| Edge gate | `apps/web/middleware.ts`, matching `/(ar|en)/dashboard/:path*` | Fast check: does a valid Supabase session exist at all |
| Authoritative check | `@ahr/auth`'s `session.ts`/`policy.ts`, called in-process by every Server Component/Route Handler that actually resolves the session | Full chain (§2), including role resolution and the `platform_user`-missing failure mode |

Middleware is a fast, edge-friendly first gate; it deliberately does not perform the fuller `platform_user`/role resolution — that authoritative check happens closer to the data, every time, independent of whether middleware already ran. Public Website routes pay zero session-check cost.

## 4. Roles (v1)

| Role | Active? | Permissions |
|---|---|---|
| `administrator` | ✅ Yes | Full read/write on every table; the only role that changes `status`/`visibility`/`verification_status`; the only role that acts on `moderation_report` |
| Visitor (unauthenticated) | ✅ Yes, implicit — no row | Read-only, and only rows where `status = 'published' AND visibility = 'public'` |
| `trainer`, `student`, `creative_member` | ❌ Not in v1 | Reserved values in the `role` column's design for Release 2; zero permissions today |

`platform_user.role` is a `text` column with a narrow `check` constraint naming only `'administrator'` today — adding a role later is a one-line constraint change, never a structural migration or an `ALTER TYPE`.

## 5. Permissions Matrix (Authoritative, Package-Level)

| Surface | Read (public) | Read (authenticated) | Write | Archive/Delete |
|---|---|---|---|---|
| Authentication | — | Administrator (own session only) | Administrator (own session only) | — |
| CMS | — | Administrator | Administrator | Administrator |
| Website | ✅ Visitor (published+public only) | — | — | — |
| Contacts & Organizations | — | Administrator | Administrator | Administrator |
| AI | — | Administrator | Administrator (suggestion requests only) | — |
| Settings | ✅ Visitor, partial (site info/SEO/branding/social only) | Administrator (full, incl. `ai_configuration`/`email_configuration`) | Administrator | — |
| Activity Log | — | Administrator (read-only) | — (system-written only) | — (append-only) |
| Moderation Queue | — | Administrator | Administrator | — |
| Media Library | ✅ Visitor (published+public only) | Administrator (all statuses) | Administrator | Administrator (archive only) |
| Search | ✅ Visitor (published+public only) | Administrator (unfiltered, CMS-embedded) | — | — |
| Notifications | — | Administrator (dispatch is system-derived) | — | N/A |

`trainer`, `student`, `creative_member` have zero rows in this matrix — they cannot authenticate or hold any permission in v1.

## 6. Row Level Security (Enforcement Layer, Cross-Referenced)

RLS is the database-level enforcement of everything in §4–§5, active on every table with no exception. Full policy detail (which policies exist per table, the client-write exclusions for audit tables): `02-Database.md` §10. RLS is never bypassed from application request-handling code — the Supabase service role is reserved exclusively for server-side, non-request-driven migration scripts (`13-Deployment-and-DevOps.md`).

## 7. Authentication Surface (v1 Scope)

**In scope:** Administrator email/password sign-in via Supabase Auth, sign-out, session persistence, password reset (delegated to Supabase Auth's own mechanism), route protection.
**Out of scope for v1:** Self-service registration, multi-role sign-up, social sign-on, multi-factor authentication. Administrators are seeded directly; there is no registration flow because there is no second account type to create in v1.

## 8. Core Endpoints (Contract Reference; Full Detail in `07-API.md`)

| Endpoint | Auth required | Notes |
|---|---|---|
| `POST /api/auth/login` | No | Generic failure message; never reveals whether an email exists; writes one `activity_log` row |
| `POST /api/auth/logout` | Yes | Writes one `activity_log` row |
| `POST /api/auth/refresh-token` | Yes | Thin wrapper over Supabase's own refresh mechanism |
| `POST /api/auth/forgot-password` | No | Always returns success regardless of whether the email matches an account |
| `POST /api/auth/reset-password` | No (token-authenticated) | — |
| `GET /api/auth/profile` | Yes | Read-only; no corresponding write endpoint exists (no profile-editing feature is approved) |
| `GET /api/auth/permissions` | Yes | Informational only — does not itself gate anything; every endpoint independently checks role server-side |
| `GET /api/auth/session` | No | Never returns 401; "not authenticated" is itself a normal, successful answer |

## 9. Security Properties

- Session cookies are HttpOnly/Secure (Supabase default) — never exposed to client-side JavaScript.
- `activity_log` write access is server-only — no client can forge a login entry.
- No credential (password, email) is stored anywhere outside `auth.users`.
- Login-attempt rate limiting is an infrastructure/edge-layer concern (`10-Security.md`), not duplicated in application code.

## 10. Known Limitations (v1, By Design)

- No profile-editing capability — `GET /api/auth/profile` exposes existing data for display only.
- No session revocation ("sign out everywhere") control — single administrator, no revocation flow planned in v1.
- `platform_user` deactivation, if ever needed, is a future `status` value — not implemented, since v1 has exactly one administrator and no self-service deactivation flow.

## Backlog

- Multi-factor authentication.
- Additional roles (`trainer`, `student`, `creative_member`) — Release 2, requires its own IA/data/business-logic documents first.
- Session revocation / "sign out everywhere."
- Social sign-on.
- Profile editing.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Identity Model (Phase 4); Identity and Access Architecture, Security Architecture (Phase 8); Packages Specification Package 01; Authentication API, Authentication Rules, Permissions Matrix (frozen API Specification); `02-Database.md` §8–§10
