# AHR Platform v1 — Authentication UI

**Status:** 🟡 Working — pending review

## 1. Purpose
Give the Administrator a reliable, low-friction way to sign in, sign out, and recover access, per Packages Specification Package 01.

## 2. User Types
Administrator (the only role in V1); Visitor (only in the sense of being unauthenticated and redirected away from protected routes).

## 3. Entry Points
Direct navigation to `/{locale}/login`; automatic redirect from any `/dashboard/*` path when unauthenticated.

## 4. Screen List
- Sign In (`/{locale}/login`)
- Password Reset Request (`/{locale}/login/reset`)
- Password Reset Confirmation (handled by Supabase Auth's own hosted/linked flow)

## 5. Screen Hierarchy
```
/login
  └── /login/reset
```
Flat — no nested depth (Navigation System, Phase 3).

## 6. Navigation Flow
See User Flows doc 05, §1–3.

## 7. User Journey
Administrator arrives at `/login` (directly or via redirect) → signs in → lands on Dashboard home. If password forgotten, detours through Reset before returning to Sign In.

## 8. Wireframe Description
Centered single-column form on a minimal background (no Sidebar/SiteHeader chrome) — this is the one screen in the platform that belongs to neither the public Website register nor the Dashboard register; it is deliberately neutral.

## 9. Layout Structure
Logo/site name (from `platform_settings`) above form; form fields stacked; primary action button full-width on Mobile, fixed-width on Desktop.

## 10. Components Used
Input (email, password), Button (Primary — Sign In), Alert (inline error), Link (Forgot password / back to Sign In).

## 11. Tables
None.

## 12. Cards
None — form is presented directly, not inside a Card, to keep the screen minimal.

## 13. Forms
**Sign In:** email, password, Sign In button.
**Reset Request:** email, Send Reset Link button.

## 14. Buttons
Primary: Sign In / Send Reset Link. Secondary/Link: Forgot password, Back to Sign In.

## 15. Filters
None.

## 16. Search Experience
None.

## 17. Empty States
N/A — this module has no listable data.

## 18. Loading States
Button shows a loading indicator and disables itself during submission — prevents double-submit.

## 19. Error States
Generic "invalid credentials" (never field-specific, per Package 01 §19 security requirement); generic "unable to sign in right now" for backend/network failures.

## 20. Success States
Sign In → immediate redirect (no separate "success" screen). Reset Request → confirmation message, generic regardless of whether the email exists.

## 21. Responsive Behaviour
Form remains centered and single-column at every breakpoint — this screen does not reflow into multi-column at Desktop; simplicity is the point.

## 22. Accessibility Notes
Labels always visible (not placeholder-only); error messages associated with their field via ARIA; full keyboard operability (Tab order: email → password → submit).

## 23. Permissions
Public (unauthenticated) screens by definition.

## 24. UX Rules
Never reveal whether an email/account exists, at any step (Package 01 §15). Never auto-redirect away from an already-filled-in form on a transient error — preserve entered email so the user isn't forced to retype.

## 25. Future Improvements
Multi-factor authentication UI; "remember this device" option; Profile Management screen (flagged as a gap in User Flows doc 05, §11).

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification — Package 01, Design System (doc 02)
