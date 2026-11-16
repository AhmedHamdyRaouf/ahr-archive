# AHR Platform v1 — Color System

**Status:** 🟢 Palette ratified 2026-07-21 — literal values sourced directly from `ahmedhamdyraouf.com`'s live CSS at the data owner's explicit request ("الهوية البصرية طلعها انت عايزها زي الموقع الالكتروني بتاعي" / "brand identity — pull it yourself, I want it like my website"). Closes Open Decision B10 for color. See `docs/Program-Status/Decision-Log.md` and `content/Master-Content-Dataset/13-Validation/External-Verification-Addendum-2026-07-21.md`.

## Purpose
Expands Design System/README.md §2 (Colors) into a dedicated reference, mapping the Design System's roles onto the literal palette actually used on the live site (`content/Master-Content-Dataset/12-Source-Files/Website-Archive/Legacy-Website-Build/assets/css/site-additional.css`).

## Ratified Palette (source: live site CSS, occurrence count in parentheses)

| Role | Hex | Usage on the live site |
|---|---|---|
| **Primary** | `#c7a86b` (40 occurrences — the dominant brand color) | Logo accent span, nav link hover, section highlights, stat numbers, timeline years |
| **Primary — hover/lighter** | `#d6b57a` (4) | Button/link hover state, dropdown item hover |
| **Background — base** | `#050505` (6) | Page background (site is dark-themed throughout) |
| **Background — surface** | `#0d0d0d` (5) | Cards, raised panels |
| **Background — elevated/nav** | `#111111` (9) | Nav dropdown, secondary panels |
| **Background — deepest** | `#000000` (8) | Highest-contrast panels, overlays |
| **Neutral — text (primary)** | `#ffffff` (17) | Body text, headings on dark background |
| **Neutral — text (muted)** | `#bbbbbb` (9) | Secondary text, descriptions |
| **Neutral — text (subtle)** | `#888888` / `#666666` / `#555555` (5/5/2) | Tertiary text, captions, disabled states |
| **Accent — WhatsApp CTA** | `#25D366`, hover `#1ebe5d` (1 each) | WhatsApp contact button only — not a general semantic color |

## What Remains Genuinely Open
The public site has no Dashboard, no verification badges, and no moderation states — so it gives no direct evidence for the platform's **Success / Warning / Danger / Info** semantic roles (these only exist in the Administrator Dashboard, which the site doesn't have). Recommendation: derive these from the ratified palette's warm/cool balance (e.g., a green consistent with — but distinct from — the WhatsApp accent for Success; a warm amber for Warning; a clear red for Danger; a neutral blue-grey for Info) rather than inventing unrelated colors — but this specific mapping should still get a quick sign-off before implementation, since it is new work this addendum is inferring, not a value read directly off the site.

## Usage Rules
1. **Never color-only signaling.** Every status/verification use of color is paired with a label or icon (Accessibility Guidelines/).
2. **One Neutral scale, many uses.** Text, backgrounds, and borders all draw from the same Neutral scale rather than introducing separate greys per module — this is what keeps Website and Dashboard visually unified despite their different registers (Design Principles §7).
3. **Semantic roles are not module-specific.** "Success" green (once defined) means the same thing in CMS status badges, Media Library badges, and Contacts & Organizations badges — never a different green per module.
4. **Contrast is validated per pairing, not assumed from a swatch.** Every text/background and icon/background pairing must be checked against WCAG AA contrast minimums — including inside small components like Badges and Chips. Note: `#888888`/`#666666` text on the `#050505`/`#0d0d0d` backgrounds is borderline for body text at small sizes on the live site itself — carry this forward as a known contrast risk to re-check when the Dashboard (a lighter, denser UI than the marketing site) adopts this palette.

## Validation Checklist (run before implementation)
- [ ] Every role has a value for both light-content and dark-content contexts it will appear in.
- [ ] Success/Warning/Danger/Info (once mapped per the recommendation above) remain distinguishable from each other for common color-vision deficiencies.
- [ ] Arabic and English text on every color pairing meets the same contrast minimum.
- [ ] Re-verify the `#888`/`#666` muted-text contrast against WCAG AA before reusing it verbatim in the Dashboard's denser layouts.

## Cross-References
- Roles table: `Design System/README.md` §2
- Token naming: `Design Tokens/README.md`
- Accessibility rules: `Accessibility Guidelines/README.md`

---

**Status:** 🟢 Ratified 2026-07-21 — see Decision Log
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Data owner (2026-07-21, via explicit instruction to mirror the live site)
