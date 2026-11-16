# Wireframes — Authentication

**Screens:** Sign In (`/{locale}/login`), Password Reset Request (`/{locale}/login/reset`)

## Composition
Centered single-column form on a minimal background — no `SiteHeader`/`Sidebar` chrome. The one screen in the platform belonging to neither the public Website register nor the Dashboard register; deliberately neutral. Logo/site name (from `platform_settings`, pending Brand Identity B10) sits above the form; fields stacked; primary action full-width on Mobile, fixed-width on Desktop.

## Region Map
```
┌───────────────────────────┐
│        [Logo/Name]        │
│                            │
│   [Email input]            │
│   [Password input]         │  ← Sign In only
│   [Alert — inline error]   │  ← appears on failure only
│   [Primary button]         │
│   [Secondary link]         │  → Forgot password / Back to Sign In
└───────────────────────────┘
```

## Components (from Components Library/README.md)
Input (email, password), Button (Primary), Alert (inline error), Link.

## State Coverage Required
Default · Focus (per field) · Loading (button disables + shows loading indicator) · Error (generic "invalid credentials" or "unable to sign in right now" — never field-specific, security requirement) · Success (immediate redirect, no separate success screen for Sign In; generic confirmation message for Reset Request).

## Cross-Reference
Full behavioral spec: original UI/UX Specification, Authentication UI. Flow: `User Flows/README.md` §1–3. Known gap: Profile Management has no screen (`User Flows/README.md` §11).
