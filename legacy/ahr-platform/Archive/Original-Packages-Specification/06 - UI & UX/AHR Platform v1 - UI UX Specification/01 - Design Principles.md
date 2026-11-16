# AHR Platform v1 — Design Principles

**Status:** 🟡 Working — pending review

These principles govern every screen in every module. They restate and make UI-actionable the principles already frozen in UX Principles (Phase 7) and Identity Principles (Phase 2) — they do not introduce new ones.

## 1. Clarity before beauty
Every screen is judged first by whether a first-time user understands it, before it is judged on visual polish. This applies equally to the public Website and the internal Dashboard.

## 2. Trust through visible verification
Verification status (`verification_status`) and lifecycle status (`status`) are never hidden information — they are always visible at a glance, using consistent visual language (badges, not tooltips-only), on both public and admin surfaces.

## 3. Bilingual parity, not translation-as-afterthought
Arabic and English are two first-class experiences of the same product, not a primary language and a translated copy. No screen, component, or flow ships in one language before the other.

## 4. AI is visibly a suggestion, never a fait accompli
Anywhere AI output appears (Package 06), it is visually distinct from human-authored or already-published content — a suggestion panel, never inline as if already accepted.

## 5. Minimal friction on trust-critical steps, not on every step
Verification and moderation steps (Package 05/07) are not disguised as lightweight actions — they are deliberately visible and require explicit confirmation. Everyday content editing (drafting, tagging) is kept low-friction. The platform does not apply the same friction uniformly; it applies friction where the underlying business rule requires deliberateness (Business Rules, Phase 6).

## 6. Consistency over novelty
The same status, the same kind of action, and the same kind of data looks the same everywhere it appears — a Work status badge and a Project status badge use identical visual language, not module-specific variants.

## 7. Public and Admin are different registers, same system
The public Website (Package 03) reads as an editorial, credible archive. The Dashboard (Package 07) reads as an efficient, information-dense working tool. Both draw from the same Design System (02) — they differ in density and tone, not in underlying components.

## 8. Empty and loading states are designed, not default
No screen ships with a blank white area as its only "no data yet" or "loading" treatment — see each module's Empty/Loading/Error/Success State sections.

---

**Status:** 🟡 Working
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** UX Principles, Design System Foundations (Phase 7); Identity Principles (Phase 2)
