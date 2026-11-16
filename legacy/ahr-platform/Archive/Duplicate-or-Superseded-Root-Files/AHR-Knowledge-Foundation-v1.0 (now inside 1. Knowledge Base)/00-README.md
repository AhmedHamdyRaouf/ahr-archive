# AHR Knowledge Foundation v1.0

**The single Source of Truth for the entire AHR ecosystem.**

## What This Is

This is not a technical manual. AHR Platform v1.0 (the software) was built, delivered, and approved across sixteen engineering milestones — that build is complete, frozen, and documented in its own release package (`AHR Platform v1 – Milestone 16 – Documentation & Release.zip`). This Knowledge Foundation is a different kind of artifact: it is the **business and knowledge layer** that sits above the software, was mostly written *before* any of it was built (Phases 0–9 of the Official Roadmap), and will outlive any particular technical implementation of it.

Every document here traces back to one of two sources:

1. **The original, locked Phase 0–9 planning corpus** — Vision Statement, Core Principles, Entity Catalog, Business Rules, AI Principles, Brand Architecture, UX Principles, and every other document authored and approved by Ahmed Hamdy Raouf before Phase 10 (Development) began. Where this Foundation states a rule, it cites the phase document that already established it — nothing here is invented from scratch.
2. **What Phase 10 (AHR Platform v1.0) actually built**, verified directly against the delivered codebase and its own documentation — so that where the software matches the original plan exactly, this Foundation says so, and where a real constraint forced a documented, approved deviation (e.g., V1's frozen schema not yet supporting a capability Phase 4–6 envisioned), this Foundation says that plainly too, rather than smoothing it over.

## Contents

| # | Document | Answers |
|---|---|---|
| 1 | [`01-business-bible.md`](./01-business-bible.md) | Why does AHR exist? What does it believe? What won't it compromise on? |
| 2 | [`02-domain-model.md`](./02-domain-model.md) | What are the business concepts (not tables) AHR is built from, and how do they relate? |
| 3 | [`03-business-rules.md`](./03-business-rules.md) | What governs publishing, verification, moderation, ownership, and AI use, and why? |
| 4 | [`04-terminology-dictionary.md`](./04-terminology-dictionary.md) | What does every important AHR term mean, precisely, and what must never be confused with what? |
| 5 | [`05-design-principles.md`](./05-design-principles.md) | How should AHR look, navigate, and read — independent of any specific visual execution? |
| 6 | [`06-content-standards.md`](./06-content-standards.md) | What does a complete, quality entry look like for each content type? |
| 7 | [`07-editorial-guidelines.md`](./07-editorial-guidelines.md) | How does AHR write — in Arabic, in English, and between the two? |
| 8 | [`08-governance.md`](./08-governance.md) | Who decides what, how is a decision locked, and how does this Foundation itself get maintained? |
| 9 | [`09-knowledge-architecture.md`](./09-knowledge-architecture.md) | How does knowledge move between the Archive, the CMS, the Website, AI, Search, and what comes next? |
| 10 | [`10-roadmap-alignment.md`](./10-roadmap-alignment.md) | How does everything above map onto what's built, what's next, and AHR Platform v2? |

## How to Use This Foundation

- **Before adding any new entity, field, page, AI workflow, or feature** — check `02-domain-model.md` and `03-business-rules.md` first. If it isn't traceable to a concept or rule here, it needs a governance decision (`08-governance.md`) before it becomes part of AHR, not after.
- **Before writing any content** — check `06-content-standards.md` and `07-editorial-guidelines.md`.
- **Before using a term** — check `04-terminology-dictionary.md`. AHR has precise, deliberately distinct vocabulary (Person vs. Identity vs. User vs. Role vs. Profile; Category vs. Tag; Verified vs. Self-Reported; Archived vs. Deleted); using the wrong one is not a stylistic slip, it is a governance error.
- **Before deciding what AI is allowed to do** — the single test in `01-business-bible.md`'s AI Philosophy and detailed in `03-business-rules.md` applies to every future AI capability, not just the ones that exist today.

## Relationship to the Platform v1.0 Release Package

The two packages are complementary, not overlapping:

| | Platform v1.0 Release (`docs/release-v1/`) | This Knowledge Foundation |
|---|---|---|
| Answers | *How was it built, and how do I operate it?* | *Why does it exist, and what must never contradict it?* |
| Audience | Developers, operators, administrators of the software | Anyone making a business, editorial, or product decision about AHR |
| Authority | Describes the delivered system faithfully | Describes the *intent* the system was built to serve |
| Changes when | The software changes (a new milestone, a bug fix) | The business itself evolves (rare, and only through `08-governance.md`'s process) |

Where the two ever appear to disagree, this Foundation is authoritative on *what AHR should mean and value*; the release package is authoritative on *what the current software actually does*. A disagreement between them is not a contradiction to hide — it is exactly the kind of gap `10-roadmap-alignment.md` and Version 2 planning exist to close.
