# AHR Platform v1 — Accessibility

**Status:** 🟡 Working — pending review

Restates and applies Design System Foundations' Accessibility principles (Phase 7) concretely across every module.

## Contrast
Minimum contrast ratio applies to all text/background pairings on both Website and Dashboard — including inside Badges and Chips, which are easy to overlook since they're small.

## No Color-Only Signaling
Every status/verification Badge pairs color with a label or icon (Design System, doc 02) — never relies on color alone, across every module that uses status (CMS, Contacts & Organizations, Media Library, Dashboard).

## Screen Reader Support
- All images (public Website, Media Library) carry bilingual alt text sourced from actual caption data — never a generic filename-derived alt text.
- Dynamic count indicators (Moderation badge) are announced, not just visually rendered (Notifications UI, doc 15, §22).
- Tabs (CMS Work editor) announce which tab has a validation error, not just show a visual dot.

## Keyboard Operability
- Every interactive element (forms, filters, AI suggestion panel, moderation actions) must be reachable and operable via keyboard alone, in a logical order.
- Modals/Dialogs trap focus while open and return focus to the triggering element on close.

## Bilingual / RTL-LTR
- Arabic renders right-to-left, English left-to-right, on every screen that displays both — this is not limited to text direction; icon mirroring (e.g. "back" arrows) follows the current locale's direction.
- Form field order (label, input, helper text) is consistent in logical structure between the two directions, even though visual left/right flips.

## Focus States
Every interactive component (Design System, doc 02) has a visible focus state distinct from its hover state — critical for keyboard users navigating the dense Dashboard tables.

## Motion
Any transition/animation (status change confirmation, panel appearance) respects reduced-motion preferences where the underlying platform (Next.js/browser) supports detecting them.

## Module-Specific Notes
See each module UI document's own "Accessibility Notes" (§22) for specifics; this document is the cross-cutting reference they all point back to, not a replacement for them.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Design System Foundations (Phase 7), Design System (doc 02)
