# AHR Platform v1 — Logging Strategy

**Status:** 🔒 Frozen

## Three Distinct Logs — Do Not Conflate Them

| Log | Purpose | Table |
|---|---|---|
| `entity_state_transition` | Content lifecycle history (Draft→...→Archived) | `entity_state_transition` |
| `activity_log` | Actor actions (login, CRUD, settings changes) | `activity_log` |
| Technical/operational logs | Server errors, performance traces, request logs | Not a database table — a conventional application log stream |

Database Architecture (Frozen v1) already established the first two must never be merged into one table; this document adds the third category and the rule that **no code path writes technical/operational logs into either database table**, and vice versa — `activity_log` is not a debugging log, and the application log stream is not an audit trail.

## What Gets Logged Where

- Every mutating Route Handler/Server Action call → `activity_log`, if it represents a user-attributable action (Database Architecture §2.4).
- Every entity status transition → `entity_state_transition`, automatically, by the shared transition function (never written manually).
- Every unhandled exception / `500 INTERNAL_ERROR` → technical log stream, with full detail (stack trace, request context) — this detail must never reach the client (10 - Error Handling Strategy).
- Every AI provider call and its outcome (success/timeout/error) → technical log stream in V1, since no `ai_recommendation_log` table exists yet (API Specification, AI API gap note) — this is a temporary logging home, not a substitute for the eventual persisted table.

## Observability Principle

Logging observes the system; it does not influence it (Observability and Operational Architecture, Phase 8: "Observability shall observe the platform without influencing business behavior") — a logging failure must never block or alter a request's actual outcome.

## Sensitive Data

`ip_address`/`user_agent` (`activity_log`) and any technical log entry must never include full request bodies containing bilingual personal content verbatim beyond what's needed to identify the affected entity (`entityTable`/`entityId` is sufficient — logging the entire submitted form content is unnecessary and a needless data-handling risk).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Database Architecture (Frozen v1) §2.4, Observability and Operational Architecture (Phase 8)
