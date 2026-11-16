# AHR Platform v1 — Security Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)

This document specifies security controls and their rationale. Schema-level RLS policy *statements* live in `02-Database.md` §10; this document explains why they exist and what surrounds them. Authentication/session mechanics are `08-Authentication-and-Authorization.md`.

---

## 1. Governing Principles

1. **Defense in depth** — no single layer is trusted alone.
2. **Least privilege** — every session or service gets only the access its current role needs, never more "just in case."
3. **Data classification drives handling** — security treatment follows a table's `visibility` classification (`public`, `restricted`, `hidden`), not a uniform blanket policy.
4. **Protection in transit and at rest** — restricted/sensitive data is protected whether moving between services or sitting in storage.
5. **Full auditability** — every consequential action (verify, publish, moderate, AI output) is logged immutably.
6. **Environment separation** — production data and runtime are fully isolated from development/staging (`13-Deployment-and-DevOps.md`).

## 2. Defense-in-Depth Layering (Concrete, Per Request)

```
① Route Handler / Server Action  — validates request shape and the session's role
② Owning domain package           — validates business rules (ownership, lifecycle, taxonomy scope)
③ Row Level Security (database)   — validates the actual database operation, independent of ① and ②
```

No layer assumes an earlier layer already caught everything. A developer relying only on layer ③ (letting the database reject bad data via a raw constraint) has not met this strategy — layer ② must catch it first with a meaningful, typed error.

## 3. Row Level Security — Enforced by Default

RLS is enabled on every one of the 20 tables, with no exception and no code-level bypass switch. A developer cannot disable RLS "for convenience" during development and forget to re-enable it — this is a database-level guarantee, not a discipline requirement. Full per-table policy statements: `02-Database.md` §10.

**The one sanctioned bypass:** the Supabase service role, used exclusively by server-side, non-request-driven migration scripts. It is never used in normal request-handling code paths.

## 4. Least Privilege in Practice

- v1 has exactly one active role (`administrator`); no session or service is ever granted more than that role's defined permissions (`08-Authentication-and-Authorization.md` §4–§5).
- `entity_state_transition`, `moderation_report`, and `activity_log` have **no direct client write policy** at all — only server-side code appends rows, even for an authenticated Administrator. An administrator can *cause* a logged action by taking it; they cannot hand-edit the log itself through the same API surface used for content.

## 5. Secrets Handling

| Secret | Where it lives |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side environment configuration only |
| OpenAI API key | Server-side environment configuration only |
| Email provider API key | Server-side environment variable, named by (not stored in) `platform_settings.email_configuration` |

No secret is ever placed in a `NEXT_PUBLIC_*` variable, committed to the repository, or written to any log stream.

## 6. Input Validation as a Security Control

Every request-body validation (`03-Backend.md` §5) doubles as an injection-prevention measure. No user input is ever interpolated directly into a query string; parameterized queries/binding are used throughout, via Supabase's client libraries and generated types.

## 7. Audit Trail Integrity

`activity_log` and `entity_state_transition` are insert-only from application code — no code path issues an `UPDATE` or `DELETE` against either table, and RLS enforces this independently of application-code discipline (§3). This is the technical guarantee behind `06-Dashboard.md`'s read-only Activity Log viewer.

## 8. Restricted Content and Signed URLs

Restricted/hidden Media assets are only ever reachable via a short-lived signed URL, generated on request and matching the asset's `visibility`. A direct, permanent link to a restricted asset's Storage path must never be generated or logged anywhere client-visible. Full upload/replace rules: `05-CMS.md` §5.

## 9. Rate Limiting

Login attempts and any public-facing write surface should be rate-limited at the infrastructure/edge layer. This is a production-configuration requirement flagged here, not re-derived per endpoint in application code — `RATE_LIMITED` (429) is reserved in the error-code catalog (`07-API.md`) for when this is configured.

## 10. Data Classification (Visibility) Summary

| Visibility | Who can read | Example |
|---|---|---|
| `public` | Anyone, including unauthenticated Visitors, when `status = 'published'` | Published Work/Project/Event content |
| `restricted` | Administrator only (and any future role granted explicit access) | Sensitive metadata not yet cleared for public display |
| `hidden` | Administrator only | Withdrawn/internal content |

`platform_settings` has its own selective public-read carve-out (§`02-Database.md` §10) distinct from content-table visibility — most keys are public, `ai_configuration`/`email_configuration` are Administrator-only regardless of the general rule.

## 11. Environment Isolation

Production data is never used in development or staging without being stripped of sensitive information first. Full environment model and promotion path: `13-Deployment-and-DevOps.md`.

## Backlog

- Formal rate-limiting configuration at the infrastructure/edge layer (flagged as a production-readiness requirement, not yet configured as of this document).
- Multi-factor authentication (`08-Authentication-and-Authorization.md` Backlog).
- Formal legal/compliance procedure for a permanent-deletion exception request — an open item that blocks that specific scenario, not general code-completeness (`13-Deployment-and-DevOps.md`).

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Security Architecture (Phase 8); Security Implementation Rules (Development Specification 14); `02-Database.md` §10; `08-Authentication-and-Authorization.md`
