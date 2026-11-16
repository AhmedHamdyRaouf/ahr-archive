# AHR Platform v1 — Brand Identity

**Status:** 🟢 Ratified 2026-07-21 — the data owner instructed this to mirror `ahmedhamdyraouf.com` directly, and has since confirmed the logo decision below. Closes Open Decision B10. See `Color System/README.md`, `Typography/README.md`, `Design Tokens/README.md`, and `docs/Program-Status/Decision-Log.md`.

## What Exists Today
- **Color palette:** ratified — gold `#c7a86b` / `#d6b57a` on a near-black `#050505`/`#0d0d0d`/`#111111`/`#000000` base, white/grey text scale. See Color System/README.md for the full table.
- **Typography:** ratified for body/UI (`'Readex Pro'`, covers Latin + Arabic) and Latin display (`'Playfair Display'`). Arabic display face still needs pairing — see Typography/README.md.
- **Logo:** ✅ **confirmed 2026-07-21 by the data owner** — the platform's logo is the site/product name rendered as styled text (matching the live site's own nav pattern: `.logo span { color: #c7a86b; }`, the name in Primary gold), used **as-is until a professional logo is commissioned**. This is not a placeholder or a gap — it is the deliberate, approved interim identity. No SVG/PNG mark needs to be sourced or requested; a future professional logo replaces this same slot when one exists.
- **Numeral system:** ✅ ratified 2026-07-21 — Eastern Arabic-Indic numerals (١٢٣) on Arabic-locale pages, Western numerals (123) on English-locale pages. See Typography/README.md rule 4.

## Logo Usage Rules (text wordmark, current)
1. **Rendering:** the platform name, set in the Display typeface (`Playfair Display` for Latin), with the accent portion in Primary gold (`#c7a86b`) — mirrors `.logo span` on the live site.
2. **Minimum clear space / minimum size:** standard text-legibility rules apply (no smaller than the platform's Label type-scale role); no separate icon/mark clear-space rule is needed since there is no separate mark.
3. **Acceptable backgrounds:** designed for the ratified dark background (`#050505`/`#0d0d0d`); if a light-background context is ever needed (e.g. a printed document), the gold accent should be checked for contrast against white before reuse.
4. **Current UI appearance rule (unchanged, already approved):** "Logo/site name from `platform_settings` above form" (Authentication UI spec) — this is exactly the styled-text wordmark described above; `platform_settings.branding_assets.logoUrl` stays empty until a professional logo file replaces it (see the Settings editor, `apps/web/lib/settings-shapes.ts`).
5. **When a professional logo is commissioned:** it replaces the text wordmark in the same UI slot; update `branding_assets.logoUrl` and re-run this document's ratification note — no other document needs to change, since every rule above already anticipates this being interim.

## Master Brand vs. Sub-Brand
Design System/README.md §2 already anticipates a Secondary color role for sub-brand differentiation (e.g. the "Dandana" project, which the live site treats as a distinct sub-identity within the same page). No second color was found for Dandana specifically on the site — it uses the same gold/black system with different copy — so no separate sub-brand palette is introduced here; Dandana is treated as a Master Brand sub-section, not a second visual identity, unless a business decision says otherwise.

## Voice and Tone (unchanged, already approved)
Website is "credible, editorial, warm-professional"; Dashboard is "direct, efficient, no marketing language" — carried forward from UX Guidelines, not affected by this ratification.

## Still Open
- Arabic display typeface pairing (Typography/README.md).

---

**Status:** 🟢 Fully ratified 2026-07-21 (palette, typography, numerals, and logo approach) — only the Arabic display typeface pairing remains open
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Data owner (2026-07-21)
