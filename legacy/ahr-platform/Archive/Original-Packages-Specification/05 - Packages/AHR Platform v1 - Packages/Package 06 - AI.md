# Package 06 — AI

**Status:** 🟡 Working — pending review, **contains an unresolved schema gap (see §13)**
**Package Type:** Backend service, surfaced through Package 07 (Dashboard) for human review

## 1. Package Overview

Implements AI Runtime Architecture, AI Recommendation Model, and AI Explainability (Phase 5/8) for V1: OpenAI as the sole provider, behind an abstraction layer, producing reviewable recommendations — never autonomous content changes — per AI Decision Boundaries (Phase 5).

## 2. Objectives

- Provide Archive-scoped AI assistance (suggestions, summaries) without violating AI Decision Boundaries.
- Keep every recommendation explainable and tied to a confidence level.
- Isolate the OpenAI dependency behind an abstraction so a second provider can be added later without touching call sites.

## 3. Scope

**In scope:** Recommendation generation for Archive content (e.g. suggested category/tag assignment, draft summary text) as human-reviewable suggestions only.
**Out of scope:** Any autonomous write to published content; any Academy/Creative Network AI feature (Release 2); any presentation-layer-only optimization requiring no human review (e.g. search ranking) — those belong to Package 09, not here, since they don't produce a "recommendation" in the AI Decision Boundaries sense.

## 4. Features

- Generate a suggested Category/Tag assignment for a Work/Project, shown to the Administrator in CMS (Package 02) as a proposal, never auto-applied.
- Generate a draft summary/description suggestion for a Work, shown the same way.
- Every suggestion carries a rationale (AI Explainability) and a confidence level (AI Confidence Model).

## 5. User Stories

- As the Administrator, I can request an AI-suggested category for a Work and choose to accept, edit, or reject it.
- As the Administrator, I can see why the AI suggested what it did (its rationale) before deciding.
- As the Administrator, I never see an AI suggestion silently applied without my action.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Every AI output must include a rationale string and a confidence level before being shown to the Administrator. |
| FR-2 | No AI output may change `status`, `visibility`, `verification_status`, ownership, or any published content without an explicit Administrator accept action. |
| FR-3 | The OpenAI call must go through one abstraction module — no direct OpenAI SDK calls from CMS or Dashboard code. |

## 7. Non-Functional Requirements

- Latency: AI suggestion requests should not block the primary CMS save action — they are an optional, secondary request.
- Cost control: no automatic bulk/background AI calls in V1 — every call is triggered by an explicit Administrator action.

## 8. Pages

No dedicated pages — AI suggestions appear as an panel/action within Package 02's (CMS) entity forms, not as a standalone destination.

## 9. Components

- `AISuggestionPanel` (rationale + confidence + accept/edit/reject controls), embedded in CMS forms.
- `aiClient` (OpenAI abstraction module — see §21).

## 10. Navigation Flow

```
CMS entity form → "Suggest" action → AISuggestionPanel appears inline
                                    → Accept (applies to the form field, not yet saved)
                                    → Reject (dismissed, nothing recorded as applied)
```

## 11. Complete Workflow

```
① Administrator triggers a suggestion request from within a CMS form
② Request goes through the AI abstraction layer to OpenAI
③ Response is formatted with rationale + confidence (AI Explainability/Confidence Model)
④ Administrator reviews, accepts/edits/rejects
⑤ (Recommended, pending §13) the request/response/decision is logged for audit
```

## 12. Roles & Permissions

Administrator only — the sole role able to trigger or review AI suggestions in V1.

## 13. Database Tables Used — and the Schema Gap

**No table for storing AI recommendations exists in the Frozen v1 Database Architecture.** AI Recommendation Model (Phase 5) and this package's own Functional Requirements (FR-1, "every AI output must include...") imply persisting at minimum: the target entity, the suggested content, the rationale, the confidence level, and the review state (accepted/edited/rejected) — none of which has a home in the frozen 20-table schema.

**Until this is resolved:** AI suggestions in V1 are **ephemeral** — generated on request, shown once, and not persisted anywhere if the Administrator navigates away without accepting. This is a real functional limitation, not a design preference, and is called out here rather than solved by inventing a table.

**Recommended path (not assumed here):** a `ai_recommendation_log` table — `id`, `entity_table`, `entity_id`, `suggested_content` (jsonb), `rationale` (text), `confidence_level` (text), `review_state` (text: pending/accepted/edited/rejected), `provider` (text, default `'openai'` — supporting the abstraction layer at the data level too), plus the standard audit columns — proposed for a Database Architecture Review Round 2, the same process used for `moderation_report`/`platform_settings`/`activity_log`.

## 14. APIs Required

- `requestSuggestion(entityTable, entityId, kind)` — Server Action, calls the AI abstraction layer.
- `aiClient.generate(prompt, context)` — internal abstraction function, OpenAI-backed in V1.

## 15. Validation Rules

- Suggestions are only requested for entities the Administrator is actively editing (no bulk/background triggering in V1).
- AI output is treated as untrusted input when applied to a form field — it goes through the same field validation as manually typed content (Coding Standards' "no re-implementation per call site" — the form's existing validation, not a parallel path).

## 16. Business Rules

- AI Decision Boundaries (Phase 5): AI never autonomously modifies governed platform state; it may only inform a human decision.
- AI Principles (Phase 5): every output explainable, bounded data access, human-in-the-loop always.

## 17. Security Considerations

- The OpenAI API key lives server-side only (environment configuration), never exposed to the client.
- AI Data Access Model (Phase 5): the abstraction layer only sends the specific entity's own fields as context — never a bulk export of the database.

## 18. Edge Cases

- OpenAI request failure/timeout → CMS form must continue working normally without the suggestion; this is an enhancement, not a dependency of saving content.
- Administrator accepts a suggestion, then edits it further before saving → treated as a normal manual edit from that point on.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Provider timeout/error | Suggestion panel shows a "couldn't generate a suggestion right now" message; form remains fully usable |
| Malformed AI response | Discarded, treated as a failure, not partially applied |

## 20. Acceptance Criteria

- [ ] Suggestion requests work for at least Category/Tag and summary-text use cases.
- [ ] Every suggestion shown includes rationale and confidence.
- [ ] No suggestion is ever auto-applied without an explicit Administrator action.
- [ ] All OpenAI calls route through one abstraction module.

## 21. Dependencies

- **Depends on:** Package 02 (CMS, where suggestions are surfaced), Package 04 (Archive, for entity context), AI Principles / AI Decision Boundaries / AI Recommendation Model / AI Explainability / AI Confidence Model (Phase 5).
- **Depended on by:** None yet in V1 (Package 09/Search's ranking is explicitly out of this package's scope, per §3).
- **Blocked by:** The `ai_recommendation_log` schema gap (§13) for persistence/audit — not for basic functionality.

## 22. Future Improvements (Post v1)

- Persist recommendations (`ai_recommendation_log`, pending schema decision).
- Additional AI providers behind the same abstraction.
- AI-assisted moderation triage (still human-decided, per AI Decision Boundaries).

## 23. Testing Checklist

- [ ] Suggestion flow works end to end for at least one entity type.
- [ ] Provider failure degrades gracefully.
- [ ] No code path calls OpenAI outside the abstraction module.

## 24. UX Notes

- Suggestions must visually read as "a suggestion," never as already-applied content (Interaction Patterns, Phase 7 — AI recommendations expose controls appropriate to role and never look like a fait accompli).

## 25. Developer Notes

- The abstraction layer's interface should be provider-agnostic from day one, even though only OpenAI is wired up — this is the entire point of freezing "OpenAI only, with an abstraction layer" rather than "OpenAI, full stop."

---

**Status:**
🟡 Working — schema gap unresolved

**Package:**
06 — AI

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 02 (CMS), Package 04 (Archive), AI Principles / AI Role and Boundaries / AI Interaction Architecture / AI Decision Boundaries / AI Data Access Model / AI Recommendation Model / AI Explainability / AI Confidence Model / Human-in-the-Loop Architecture (Phase 5), AI Runtime Architecture (Phase 8)
