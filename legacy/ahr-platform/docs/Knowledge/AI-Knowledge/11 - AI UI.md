# AHR Platform v1 — AI UI

**Status:** 🟡 Working — pending review, **suggestions are ephemeral in V1 — see Packages Specification Package 06 §13**

## 1. Purpose
Present AI-generated suggestions to the Administrator, always as a reviewable proposal, never as applied content, per Packages Specification Package 06.

## 2. User Types
Administrator only.

## 3. Entry Points
A "Suggest" action embedded within relevant CMS entity form fields (e.g. Category assignment, Summary text) — there is no standalone AI page or navigation entry.

## 4. Screen List
None standalone — the `AISuggestionPanel` is a component embedded within CMS UI (doc 07), not its own screen.

## 5. Screen Hierarchy
N/A — embedded component only.

## 6. Navigation Flow
See User Flows doc 05, §8.

## 7. User Journey
Administrator is editing a CMS entity → triggers "Suggest" for a specific field → reviews the panel (rationale + confidence) → Accepts (applies to the field), Edits (accepts then modifies), or Rejects (dismisses) → continues the normal CMS save flow.

## 8. Wireframe Description
An inline panel appearing directly beneath or beside the field it relates to — never a modal that interrupts the whole form, since the Administrator should be able to keep working on other fields while deciding.

## 9. Layout Structure
`AISuggestionPanel`: suggested content preview, rationale text, confidence indicator (contextual — Database Architecture §16/Design System §"Confidence" — shown only where it materially affects the decision, not as a universal badge), Accept/Edit/Reject controls.

## 10. Components Used
`AISuggestionPanel`, Badge (confidence level, contextual only), Button (Accept/Edit/Reject).

## 11. Tables
None.

## 12. Cards
None — panel is inline, not card-styled, to visually distinguish "suggestion" from "content" (Design Principles §4).

## 13. Forms
None of its own — the suggestion applies into the existing CMS form field.

## 14. Buttons
Accept (Primary), Edit (Secondary — accepts then leaves the field open for editing), Reject (Tertiary/Ghost — dismisses without a trace).

## 15. Filters
None.

## 16. Search Experience
None.

## 17. Empty States
N/A — the panel only appears on request; there's no "no suggestions yet" list to show empty.

## 18. Loading States
Panel shows a loading indicator while the OpenAI request is in flight; the rest of the form remains fully usable during this time (Packages Specification Package 06 §7 — non-blocking).

## 19. Error States
Provider timeout/error: panel shows "couldn't generate a suggestion right now," and disappears without affecting the form (Packages Specification Package 06 §19).

## 20. Success States
Accept/Edit: field visibly updates with the suggested content, ready for normal save. No separate "success" confirmation beyond the visible field change.

## 21. Responsive Behaviour
Panel stacks below its field at every breakpoint — no side-by-side layout that would require extra horizontal space on Mobile/Tablet.

## 22. Accessibility Notes
The panel must be reachable and dismissible via keyboard; screen readers must announce it as a suggestion (not silently merge its text into the field before an explicit Accept).

## 23. Permissions
Administrator-only (the only role that edits CMS content in V1).

## 24. UX Rules
A suggestion must never visually resemble already-saved content (Design Principles §4) — distinct background/border treatment required, not just a label.

## 25. Future Improvements
Persisting suggestions for later review (`ai_recommendation_log`, pending schema decision, Packages Specification Package 06 §13); additional AI providers behind the existing abstraction.

---

**Status:** 🟡 Working — schema gap unresolved (persistence only; live suggestion flow is fully specified)
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 06, Package 02; AI Explainability/Confidence Model (Phase 5)
