# Entity Specification — Category

**Source lineage:** Entity Catalog, Relationship Model (Phase 4); Content Taxonomy (Phase 3).

## Description
A hierarchical classification.

## Responsibility
Organizes entities within a fixed parent/child structure (e.g. Work types: song, album, film; Project types: training, judging, initiative).

## Relationships
- **Work, Project** — as classified per Content Taxonomy.

## Content Standard
Category is a controlled classification list rather than freeform content — it inherits the entity-agnostic baseline in `06-content-standards.md` (bilingual name, recorded source, Owner) but has no independent "writing standard" of its own; its values are governed by `Governance/` decisions, not authored per-entry.

## Distinction from Tag
Category is hierarchical and closed (parent/child, a fixed list); Tag is flat, freeform, and open — see `11-Tag.md` and `Terminology/04-terminology-dictionary.md`.
