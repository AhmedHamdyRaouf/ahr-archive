# AHR Platform v1 — API Integration Rules

**Status:** 🔒 Frozen

## One Client-Side Fetch Layer

All frontend calls to the API go through one shared fetch/request module per resource family (mirroring the API Specification's generic entity families) — not ad hoc `fetch()` calls scattered across components. This module is responsible for: attaching the session cookie automatically, parsing the `{ data, error, meta }` envelope, and surfacing typed errors matching `12 - Error Codes.md`.

## Server Components Call Server Functions Directly

Where a Server Component needs data, it should prefer calling the underlying `packages/content`/`packages/search` function directly (in-process) rather than making an HTTP round-trip to its own Route Handler — the Route Handler exists for genuinely external/client-side callers. This avoids a needless network hop for server-rendered pages, without changing the documented API contract (the HTTP endpoints still exist and behave identically for any client that does call them).

## Error Surfacing

Every API error code (`12 - Error Codes.md`) maps to a specific, pre-written user-facing message in the frontend — a developer does not invent new error copy per feature; new error codes are added to the shared mapping table before they're used.

## Pagination Handling

Any list UI consuming a paginated endpoint uses the shared `meta.pagination` shape consistently — page/pageSize state lives in the URL query string for admin list views (so a refresh or shared link preserves the view), matching `01 - API Standards`.

## Optimistic UI

Not used for status transitions or destructive actions (Archive, Resolve) in V1 — these always wait for the server response before updating the UI, since a failed transition needs to be visibly rejected, not silently rolled back after a flash of the "successful" state (Interaction Patterns, Phase 7 — "clarity before beauty").

## AI Suggestion Calls

Always triggered by an explicit user action (never automatic/background), always non-blocking to the rest of the form (Packages Specification Package 06 §7), and always handled through the one `/api/ai/suggest` integration point — no component calls OpenAI or any AI provider directly.

## Locale-Aware Requests

Since the API itself is locale-agnostic (returns both language fields always, per `01 - API Standards`), the frontend's only locale-related integration responsibility is selecting which field to display — never filtering the request by locale.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** API Specification (all documents), UI/UX Specification
