# AHR Platform v1 — User Flows

**Status:** 🟡 Working — pending review, **one flow (Profile Management) flags a gap — see §11**

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
   → generic confirmation shown regardless of whether the email exists (security, Package 01 §15)
   → user receives reset email via Supabase Auth → sets new password → redirected to /login
```

## 4. Search

```
Any public page → SearchBar → enter query → /search?q=...
   → results ranked (exact match → verified → relevance) → optionally filter by Category/Tag
   → select a result → routed to the entity's detail page (Works/Projects/People/Events/Organizations)
   → no results → empty state suggesting categories/tags to browse instead
```

## 5. Archive Browsing

```
Home → Works (or Projects/Media/Recognition) → browse list, optionally filter
   → open a Work → Work Detail: full description, Contributions, related Media
   → contextual related-content links → another Work/Project
   → (optional) switch locale mid-browse → same page, other language
```

## 6. Media Upload

```
Dashboard → Media Library → Upload
   → select exactly one owner entity (Person/Work/Project/Event)
   → select file → upload begins (progress shown)
   → success → media_asset created (draft) → caption + lifecycle
   → failure → retry option, no orphaned record left behind
```

## 7. CMS Editing

```
Dashboard → CMS → select entity type → entity list
   → create new OR open existing → EntityForm (bilingual fields)
   → save (Draft) → attach required relationships (e.g. Contribution for a Work)
   → request Review → Verified → Publish
   → (at any step) an open moderation report on this record shows a standing Alert
```

## 8. AI Assistant

```
Within a CMS EntityForm → "Suggest" action (e.g. for Category or Summary)
   → AISuggestionPanel appears inline with rationale + confidence
   → Administrator: Accept (applied to form field, not yet saved) | Edit | Reject
   → form save proceeds as normal afterward — the suggestion never saves itself
```

## 9. Notifications

```
Dashboard, any page → Top Bar Moderation badge (count of open reports)
   → click → Moderation Queue → open a report → review → resolve/escalate
```

This is the only notification-adjacent flow in V1 (Packages Specification, Package 10 §13 — no general notification feed exists yet).

## 10. Organization Management

```
Dashboard → Contacts & Organizations → list → create/open an Organization
   → bilingual name/description → lifecycle transitions (Draft→...→Published/Archived)
   → view "Related Records" (Awards/Projects/Events/Press Mentions referencing this Organization)
```

Contact info/notes/tags are **not part of this flow in V1** — Packages Specification, Package 05 §13, schema gap.

## 11. Profile Management — Flagged Gap

**No "Profile Management" screen is defined anywhere in the Packages Specification.** Authentication (Package 01) covers sign-in, sign-out, and password reset only; there is no Administrator profile-editing page (e.g. changing display name, avatar, or other personal settings) specified for V1.

Rather than inventing a new screen not present in the Packages Specification (violating this task's "do not invent new modules" instruction), this is flagged here as a gap. If Profile Management is required for V1, it needs to be added to Package 01 or Package 07's scope first, the same review-round process used for prior gaps (e.g. `moderation_report`). Until then, the only "profile" action available is Sign Out (Flow §2) and Password Reset (Flow §3).

---

**Status:** 🟡 Working — item §11 unresolved
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification (all 10 packages), User Journeys / Entry Points (Phase 7)
