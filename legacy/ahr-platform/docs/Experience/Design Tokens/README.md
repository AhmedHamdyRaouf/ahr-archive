# AHR Platform v1 — Design Tokens

**Status:** 🟢 Literal values ratified 2026-07-21, sourced from `ahmedhamdyraouf.com`'s live CSS. Closes Open Decision B10 for tokens. See `Color System/README.md`, `Typography/README.md`, and `docs/Program-Status/Decision-Log.md`.

## Purpose
Design Tokens are the naming layer between the Design System's *roles* (Design System/README.md §1–6) and implementation. This file now carries literal values alongside the naming grammar.

## Token Values

```
color.primary.default         = #c7a86b
color.primary.hover           = #d6b57a
color.background.base         = #050505
color.background.surface      = #0d0d0d
color.background.elevated     = #111111
color.background.deepest      = #000000
color.neutral.text.body       = #ffffff
color.neutral.text.muted      = #bbbbbb
color.neutral.text.subtle     = #888888 / #666666 / #555555
color.accent.whatsapp         = #25D366 (hover #1ebe5d) — CTA-specific, not a semantic role
color.success.default         = TBD — inferred mapping proposed in Color System/README.md, needs quick sign-off (site has no Dashboard UI to source this from)
color.warning.default         = TBD — same as above
color.danger.default          = TBD — same as above
color.info.default            = TBD — same as above

typography.display.family     = 'Playfair Display', serif (Latin) — Arabic pairing still open, see Typography/README.md
typography.body.family        = 'Readex Pro', sans-serif (covers Latin + Arabic natively)
typography.weights            = 400 (regular) / 600 (medium) / 700 (bold) — within Readex Pro's loaded 300–700 range

space.1x / space.2x / space.3x / space.4x / space.6x / space.8x / space.12x
      = single base unit × multiplier (base unit value: not directly recoverable from the live site's CSS pixel values without a full layout audit — recommend 8px as a standard base unit; not yet confirmed against the site pixel-for-pixel)

radius.none / radius.small / radius.medium / radius.full
elevation.flat / elevation.low / elevation.medium / elevation.high
```

## What Changed From the Prior "TBD — B10" Version
Every color and font-family token now has a literal value read directly from the live site's CSS (`content/Master-Content-Dataset/12-Source-Files/Website-Archive/Legacy-Website-Build/assets/css/site-additional.css`) rather than being deferred. The four semantic status colors (Success/Warning/Danger/Info) and the base spacing unit remain open, since the public marketing site has no Dashboard-style UI to source them from — see Color System/README.md's recommendation and Still Open section.

## Cross-References
- Roles: `Design System/README.md`
- Color rationale: `Color System/README.md`
- Type rationale: `Typography/README.md`

---

**Status:** 🟢 Color + font tokens ratified 2026-07-21; status colors and base spacing unit still open
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Data owner (2026-07-21, via explicit instruction to mirror the live site)
