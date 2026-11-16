# AHR Platform v1 — State Management Strategy

**Status:** 🔒 Frozen

## Server State vs. UI State

Two distinct categories, handled differently:

- **Server state** (entities, lists, settings, moderation reports) — owned by the server, fetched via Server Components or the shared API integration layer (doc 08). Not duplicated into a global client-side store.
- **UI state** (form input before submission, open/closed panels, current filter selections not yet submitted) — local component state, or URL query string for anything that should survive a refresh (list filters, pagination, doc 08).

## No Heavy Global Client Store in V1

Given the platform is primarily server-rendered (Website) and form/table-driven (Dashboard), no global client-side state management library is required for V1 — React's built-in state plus the URL (for shareable/durable UI state) covers the specified scope. This is a scope decision proportional to what's actually built (Development Boundaries, Phase 9's "Minimum Governed Product" reasoning applied to frontend architecture), not a permanent prohibition — revisit only if a genuine cross-cutting client state need emerges that URL/local state can't express.

## AI Suggestion State

The `AISuggestionPanel`'s pending/accepted/rejected state (Packages Specification Package 06) is local to the form it's embedded in — it is never persisted across navigations in V1, consistent with suggestions being ephemeral (AI API §"Specified but Blocked").

## Session State

Authentication state (is the user signed in, what's their role) is resolved server-side per request (Authentication Rules, doc 13 of the API Specification) — the frontend does not maintain its own separate "am I logged in" state that could drift from the actual session; `GET /api/auth/session` is the single source of truth when the client needs to check.

## Form State

Bilingual field pairs are managed as a single form's state, not two independent forms — an incomplete Arabic field and a complete English field are both part of one validation pass, not two separate submissions.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Frontend Development Rules (07), API Integration Rules (08)
