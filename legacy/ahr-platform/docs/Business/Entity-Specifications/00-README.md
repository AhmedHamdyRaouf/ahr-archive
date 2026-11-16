# Entity Specifications

This folder synthesizes, per entity, the facts that were previously distributed across three separate Phase-4/Phase-6 documents and the Knowledge Foundation's content standards:

- **What it is & its responsibility** — from Phase 4, `Entity Catalog`.
- **What it relates to, and how** — from Phase 4, `Relationship Model` (mandatory vs. optional vs. many-to-many).
- **What a complete entry requires** — from the Knowledge Foundation's `06-content-standards.md`.
- **How it moves between states** — from Phase 4 `Data Lifecycle` and Phase 6 `Entity Lifecycles and State Transitions` (referenced, not restated in full — see `Domain Model/` and `Business Rules/`).

Nothing here overrides those source documents; this folder exists so that anyone working on a single entity type (e.g. building a CMS form for Award) has one page to read instead of four. Where this document and a source document ever appear to disagree, the source document in `Domain Model/` or `Business Rules/` is authoritative.

## Entities Catalogued

| Entity | Independent? | Mandatory Relationship |
|---|---|---|
| [Person](./01-Person.md) | Yes (no relationship required to exist) | — |
| [Organization](./02-Organization.md) | Yes (no relationship required to exist) | — |
| [Work](./03-Work.md) | No | ≥1 Contribution |
| [Project](./04-Project.md) | No | ≥1 Contribution |
| [Event](./05-Event.md) | No | ≥1 Contribution, a date, a place |
| [Contribution](./06-Contribution.md) | No | Person + (Work or Project or Event) |
| [Award](./07-Award.md) | No | Granting Organization |
| [Media](./08-Media.md) | No | Exactly one linking entity |
| [Press Mention](./09-Press-Mention.md) | No | ≥1 linked entity + publishing Organization |
| [Category](./10-Category.md) | No | At least one classified entity |
| [Tag](./11-Tag.md) | No | At least one tagged entity |

Per Entity Catalog's **No-Independence Rule**, only Person and Organization may exist without a mandatory link to another entity; every other entity requires at least one relationship to be valid.
