# AHR Platform v1 — User Flows

**Status:** 🟡 Carried forward from `05 - User Flows.md`, unchanged in substance — one flow (§11) still flags a real, unresolved gap. This audit did not invent a resolution for it, per instructions not to add out-of-scope features.

## 1. Login
```
/{locale}/login → enter email + password → submit
   → success → /{locale}/dashboard
   → failure → inline error, stay on /login
```

## 2. Logout
```
Dashboard Top Bar → Account ▾ → Sign Out
   → session cleared → redirect to /{locale}/login
```

## 3. Forgot Password
```
/login → "Forgot password?" → /login/reset → enter email → submit
   → generic confirmation shown regardless of whether the email exists (security)
   → reset email sent → user sets new password → redirected to /login
```

## 4. Search
```
Any public page → SearchBar → enter query → /search?q=...
   → results ranked (exact match → verified → relevance) → optional Category/Tag filter
   → select a result → routed to entity detail page
   → no results → empty state suggesting categories/tags to browse instead
```

## 5. Archive Browsing
```
Home → Works (or Projects/Media/Recognition) → browse, optionally filter
   → open a Work → full description, Contributions, related Media
   → contextual related-content links → another Work/Project
   → (optional) switch locale mid-browse
```

## 6. Media Upload
```
Dashboard → Media Library → Upload
   → select exactly one owner entity → select file → upload (progress shown)
   → success → media_asset created (draft) → caption + lifecycle
   → failure → retry option, no orphaned record left behind
```

## 7. CMS Editing
```
Dashboard → CMS → entity type → entity list
   → create/open → EntityForm (bilingual fields)
   → save (Draft) → attach required relationships (e.g. Contribution for a Work)
   → request Review → Verified → Publish
   → (any step) an open moderation report on this record shows a standing Alert
```

## 8. AI Assistant
```
Within a CMS EntityForm → "Suggest" action
   → AISuggestionPanel appears inline with rationale + confidence
   → Accept | Edit | Reject
   → form save proceeds as normal — the suggestion never saves itself
```

## 9. Notifications
```
Dashboard, any page → Top Bar "Open Reports" badge
   → click → Moderation Queue → open a report → review → resolve/escalate
```
This is the only notification-adjacent flow in V1 — no general notification feed exists yet.

## 10. Organization Management
```
Dashboard → Contacts & Organizations → list → create/open an Organization
   → bilingual name/description → lifecycle transitions
   → view "Related Records" (Awards/Projects/Events/Press Mentions referencing this Organization)
```
Contact info/notes/tags are **not part of this flow in V1** — schema gap, carried forward.

## 11. Profile Management — Flagged Gap (unresolved)
No "Profile Management" screen is defined anywhere in scope. Authentication covers sign-in, sign-out, and password reset only — no Administrator profile-editing page. This is flagged, not invented: adding one here would be exactly the kind of out-of-scope feature this audit was told not to add. If required for V1, it needs a scope decision first (logged in `Backlog.md`).

## Cross-Cutting UX Conventions (folded in from the former "UX Guidelines" document — merged here to avoid a duplicate standalone file)
- **Tone:** Website — credible, editorial, warm-professional. Dashboard — direct, efficient, no marketing language.
- **Errors:** never raw technical errors; name what went wrong and, where possible, the next action. Security-sensitive errors (login, reset) stay deliberately generic.
- **Loading:** skeleton placeholders for tables/lists; buttons show their own loading state and disable during submission.
- **Empty states:** every list/grid has a designed empty state with a next action where applicable.
- **Confirmation:** required only for consequential, hard-to-reverse actions (Archive, Resolve). Routine actions (Save Draft, attach a Tag) stay friction-free.
- **Status visibility:** never more than one glance away, on any list, card, or detail screen, in any module.
- **AI distinctness:** always visually/textually marked as a suggestion until explicitly accepted.
- **Bilingual editing:** both language fields visible and editable together, never hidden behind a toggle.
- **Consistency enforcement:** a new pattern that doesn't match an existing convention is a signal to update this document first, not a reason to introduce a one-off exception.

---

**Status:** 🟡 10 of 11 flows fully specified and carried forward; §11 remains an open scope gap, correctly left open rather than filled with an invented screen
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
**Duplicate removed:** the former standalone "UX Guidelines" document is merged into this file's final section rather than kept as a 19th separate file, since its content is entirely about flows/conventions, not a distinct deliverable category — recorded in Design Status Report.md under "Files whose duplication was removed."
