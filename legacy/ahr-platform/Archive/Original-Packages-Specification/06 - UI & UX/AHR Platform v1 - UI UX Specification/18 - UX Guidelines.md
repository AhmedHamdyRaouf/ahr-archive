# AHR Platform v1 — UX Guidelines

**Status:** 🟡 Working — pending review

Cross-cutting conventions every module's copy, feedback, and interaction patterns follow.

## Tone
Public Website: credible, editorial, warm-professional (Brand Voice, Phase 2). Dashboard: direct, efficient, no marketing language — this is a working tool for one Administrator, not a product being sold to them.

## Error Message Style
- Never expose raw technical errors (stack traces, database error codes) to any user, including the Administrator.
- Every error names what went wrong and, where possible, what to do next (e.g. "Add at least one Contribution before publishing" rather than "Validation failed").
- Security-sensitive errors (login, password reset) are deliberately generic (Authentication UI, doc 06, §19) — this is the one deliberate exception to "be specific."

## Loading Feedback Conventions
- Skeleton placeholders for content that takes a moment to load (tables, lists) — never a bare spinner covering the whole screen for routine loads.
- Buttons show their own loading state and disable during submission, preventing double-submission everywhere (Authentication, CMS, Media Library, Dashboard).

## Empty State Conventions
Every list/grid across every module has a designed empty state (module docs §17) — a message plus, where applicable, a clear next action (e.g. Create/Upload button). An empty state is never just a blank area.

## Confirmation Conventions
- Consequential, hard-to-reverse actions (Archive, Resolve-a-report) require an explicit confirmation step (Dialog).
- Routine actions (Save Draft, attach a Tag) do not require confirmation — friction is reserved for where the business rule requires deliberateness (Design Principles §5).

## Status Visibility Convention
Status and Verification indicators are never more than one glance away, on any list, card, or detail screen, across every module — this is the single most repeated rule in this specification because it is the platform's core trust mechanism (Design Principles §2).

## AI Distinctness Convention
Anywhere AI-generated content appears, it is visually and textually marked as a suggestion until explicitly accepted (Design Principles §4, AI UI doc 11).

## Bilingual Editing Convention
Every place an Administrator edits bilingual content, both language fields are visible and editable together, not hidden behind a language toggle that risks one language being forgotten (CMS UI, doc 07, §9).

## Consistency Enforcement
Any new pattern proposed during development that doesn't match an existing convention in this document is a signal to update this document first, not to quietly introduce a one-off exception (mirrors the "no silent change" principle already governing the rest of this project's documentation, Phase 0/1).

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Design Principles (01), Brand Voice (Phase 2), UX Principles (Phase 7)
