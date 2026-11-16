# Wireframes — Notifications (Open Reports)

**Screens:** None — a single `ModerationBadge` in the Dashboard Top Bar, visible on every Dashboard screen, linking directly into the Moderation Queue (see `Dashboard Designs/README.md`).

## Composition
A small count badge (number + icon) in the Top Bar — no dropdown panel, no notification list, no per-item detail rendered here.

## Explicit Naming Rule
Labeled "Open Reports," not "Notifications," in all UI copy — a general notification system does not exist yet (schema gap, `Backlog.md`). Implying otherwise in copy would misrepresent the platform's actual capability to the Administrator.

## State Coverage Required
Zero (badge shows nothing or a visually quiet zero-state, never a distracting persistent "0") · Query failure (badge silently omits itself rather than showing a stale/wrong number).

## Cross-Reference
Full behavioral spec: original UI/UX Specification, Notifications UI. Flow: `User Flows/README.md` §9.
