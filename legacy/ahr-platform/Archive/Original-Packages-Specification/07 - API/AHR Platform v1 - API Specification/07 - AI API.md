# AHR Platform v1 — AI API

**Status:** 🔒 Frozen, **suggestions are not persisted in V1 — see the gap note below**

Base path: `/api/ai`

---

### Request Suggestion

- **Endpoint Name:** Request Suggestion
- **Purpose:** Generate an AI-assisted suggestion (e.g. category assignment, summary text) for a specific field of a specific entity, for human review.
- **Package:** AI
- **HTTP Method:** POST
- **Route:** `/api/ai/suggest`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** `Content-Type: application/json`, session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body (Input):** `{ "entityType": "works" | "projects" | ..., "entityId": uuid, "kind": "categorySuggestion" | "summarySuggestion" }`
- **Context:** The abstraction layer sends only this specific entity's own fields (title, existing description, existing category/tag assignments) as context to OpenAI — never a bulk export of other records (AI Data Access Model, Phase 5). No conversation history or prior suggestions are included as context in V1.
- **Permissions:** Administrator only; the request is scoped to entities the Administrator can already see and edit through CMS — no broader data access is granted by virtue of calling this endpoint.
- **Validation Rules:** `entityType`/`entityId` must reference an existing, accessible entity; `kind` must be one of the supported suggestion types.
- **Output:** `200 { "data": { "suggestedContent": ..., "rationale": string, "confidenceLevel": "high" | "medium" | "low", "provider": "openai" } }` — shape matches AI Recommendation Model (Phase 5): target, content, rationale, confidence, all present together, never rationale/confidence omitted.
- **Limitations:** Suggestions are advisory only — this endpoint never writes to the target entity itself (AI Decision Boundaries, Phase 5); one suggestion kind per call (no batch/bulk suggestion requests in V1); English/Arabic suggestion quality is not independently guaranteed identical, since it depends on the underlying OpenAI model's own bilingual capability, not something this platform controls.
- **Error Handling:** `502 PROVIDER_UNAVAILABLE` on OpenAI timeout/failure — the CMS form must remain fully usable regardless (Packages Specification Package 06 §19); `404 NOT_FOUND` for an invalid entity reference; `422 VALIDATION_ERROR` for an unsupported `kind`.
- **HTTP Status Codes:** `200`, `404`, `422`, `502`.
- **Business Rules:** AI Decision Boundaries (Phase 5) — this endpoint may only ever return a suggestion; it has no corresponding "apply" endpoint of its own (accepting a suggestion is expressed as a normal `PATCH`/taxonomy call on the CMS entity itself, using the suggested value as if it were manually entered — see 03 - CMS API).
- **Notes:** This is the only AI endpoint in V1. There is no `GET /api/ai/suggestions` history endpoint — see the gap note below.

---

## Specified but Blocked — Schema Gap

**No endpoint exists to list or retrieve past suggestions.** Packages Specification Package 06 §13 established that no `ai_recommendation_log` table exists in the Frozen v1 Database Architecture — suggestions are generated on request and not persisted. If the Administrator navigates away without accepting, the suggestion is gone; requesting it again may produce a different result (OpenAI is not guaranteed deterministic).

| Requested capability | Blocked because |
|---|---|
| `GET /api/ai/suggestions` (history) | No `ai_recommendation_log` table |
| `GET /api/ai/suggestions/{id}` (single past suggestion) | Same |

Both become real endpoints once the Database Architecture Review Round 2 (Packages Specification Package 06 §13/§22) adds the table.

---

**Status:** 🔒 Frozen — schema gap unresolved (persistence only; the live suggestion endpoint above is fully specified and unblocked)
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 06; AI Principles / AI Decision Boundaries / AI Data Access Model / AI Recommendation Model / AI Explainability / AI Confidence Model (Phase 5)
