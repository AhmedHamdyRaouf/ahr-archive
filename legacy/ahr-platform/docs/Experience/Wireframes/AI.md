# Wireframes — AI Assistant

**Screens:** None standalone — `AISuggestionPanel` is embedded within CMS entity forms only (Wireframes/CMS.md), triggered by a "Suggest" action on a specific field.

## Composition
An inline panel appearing directly beneath or beside the field it relates to — never a modal, so the Administrator can keep working on other fields while deciding.

```
[Field: Category]
┌───────────────────────────────┐
│ ✨ Suggested: "Architecture"     │
│ Rationale: ...  Confidence: •••  │
│ [Accept] [Edit] [Reject]         │
└───────────────────────────────┘
```

## Components
`AISuggestionPanel`, Badge (confidence — contextual only, not universal), Button (Accept/Edit/Reject).

## State Coverage Required
Loading (in-flight request, rest of form stays usable) · Error ("couldn't generate a suggestion right now," disappears without affecting the form) · Success (field visibly updates on Accept/Edit — no separate confirmation).

## Principle Enforced Here
A suggestion must never visually resemble already-saved content (Design Principles §4) — distinct background/border treatment, not just a label.

## Cross-Reference
Full behavioral spec: original UI/UX Specification, AI UI. Flow: `User Flows/README.md` §8. Known gap: suggestions are ephemeral in V1 (no persistence table yet) — `Backlog.md`.
