# AHR Platform v1 — Interaction & Motion Guidelines

**Status:** 🟡 New deliverable — synthesized from existing, approved cues in Design System and Accessibility (elevation, reduced-motion) rather than invented from scratch

## Purpose
No dedicated motion specification existed before this audit. Rather than inventing arbitrary animation choices (which would be a creative decision beyond this audit's authority, similar in kind to B10), this document assembles the motion-relevant rules that already exist, scattered across Design System (elevation) and Accessibility (reduced-motion), into one place, and adds only the connective interaction logic needed to make them consistent.

## What Is Already Approved (carried forward, not invented)
- **Elevation communicates layering, not decoration** (Design System/README.md §6) — a modal's "high" elevation and a dropdown's "medium" elevation should feel like the interaction system, not surface styling.
- **Reduced-motion respect** (Accessibility Guidelines/README.md) — any transition/animation respects reduced-motion preferences where the platform can detect them.
- **Loading feedback conventions** (User Flows/README.md, UX Conventions) — skeleton placeholders for content loads; buttons show their own loading state.

## New Interaction Logic Added by This Audit (consistent with, not contradicting, the above)
1. **Status transitions animate the badge, not the whole row/card** — when a status changes (e.g. Draft → Review), only the Badge component transitions (a brief color/label change), so the Administrator's attention is drawn to exactly what changed, consistent with "trust through visible verification" (Design Principles §2).
2. **AI Suggestion Panel enters, never appears instantly** — a brief, reduced-motion-respecting entrance (e.g. slide/fade beneath the field) reinforces that it is new, dismissible content, not part of the form that was already there (Design Principles §4).
3. **Toasts enter from a consistent, single screen position** and auto-dismiss on a fixed timer, except error-adjacent Toasts, which do not exist — errors requiring action use Alerts instead (already an existing rule, UX Guidelines/User Flows).
4. **Dialogs trap and restore focus** (already an Accessibility Guidelines rule) — the motion pairing is: Dialog fades/scales in over its overlay, and this same treatment must not be skipped for reduced-motion users — content is instant, not literally absent, so it remains usable via keyboard.
5. **Directional motion mirrors locale** — any left/right slide (e.g. a Drawer opening) must reverse direction in RTL, matching the existing icon-mirroring rule in `Icons & Assets/README.md`.

## Explicit Non-Decisions
This document does not specify exact durations, easing curves, or a motion library — those are literal values in the same category as B10 (Design System's typography/color values) and are left for Development/implementation once a design tool is in use. Specifying a duration in milliseconds here would exceed a text-based Experience & Design specification's proper scope.

---

**Status:** 🟡 Motion *logic* 100% complete; literal timing/easing values are an implementation-phase decision, correctly left open
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
