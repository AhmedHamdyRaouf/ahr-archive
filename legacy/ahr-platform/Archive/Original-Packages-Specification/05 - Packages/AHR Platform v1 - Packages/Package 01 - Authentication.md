# Package 01 — Authentication

**Status:** 🟡 Working — pending review
**Package Type:** Backend service package (Route Handlers/Server Actions), consumed by every other admin-facing package

## 1. Package Overview

Authentication resolves "who is making this request" for every protected surface in AHR Platform v1. It wraps Supabase Auth (`auth.users`) and bridges it to our own `platform_user`/`person` model, per Identity Model (Phase 4) and the Database Architecture (Frozen v1) Authentication Model (§6).

## 2. Objectives

- Provide a single, reliable way to establish an authenticated session.
- Guarantee every protected route/action resolves to exactly one `platform_user` → `person`.
- Log every login/logout to `activity_log`.

## 3. Scope

**In scope:** Administrator sign-in, sign-out, session persistence, route protection, password reset (via Supabase Auth).
**Out of scope (V1):** Self-service registration, multi-role sign-up, Trainer/Student/Creative Member accounts (Release 2), social sign-on, multi-factor authentication (not yet decided — see Developer Notes).

## 4. Features

- Email/password sign-in via Supabase Auth.
- Session persistence across requests (Supabase server client, read in Route Handlers/Server Actions per the frozen API Architecture decision).
- Sign-out (session termination).
- Password reset flow (delegated to Supabase Auth's built-in mechanism).
- Route protection middleware for every `/dashboard/*` path.

## 5. User Stories

- As the Administrator, I can sign in with my email and password so I can access the Dashboard.
- As the Administrator, I can sign out so my session doesn't remain active on a shared device.
- As the Administrator, I can reset my password if I forget it.
- As an unauthenticated visitor, I am redirected away from `/dashboard/*` if I try to access it directly.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | The system must authenticate against Supabase Auth only — no parallel credential store. |
| FR-2 | On first successful sign-in for a given `auth.users` row, the system must resolve or create the corresponding `platform_user` row (`platform_user.id = auth.users.id`). |
| FR-3 | Every sign-in and sign-out must write one `activity_log` row (`action = 'login'` / `'logout'`). |
| FR-4 | Any request to a route under `/dashboard/*` without a valid session must redirect to `/{locale}/login`. |

## 7. Non-Functional Requirements

- **Security:** No credentials are ever stored outside `auth.users` (Database Architecture §6 — single source of truth).
- **Bilingual:** Login page exists under both `/ar/login` and `/en/login` (App Router locale segments).
- **Reliability:** Session check must not silently fail open — an error resolving a session is treated as "not authenticated."

## 8. Pages

| Page | Path | Notes |
|---|---|---|
| Sign in | `/{locale}/login` | Public, redirects to `/{locale}/dashboard` if already authenticated |
| Password reset request | `/{locale}/login/reset` | Public |

## 9. Components

- `SignInForm`
- `PasswordResetForm`
- `AuthGuard` (server-side wrapper used by every Dashboard route)

## 10. Navigation Flow

```
Visitor → /login → (success) → /dashboard (Package 07)
                 → (failure) → /login (inline error, no redirect)
Authenticated Administrator → /dashboard/logout (action) → /login
```

## 11. Complete Workflow

```
① Administrator submits email/password on /login
② Server Action calls Supabase Auth sign-in
③ On success: resolve platform_user by auth.users.id
      → if missing, this is a provisioning error (see Edge Cases) — administrators
        are seeded directly, never self-registered, in V1
④ Write activity_log row (action='login')
⑤ Redirect to /dashboard
```

## 12. Roles & Permissions

| Role | Can sign in? |
|---|---|
| Administrator | ✅ Yes — the only role active in V1 |
| Visitor | N/A — visitors don't authenticate |

## 13. Database Tables Used

`platform_user` (read/write), `activity_log` (write-only, append). `auth.users` is Supabase-managed, not part of our schema.

## 14. APIs Required

- `signIn(email, password)` — Server Action
- `signOut()` — Server Action
- `requestPasswordReset(email)` — Server Action
- Session-resolution middleware used by every other package's protected routes

## 15. Validation Rules

- Email must be a syntactically valid address before it is sent to Supabase Auth.
- Password reset requests do not reveal whether an email exists (standard enumeration-prevention practice).

## 16. Business Rules

- Exactly one active role exists in V1 (`administrator`) — see Database Architecture §7. There is no registration flow because there is no second account to create.
- A `platform_user` row is never deleted (No Hard Delete, Phase 1) even if access is later revoked; revocation is a future `status` value on `platform_user`, not implemented in V1 (single admin, no revocation flow planned).

## 17. Security Considerations

- Session cookies are HttpOnly/Secure (Supabase default), never exposed to client-side JavaScript.
- Rate limiting on sign-in attempts is a Package 11 (Security Hardening, per the Build Manifest) concern, not this package's — noted here as a dependency, not duplicated.
- `activity_log` write access is server-only (Database Architecture §8) — no client can forge a login entry.

## 18. Edge Cases

- Successful Supabase Auth login but no matching `platform_user` row exists → treated as a provisioning error; the administrator is signed out immediately and shown a generic error (this should only happen if `platform_user` was not seeded correctly during setup).
- Expired session mid-action (e.g. a Server Action runs after the session token expired) → the action fails closed, same as an unauthenticated request.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Wrong password | Generic "invalid credentials" message — never reveal which field was wrong |
| Network/Supabase outage | Generic "unable to sign in right now" message, no stack trace exposed |
| Missing `platform_user` row | Sign out immediately, generic error, logged server-side for investigation |

## 20. Acceptance Criteria

- [ ] Administrator can sign in and reach `/dashboard`.
- [ ] Administrator can sign out and is redirected to `/login`.
- [ ] Unauthenticated access to any `/dashboard/*` path redirects to `/login`.
- [ ] Every login/logout produces exactly one `activity_log` row.
- [ ] Password reset email is sent without revealing account existence.

## 21. Dependencies

- **Depends on:** Database Architecture (Frozen v1) §6–§8; Supabase Auth.
- **Depended on by:** Every other package (CMS, Contacts & Organizations, AI, Dashboard, Media Library, Notifications) — all require a resolved session.

## 22. Future Improvements (Post v1)

- Multi-factor authentication.
- Additional roles (Trainer, Student, Creative Member) — Release 2.
- Session revocation / "sign out everywhere" control.
- Social sign-on.

## 23. Testing Checklist

- [ ] Sign-in with correct credentials succeeds.
- [ ] Sign-in with incorrect credentials fails with a generic message.
- [ ] Sign-out clears the session.
- [ ] Direct navigation to a protected route while unauthenticated redirects to login.
- [ ] `activity_log` row is created for both login and logout.

## 24. UX Notes

- Login form should be the same visual weight/quality as the public site (UX Principles, Phase 7) — this is the Administrator's daily entry point, not an afterthought.
- No password strength meter or complexity theater — defer to Supabase Auth defaults.

## 25. Developer Notes

- Whether MFA is added later is a product decision, not an architectural one — nothing here blocks it.
- Route protection is implemented once, centrally (middleware), not re-implemented per page — consistent with Coding Standards' "no re-implementation per call site" rule.

---

**Status:**
🟡 Working

**Package:**
01 — Authentication

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Database Architecture (Frozen v1), Identity Model (Phase 4), Identity and Access Architecture (Phase 8)
