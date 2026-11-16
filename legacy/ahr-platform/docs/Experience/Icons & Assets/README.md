# AHR Platform v1 — Icons & Assets

**Status:** 🟢 Icon library ratified 2026-07-21 — see `docs/Program-Status/Decision-Log.md` (C4)

## Ratified Icon Library: `lucide-react`
The data owner delegated this choice (2026-07-21). **lucide-react** is selected because it satisfies the Design System §7 rule exactly as-is — every icon in the set is line-based with a single, consistent stroke weight by default (no filled/solid variant to accidentally mix in), it's MIT-licensed, actively maintained, tree-shakeable (only used icons ship in the bundle), and has no dependency conflicts with this project's React 18 / Next.js 14 stack. Added to `apps/web/package.json`.

**Usage rule:** import icons individually (`import { Pencil, Trash2 } from "lucide-react"`), never the whole library, to keep bundle size minimal. Default stroke width (2) is used everywhere — never mix in a bolder or thinner variant on the same screen.

## Icon Language (carried forward from Design System/README.md §7)
One consistent icon set/style — line-based, single stroke weight — used identically across Website and Dashboard. Icons never stand alone for a critical action without a text label in the Dashboard; icon-only is acceptable only for universally understood, low-stakes actions.

## RTL/LTR Icon Behavior (carried forward, consistent with Accessibility Guidelines/)
Directional icons (back/forward arrows, chevrons, breadcrumb separators) must mirror automatically based on the active locale's reading direction — an icon that means "back" in English must visually point the opposite way in Arabic, not stay fixed.

## Media Assets
All non-icon imagery on the platform is user-generated content flowing through the Media Library module — there is no separate "stock" or "marketing" asset library in v1.0 scope. See Wireframes/Media Library.md for the upload/caption/lifecycle experience.

---

**Status:** 🟢 Ratified 2026-07-21
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Data owner (2026-07-21, delegated the specific choice)
