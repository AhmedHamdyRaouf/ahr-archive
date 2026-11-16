# AHR Platform v1 — Website Designs

**Status:** 🟢 Carried forward and organized from original UI/UX Specification, Website UI — one open item flagged, not resolved by this audit

## Screens
Home, About, Works (list), Work Detail, Projects (list), Project Detail, Media, Recognition, Contact.

## Shell Composition
`SiteHeader` (sticky) → page content (12-column grid, constrained reading width for body text) → `SiteFooter`. Home: hero + featured Works/Recognition sections. List pages: filterable card grid (`EntityCard`). Detail pages: title block, bilingual body content, Contributions list, related Media gallery, contextual related-content section at the bottom.

## Components
`EntityCard`, `VerificationBadge`, `WorkDetailTemplate`, `ProjectDetailTemplate`, `LocaleSwitcher`, `SearchBar`.

## Open Item — Contact Page Mechanism (carried forward, unresolved)
The Packages Specification does not define a contact-form submission mechanism in V1. This defaults to displaying static contact information from `platform_settings` only, not a form with backend handling, unless clarified in a future round. Logged in `Backlog.md`.

## State Coverage Required
Empty (zero published items pre-launch → calm "nothing published yet," not an error) · Loading (lightweight skeleton for client-side content, never a spinner-only blank page) · Error (invalid/missing slug → localized 404; backend error → generic "something went wrong" page) · Success (N/A in confirmation sense — locale switching should feel instantaneous, no flash of untranslated content).

## Hard Rule
Never render Draft/Review/Restricted/Hidden content under any circumstance, including via direct URL guessing — enforced server-side, not just hidden in the UI.

## Cross-References
IA: `Information Architecture/README.md` · Navigation: same · Responsive behavior: `Responsive Designs/README.md` · Accessibility: `Accessibility Guidelines/README.md`

---
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
