# Entity Specification — Person

**Source lineage:** Entity Catalog, Relationship Model (Phase 4); Content Standards §Artists/Persons; Identity Model (Phase 4).

## Description
Any individual within the AHR ecosystem, regardless of whether they hold a user account.

## Responsibility
Represents one unified individual identity, no matter how many roles that identity plays (composer, performer, judge, trainer, etc.). See `Domain Model/04 - Identity Model.md` and Terminology's distinction between Person, Identity, User, Role, and Profile.

## Relationships
- **Contribution** (direct) — and, through Contribution, transitively to Work, Project, and Event.
- **Award** — directly or via Contribution.
- **Media, Press** — as a linking/mentioned entity.

## Independence
Person is one of only two entities (with Organization) allowed to exist without a mandatory relationship to another entity (Entity Catalog's No-Independence Rule).

## Content Standard (What a Complete Entry Requires)
- **Required:** bilingual name (Arabic and English), a public identifier/slug.
- **Optional:** bilingual biography, name variants (alternate spellings/transliterations), a "featured" flag, linked Contributions/Awards/Media/Press.
- **Writing standard:** biographical text is factual and third-person — it documents career and role, not opinion about the person's talent or reputation.
- **Quality requirement:** never duplicated. Before creating a new Person, the existing Archive is checked for a matching Identity (per "One Identity, Multiple Roles").

## Lifecycle
Follows the standard Draft → Review → Verified → Published → Archived sequence defined in `Domain Model/05 - Data Lifecycle.md`, with transition authority defined in `Business Rules/03 - Entity Lifecycles and State Transitions.md`.
