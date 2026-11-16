# AHR Editorial Guidelines

**Source lineage:** Brand Voice, Identity Principles, Naming System (Phase 2); Business Rules' Linguistic Equivalence Policy (Phase 6); UX Principles' bilingual parity principle (Phase 7). Translation principles are additionally verified against AHR Platform v1.0's actual AI translation prompts (`@ahr/ai`), which were themselves built to this same standard before this document existed in its current form.

---

## Tone of Voice

Four principles govern every AHR brand's voice, with variation only in warmth, never in accuracy or professionalism:

1. **Accuracy before marketing.** No exaggeration, no unverifiable promises, no excessive advertising language.
2. **Trust through clarification, not claim.** Persuasion is built on clarity about what is actually documented, not on repeating positive description.
3. **Warm professionalism.** Professional but never dry or bureaucratic — a human presence remains, especially in Personal Brand and Academy content.
4. **Consistency between the two languages.** Arabic and English carry the same level of accuracy and professionalism — never a literal translation that loses cultural nuance, and never a lighter tone in one language than the other.

### Voice by Brand

| Brand | Voice character |
|---|---|
| **AHR** (Master Brand) | Neutral, institutional — addresses every party without favoring one sub-brand. |
| **Personal Brand** | Closer and more personal, grounded in direct experience. |
| **AHR Academy** | Instructive and explanatory — explains without oversimplifying facts to the point of distortion. |
| **AHR Creative Network** | Collaborative — encourages trust and connection between members. |
| **AHR AI Platform** | Neutral and helpful — never takes a final position, never replaces a human voice. |

---

## Writing Style

- Lead with the most important fact (a title, a primary role) before secondary detail — mirroring Information Presentation's hierarchy principle.
- Prefer short, factual sentences for archive descriptions over long, ornamental ones.
- Never fill a documentation gap with a plausible-sounding assumption — an incomplete, accurate entry is always preferred (Accuracy Over Completeness).
- Never use promotional superlatives ("legendary," "iconic," "the best") unless directly and verifiably sourced as someone else's documented characterization, attributed as such — not asserted in AHR's own voice.

## Naming Conventions

1. **Mandatory prefix.** Every new Sub-Brand carries the "AHR" prefix in every official written use ("AHR Academy," "AHR Creative Network"), except the Foundational Personal Brand (Ahmed Hamdy Raouf), which is exempt per Brand Hierarchy.
2. **No bare generic names.** A generic name (Academy, Network, Studio) is never used alone without context connecting it to AHR in any official material.
3. **Mandatory bilingual naming.** Every official name has an approved, consistent Arabic and English equivalent — never translated differently across materials.
4. **No name reuse across components.** No Platform Component may share an internal name (a department, an internal tool) with any other public Sub-Brand's name, to avoid confusion.
5. **Sub-brand names follow their parent on first mention.** A brand subordinate to a Sub-Brand (e.g., Vocal Studio under Academy) is always cited alongside its parent's name at first mention in any material ("AHR Academy — Vocal Studio"), and may be shortened after that within the same material.
6. **No temporary name becomes official by accident.** Any name used during internal development or discussion ("V1," "Draft," "New Project") is never adopted as an official name without an explicit Brand Governance decision.

A proposed name is accepted only if it passes all three tests together: it doesn't conflict with any existing brand or component name; it has a clear, unambiguous Arabic and English equivalent; and it reflects the brand's actual role, not an exaggerated marketing promise.

## Arabic Guidelines

Arabic is a first-class, original version of every piece of content — never a translation of an English original, even when English was drafted first for convenience. Arabic biographical and descriptive text follows the same factual, third-person, non-promotional standard as English. Arabic typography and layout are considered independently (see `05-design-principles.md`'s Typography Philosophy), not as a mirrored afterthought of a Latin-script design.

## English Guidelines

The same standard applies in reverse: English is never treated as a secondary, "international" version of an Arabic original. Where a term has a specific, non-obvious meaning in AHR's vocabulary (see `04-terminology-dictionary.md`), the English text uses that exact term consistently, never a loose synonym that could blur the distinction (e.g., always "Archived," never "removed," when that is what is meant).

## Translation Principles

1. **Translate faithfully — never summarize, embellish, or omit.** A translation carries exactly what the source says, not an editorial improvement of it.
2. **Exact wording matters where it carries legal or factual weight** — a quoted commitment, a dated claim — and must not be paraphrased away.
3. **Both language versions are equally authoritative.** Neither is the "true" version that the other must defer to; a discrepancy between them is an error to fix, not something one version wins by default.
4. **AI-assisted translation is always a suggestion for human review** — per AI Philosophy, never auto-applied. This is exactly how AHR Platform v1.0's `translate_field` AI task was built: a one-shot suggestion returned to a human, saved only if a human accepts it.

## SEO Writing Rules

- Every page and entity's title leads with its most identifying, specific fact (a Work's actual title, a Person's actual name) — never a generic template phrase.
- Descriptions written for public pages serve the human reader first; search-engine optimization is a byproduct of clarity and accuracy, never a reason to pad text with keywords that don't serve the reader.
- Bilingual SEO metadata (canonical URLs, alternate-language links) is treated with the same parity as bilingual content itself — neither language's search presence is secondary.

## Internal Linking Philosophy

Content is linked by genuine relationship (a Work links to its actual Contributions, its actual linked Media), never by artificial cross-promotion. A link exists because the Domain Model already defines that relationship — internal linking follows the data model, it does not invent connections the data doesn't actually have. Related-content suggestions (a future recommendation feature) must still satisfy the AI Decision Boundaries test: they are a presentation-layer convenience, never a claim of a relationship that isn't actually documented.
