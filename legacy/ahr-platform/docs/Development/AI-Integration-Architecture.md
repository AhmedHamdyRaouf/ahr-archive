# AHR Platform v1 — AI Integration Specification

**Status:** 🟡 Specified, Not Yet Implemented (CTO Deliverable, v1.0) — implementation status is a deliberate, documented fact, not an omission from this document
**Provider:** OpenAI only, frozen, behind a provider-agnostic abstraction layer

---

## 1. Scope

**In scope for v1:** Archive-scoped AI assistance only — suggested Category/Tag assignment and draft summary/description text for Work/Project entities, surfaced to the Administrator inside CMS forms as human-reviewable proposals.
**Explicitly out of scope:** Any autonomous write to published content; any AHR Academy or Creative Network AI feature (Release 2); presentation-layer-only optimization that requires no human review (e.g., search result ranking) — that is `@ahr/search`'s concern, not this system's, since it does not produce a "recommendation" in the sense governed here.

## 2. Governing Decision Boundaries (Non-Negotiable)

1. AI never autonomously modifies governed platform state (`status`, `visibility`, `verification_status`, ownership, or any published content) — it may only inform a human decision.
2. Every AI output is explainable: it carries a rationale string and a confidence level before being shown to the Administrator.
3. Every AI output is bounded in data access: the abstraction layer sends only the specific entity's own fields as context, never a bulk export of the database.
4. A human is always in the loop before any AI output has real effect.

These four boundaries apply to every future AI capability added to this platform, not just the two use cases in scope for v1.

## 3. Runtime Flow

```
① Administrator triggers a suggestion request from within a CMS form
② Request goes through the aiClient abstraction layer to OpenAI
③ Response is formatted with a rationale and a confidence level
④ Administrator reviews, and accepts, edits, or rejects
⑤ (Recommended, pending the schema gap in §5) request/response/decision is logged for audit
```

AI execution happens within an isolated boundary that has no direct write access to Core Data. Any effect on real content passes back through the normal CMS save/publish path — the AI system itself never writes to `work`, `project`, or any other content table directly.

## 4. Current Implementation Status

**Not yet built.** As of this document, no `ai` package, no AI-related Route Handler, and no AI suggestion UI exist in the codebase. This is consistent with the platform's own build sequencing: the Intelligence layer is deliberately built last, after Core Data and Governance layers are mature, and is explicitly non-critical to the platform's core operation. This document specifies the target implementation so the eventual build is traceable to an approved specification, not built ad hoc when the time comes.

## 5. The Schema Gap (Flagged, Not Worked Around)

**No table for storing AI recommendations exists in the frozen v1 Database Architecture (`02-Database.md`).** AI output persistence — target entity, suggested content, rationale, confidence level, review state (accepted/edited/rejected) — has no home in the current 20-table schema.

**Consequence:** when built, AI suggestions in v1 will be **ephemeral** by necessity — generated on request, shown once, discarded if the Administrator navigates away without accepting. This is a real functional limitation, not a design preference.

**Recommended path (proposed, not assumed or pre-approved by this document):**

```
ai_recommendation_log (proposed — requires a dedicated Database Architecture review round)
  id                uuid primary key
  entity_table      text not null
  entity_id         uuid not null
  suggested_content jsonb not null
  rationale         text not null
  confidence_level  text not null
  review_state      text not null   -- pending | accepted | edited | rejected
  provider          text not null default 'openai'
  + standard audit columns (created_at, created_by, updated_at, updated_by)
```

This table is proposed using the exact same review process already used to add `moderation_report`, `platform_settings`, and `activity_log` to the frozen schema — it is not added by this document.

## 6. Provider Abstraction

All calls to OpenAI go through exactly one abstraction module (`aiClient`) — no CMS or Dashboard code calls the OpenAI SDK directly. The interface is provider-agnostic from day one even though only OpenAI is wired up, which is the entire point of the frozen "OpenAI only, with an abstraction layer" decision rather than "OpenAI, full stop." Adding a second provider later means implementing the same interface, not touching any call site (`09-Integrations.md` §5).

## 7. Security and Cost Controls

- The OpenAI API key lives server-side only, in environment configuration — never exposed to the client (`10-Security.md` §5).
- No automatic bulk or background AI calls in v1 — every call is triggered by an explicit Administrator action.
- AI suggestion requests never block the primary CMS save action — they are optional, secondary, non-blocking requests (`11-Performance.md` §1).
- AI output is treated as untrusted input when applied to a form field — it goes through the exact same field validation as manually typed content, never a parallel, more-trusting validation path.

## 8. Interim Logging (Until §5's Gap Is Resolved)

Every AI provider call and its outcome (success/timeout/error) is written to the technical/operational log stream in the interim — this is a temporary logging home for traceability, not a substitute for the eventual persisted, queryable `ai_recommendation_log` table (`11-Performance.md` §6).

## 9. UX Contract (Cross-Reference)

Any AI-generated content rendered in the UI uses a single, consistent visual contract that is never mistakable for already-saved content — a hard rule enforced at the component level (`04-Frontend.md` §6), not a per-feature styling choice.

## 10. Failure Behavior

| Scenario | Behavior |
|---|---|
| Provider timeout/error | The suggestion panel shows a failure message; the CMS form remains fully usable without the suggestion |
| Malformed AI response | Discarded entirely, treated as a failure — never partially applied |

## Backlog

- Build the `ai` package and its Route Handler/UI surface — currently unbuilt (§4).
- `ai_recommendation_log` persistence, pending a dedicated Database Architecture review round (§5).
- Additional AI providers behind the existing `aiClient` abstraction.
- AI-assisted moderation triage — still fully human-decided, per §2, if ever added.
- Any Academy/Creative Network AI capability — entirely Release 2, requires its own dedicated architecture pass first.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** AI Principles, AI Role and Boundaries, AI Interaction Architecture, AI Decision Boundaries, AI Data Access Model, AI Recommendation Model, AI Explainability, AI Confidence Model, Human-in-the-Loop Architecture (Phase 5); AI Runtime Architecture (Phase 8); Packages Specification Package 06; `02-Database.md`; `09-Integrations.md` §5
