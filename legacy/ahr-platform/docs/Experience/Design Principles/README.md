# AHR Platform v1 — Design Principles

**Status:** 🟢 Consolidated — merges two prior sources into one authoritative document
**Source documents merged:** `06 - UI & UX/.../01 - Design Principles.md` (UI/UX Specification) + `AHR-Knowledge-Foundation-v1.0/05-design-principles.md` (Knowledge Foundation)
**Merge rule applied:** no principle was altered in meaning; only duplicated wording across the two sources was unified. Where the Knowledge Foundation stated a principle at the business/brand level and the UI/UX Specification restated it as UI-actionable guidance, both are kept together under one heading so intent and application are never separated.

## Table of Contents
1. Clarity before beauty
2. Trust through visible verification
3. Bilingual parity, not translation-as-afterthought
4. AI is visibly a suggestion, never a fait accompli
5. Minimal friction on trust-critical steps, not on every step
6. Consistency over novelty
7. Public and Admin are different registers, same system
8. Empty and loading states are designed, not default

---

## 1. Clarity before beauty
Every screen is judged first by whether a first-time user understands it, before it is judged on visual polish. This applies equally to the public Website and the internal Dashboard. Clarity is not the absence of visual craft — it is the priority order craft is applied in.

## 2. Trust through visible verification
Verification status (`verification_status`) and lifecycle status (`status`) are never hidden information — they are always visible at a glance, using consistent visual language (badges, not tooltips-only), on both public and admin surfaces. This is the platform's single most-repeated rule because AHR's credibility as an archive depends on it.

## 3. Bilingual parity, not translation-as-afterthought
Arabic and English are two first-class experiences of the same product, not a primary language and a translated copy. No screen, component, or flow ships in one language before the other. Layout, spacing, and iconography must work correctly in both RTL and LTR without one direction being the "default" that the other is patched onto.

## 4. AI is visibly a suggestion, never a fait accompli
Anywhere AI output appears (Package 06), it is visually distinct from human-authored or already-published content — a suggestion panel, never inline as if already accepted. This principle is enforced at the component level (see Design System → Components → AI-related), not left to per-screen judgment.

## 5. Minimal friction on trust-critical steps, not on every step
Verification and moderation steps (Package 05/07) are not disguised as lightweight actions — they are deliberately visible and require explicit confirmation. Everyday content editing (drafting, tagging) is kept low-friction. The platform does not apply the same friction uniformly; it applies friction where the underlying business rule requires deliberateness (Business Rules, Knowledge Foundation §03).

## 6. Consistency over novelty
The same status, the same kind of action, and the same kind of data looks the same everywhere it appears — a Work status badge and a Project status badge use identical visual language, not module-specific variants. A new pattern is a signal to update the Design System first, never a reason to introduce a one-off exception silently.

## 7. Public and Admin are different registers, same system
The public Website reads as an editorial, credible archive. The Dashboard reads as an efficient, information-dense working tool. Both draw from the same Design System — they differ in density and tone, not in underlying components.

## 8. Empty and loading states are designed, not default
No screen ships with a blank white area as its only "no data yet" or "loading" treatment. Every list, grid, and table has a designed empty state and a designed loading state, specified per module.

---

**Status:** 🟢 Consolidated, approved-carry-forward (no content invented or removed)
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending Master Roadmap sign-off
**Dependencies:** Knowledge Foundation §05, UI/UX Specification Doc 01, Identity Principles
**Cross-references:** Design System/, UX Guidelines (folded into User Flows/README.md UX Conventions section)
