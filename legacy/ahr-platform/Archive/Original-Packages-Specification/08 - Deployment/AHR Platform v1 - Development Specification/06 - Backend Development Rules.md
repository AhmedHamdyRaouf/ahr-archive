# AHR Platform v1 — Backend Development Rules

**Status:** 🔒 Frozen

## API Architecture

Next.js Route Handlers + Server Actions only — no separate backend service (frozen decision, Database Architecture document header). Route Handlers back the endpoints documented in the API Specification; Server Actions may be used for the same logic where a form-submission-style call fits better, but must produce identical validation/response behavior either way — the API Specification is the contract, not the mechanism used to satisfy it.

## Where Business Logic Lives

Every Route Handler/Server Action is a thin adapter: parse input → call a `packages/content` (or `packages/auth`/`packages/governance`/`packages/search`/`packages/ai`) function → shape the response per `01 - API Standards`. No validation, lifecycle, or business-rule logic is written inline in a Route Handler — it calls into the owning package, per Development Principles §2.

## Validation

Every request body is validated against the rules in the corresponding API Specification endpoint before touching the database — even though the database also enforces its own `check` constraints (Database Architecture). This is for meaningful error messages (`VALIDATION_ERROR` with field-level `details`), not because the database can't be trusted.

## Response Shape

Every Route Handler returns the `{ data, error, meta }` envelope (`01 - API Standards`) — no ad hoc response shapes, no bare arrays/objects, no exceptions for "quick" endpoints.

## Authentication Enforcement

Every protected Route Handler/Server Action calls the shared session-resolution helper (Authentication Rules, doc 13 of the API Specification) at its start — never reimplements session checking inline.

## Database Access

Only `packages/database`'s generated types and `packages/content`'s repository functions touch the 8 core Archive tables. `packages/governance`, `packages/auth`, `packages/search`, and `packages/ai` each own their respective tables (`moderation_report`; `platform_user`, `activity_log`; read-only search views; nothing persisted yet, per the AI schema gap) — no package queries a table it doesn't own.

## Supabase Usage

- Server-side Supabase client (service role or user-scoped, per context) is instantiated once per request, not per query.
- Row Level Security is never bypassed from application code except by the one sanctioned migration-script exception (Database Architecture §8).

## Idempotency and Retries

Per API Conventions (doc 15 of the API Specification): transition and upload endpoints are not guaranteed idempotent — backend code does not need to implement idempotency-key handling in V1, but must fail predictably (documented error codes) on a retried request rather than silently succeeding twice.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** API Specification (all documents), Service Architecture / Security Architecture (Phase 8)
