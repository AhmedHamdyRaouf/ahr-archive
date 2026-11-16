# AHR Platform v1 — Frontend Development Rules

**Status:** 🔒 Frozen

## Component Source of Truth

Every component built matches an entry in `16 - Components Library.md` (UI/UX Specification) — its name, its listed variants/states, and which module(s) use it. A developer proposing a new component not in that index updates the index in the same change, per that document's own rule.

## Server Components by Default

Public Website pages (Package 03) are Server Components by default — they fetch published+public data server-side, matching "no admin functionality leaks into this package" and keeping the published+public filter server-enforced (Website UI, doc 08 §17 of the API Specification's equivalent rule). Client Components are used only where interactivity genuinely requires them (forms, the AI suggestion panel, filters).

## Bilingual Field Rendering

Every component displaying a bilingual field pair (`titleAr`/`titleEn`) receives both values and the current locale, and renders only the current locale's value on the public Website — but CMS forms always render both fields together, editable side by side (CMS UI, doc 07 §9 of the UI/UX Specification). No component silently drops the untranslated-locale value.

## Design System Tokens, Not Hardcoded Values

No component hardcodes a color, font size, or spacing value directly — every value comes from the Design System's token categories (doc 02 of the UI/UX Specification). Since actual token *values* remain an open decision (B10), components are built against named token references from day one, so the eventual value decision is a token-definition change, not a component rewrite.

## Status/Verification Badges

Rendered by one shared component (`VerificationBadge`, plus a generic Status Badge), used identically across every module that shows lifecycle/verification state — never a per-module reimplementation (Design Principles §6, "consistency over novelty").

## AI Suggestion Distinctness

Any component rendering AI-generated content uses the `AISuggestionPanel` styling contract (visually distinct background/border, never resembling saved content) — this is a hard rule, not a preference (Design Principles §4).

## Forms

Every form's field-level validation mirrors the corresponding API endpoint's Validation Rules exactly — a form must never accept something the API will reject, and should surface the same error vocabulary (Error Codes, doc 12 of the API Specification) rather than inventing its own separate error text.

## Loading/Empty/Error States

Every list/detail screen implements the Loading, Empty, and Error states specified in its corresponding UI/UX Specification module document (§17–§19) — these are not optional polish, they are specified requirements.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** UI/UX Specification (all documents), API Specification
