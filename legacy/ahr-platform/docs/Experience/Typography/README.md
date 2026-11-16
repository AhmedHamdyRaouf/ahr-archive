# AHR Platform v1 — Typography

**Status:** 🟢 Font families ratified 2026-07-21 — sourced directly from `ahmedhamdyraouf.com`'s live CSS. Closes Open Decision B10 for typography. See `docs/Program-Status/Decision-Log.md`.

## Purpose
Expands Design System/README.md §1 (Typography) into a dedicated reference for bilingual type behavior — the one area that needs more than a roles table, since Arabic and English typography do not behave identically even when sharing a scale.

## Ratified Font Families (source: live site CSS)
| Use | Family | Loaded Weights |
|---|---|---|
| **Display / Headings** (h1, large section titles, stat numbers, timeline years) | `'Playfair Display', serif` | Used at 800 weight on the live site for large display text |
| **Body / UI text** (paragraphs, nav, buttons, labels) | `'Readex Pro', sans-serif` (Google Fonts) | 300, 400, 500, 600, 700 |

`Readex Pro` already supports Arabic natively (it is a Google Fonts Arabic/Latin variable family), so the same body font can serve both scripts without a separate Arabic-only assignment — a genuine simplification versus the original "each script gets its own family" assumption. `Playfair Display` is Latin-only; **an Arabic-script display face still needs to be paired with it for Arabic headings** — this one pairing decision remains open (see below).

## Bilingual Typography Rules
1. **Shared scale, mixed-family display.** English headings use Playfair Display; Arabic headings need a complementary Arabic display face (not yet chosen — see Still Open) paired to the same size/weight scale. Body text in both languages uses Readex Pro, which already covers both scripts.
2. **Line-height accounts for script differences.** Arabic script requires more vertical breathing room at equivalent point sizes than Latin text; the line-height multiplier is defined per script, not shared as one flat number.
3. **Weight parity.** Readex Pro's 300–700 range gives enough headroom for the system's 3-weight cap (Regular 400 / Medium 500–600 / Bold 700) in both scripts.
4. **Numerals.** ✅ **Ratified 2026-07-21:** Eastern Arabic-Indic numerals (١٢٣...) in Arabic-locale contexts; Western (Hindu-Arabic) numerals (123...) in English-locale contexts. This is a deliberate choice by the data owner — it differs from the live site's own English-numerals-everywhere pattern, which was only ever a signal, not a binding constraint. Applies platform-wide: dates, counts, stat figures (e.g. "١٬٢٠٠ طفل" not "1,200 children" on Arabic pages), pagination, etc.

## Still Open
- **Arabic display/heading face to pair with Playfair Display** — the live site's Arabic pages were not fetched in this pass; recommend checking `ahmedhamdyraouf.com/home-ar/`'s CSS for a declared Arabic heading font before choosing one independently.

## What IS complete
- Full role list and hierarchy (Display → Label) — unchanged from Design System/README.md.
- Weight cap (max 3) — satisfied by Readex Pro's available weights.
- Both font families now literal, sourced from the live site rather than placeholder.

## Cross-References
- Roles table: `Design System/README.md` §1
- Token naming: `Design Tokens/README.md`

---

**Status:** 🟢 Font families and numeral system ratified 2026-07-21; only the Arabic display pairing remains open
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Data owner (2026-07-21, via explicit instruction to mirror the live site)
