# AHR Platform v1 — Authentication Rules

**Status:** 🔒 Frozen

## Mechanism

Every authenticated request carries a Supabase Auth session cookie. Route Handlers/Server Actions (the frozen API Architecture decision) read this session server-side via the Supabase server client — there is no custom token format or header-based API key scheme in V1.

## Resolution Chain

```
① Request arrives with a session cookie
② Supabase server client validates and decodes it → auth.users.id
③ Server resolves platform_user by auth.users.id
④ Server resolves person via platform_user.person_id
⑤ platform_user.role is now known for the remainder of the request
```

Any failure at steps ②–④ results in `UNAUTHENTICATED` (401), never a silent fallback to an anonymous/Visitor context for an endpoint that required authentication.

## Role Validation

There is no standalone "role validation" endpoint — role checking is a per-request server-side check performed identically across every protected endpoint (Coding Standards, "one place for a rule," realized here as one shared middleware/helper function, not one implementation per route). `14 - Permissions Matrix` documents which role each endpoint requires; `GET /api/auth/permissions` (02 - Authentication API) is the one endpoint that surfaces the current session's resolved role back to the client, for UI purposes only — it does not itself gate anything.

## Session Management

- Session lifetime and refresh are managed by Supabase Auth's own mechanism. `POST /api/auth/refresh-token` (02 - Authentication API) is a thin wrapper that triggers Supabase's refresh and returns the updated session status — the platform does not implement its own token issuance or expiry logic.
- A session is considered invalid the moment `platform_user` cannot be resolved for it (Packages Specification Package 01 §18) — this is treated as a provisioning error, not a normal expired-session case, and forces sign-out.

## Public (Unauthenticated) Endpoints

Only Website (Package 03/04 - Website API) and public Search (05 of 10 - Search API's non-CMS endpoints) are reachable without a session. Every other package's endpoints require authentication, per `14 - Permissions Matrix`.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Database Architecture (Frozen v1) §6, Packages Specification Package 01
