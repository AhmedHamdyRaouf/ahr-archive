# Entity Specification — Contribution

**Source lineage:** Entity Catalog, Relationship Model (Phase 4).

## Description
The precise linking entity between a Person and a Work, Project, or Event.

## Responsibility
Describes the nature of a specific person's contribution to a specific work or activity (composer, performer, director, trainer, etc.). Contribution cannot exist without a Person, and cannot exist without at least one of Work / Project / Event.

## Relationships (both mandatory)
- **Person** — mandatory.
- **Work, Project, or Event** — at least one of these three is mandatory.

## Content Standard
Contribution is a relationship/junction entity rather than a standalone content type in `06-content-standards.md`; its required data is the role/nature of contribution plus the two mandatory links above. It does not carry its own bilingual description, verification status, or publication lifecycle independent of the entity it documents — see `Domain Model/03 - Relationship Model.md`.

## Governance Note
Because Contribution is the load-bearing link across nearly every other entity (Work, Project, Event, Award all resolve to Person through it), any change to how Contribution is modeled requires review under `Governance/08-governance.md` before implementation.
