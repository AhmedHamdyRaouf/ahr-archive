# AHR Platform v1 — Accessibility Guidelines

**Status:** 🟢 Carried forward from original UI/UX Specification, Accessibility — unchanged in substance, reorganized for this folder

## Contrast
Minimum contrast ratio applies to all text/background pairings on both Website and Dashboard — including inside Badges and Chips, which are easy to overlook since they're small. See `Color System/README.md` → Validation Checklist for what must be checked once B10 resolves.

## No Color-Only Signaling
Every status/verification Badge pairs color with a label or icon — never relies on color alone, across every module that uses status.

## Screen Reader Support
- All images carry bilingual alt text sourced from actual caption data — never a generic filename-derived alt text.
- Dynamic count indicators (Open Reports badge) are announced, not just visually rendered.
- Tabs (CMS Work editor) announce which tab has a validation error, not just show a visual dot.

## Keyboard Operability
Every interactive element must be reachable and operable via keyboard alone, in a logical order. Modals/Dialogs trap focus while open and return focus to the triggering element on close.

## Bilingual / RTL-LTR
Arabic renders right-to-left, English left-to-right, on every screen that displays both — including icon mirroring (see `Icons & Assets/README.md`), not just text direction. Form field order (label, input, helper text) is consistent in logical structure between the two directions, even though visual left/right flips.

## Focus States
Every interactive component has a visible focus state distinct from its hover state — critical for keyboard users navigating the dense Dashboard tables.

## Motion
Any transition/animation respects reduced-motion preferences — see `Interaction & Motion Guidelines/README.md` for the full interaction-level treatment of this rule.

## Module-Specific Notes
Distributed across `Wireframes/` files' "State Coverage Required" sections rather than repeated here a second time.

---

**Status:** 🟢 Complete, carried forward
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
