# AHR Platform v1 — Security Implementation Rules

**Status:** 🔒 Frozen

## Enforced by Default

Row Level Security is enabled on every table with no exception in application code — a developer cannot disable RLS for convenience during development and forget to re-enable it (Database Architecture §8, Security Architecture Phase 8: "security shall be enforced by default rather than requested by individual services").

## Defense in Depth — Every Layer Checks

1. Route Handler/Server Action validates the request and the session's role (06 - Backend Development Rules).
2. `packages/content`/relevant package validates business rules.
3. Row Level Security validates the actual database operation.

No layer assumes an earlier layer already caught everything — this is deliberate redundancy, not wasted effort (Security Architecture, Phase 8: "Defense in Depth").

## Least Privilege

Every session/service is granted only the access its current role needs (Database Architecture §7/§8). The Supabase service role (used only by migration scripts, per Row Level Security Strategy) is never used in normal request-handling code paths.

## Secrets Handling

`SUPABASE_SERVICE_ROLE_KEY`, the OpenAI API key, and any other secret live only in server-side environment configuration — never in a `NEXT_PUBLIC_*` variable, never committed to the repository, never logged (11 - Logging Strategy).

## Input Validation as a Security Control

Every request body validation (10 - Error Handling Strategy) doubles as an injection-prevention measure — no user input is ever interpolated directly into a query string; parameterized queries/ORM-equivalent binding is used throughout.

## Rate Limiting

Login attempts and public-facing write surfaces (there are none beyond Contact display data in V1, per Website API's read-only scope) should be rate-limited at the infrastructure/edge layer — this is flagged as a requirement for the eventual production configuration, not something re-derived per endpoint in application code.

## Signed URLs and Restricted Content

Restricted/hidden Media assets are only ever reachable via a short-lived signed URL — a direct, permanent link to a restricted asset's Storage path must never be generated or logged anywhere client-visible (12 - File Upload Rules).

## Audit Trail Integrity

`activity_log` and `entity_state_transition` are insert-only from application code — no code path issues an `UPDATE` or `DELETE` against either table, and RLS enforces this independently of application-code discipline (Database Architecture §8).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Security Architecture (Phase 8), Database Architecture (Frozen v1) §7–§8
