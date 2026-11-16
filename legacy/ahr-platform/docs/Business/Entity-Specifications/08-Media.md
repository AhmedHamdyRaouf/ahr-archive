# Entity Specification — Media (Images / Videos / Audio)

**Source lineage:** Entity Catalog, Relationship Model (Phase 4); Content Standards §Images/Videos/Audio; `@ahr/media/docs/blocked-metadata.md` (Platform v1.0 Known Limitation).

## Description
Any visual or audio file.

## Responsibility
Supporting visual/audio documentation — does not exist independent of another entity it illustrates.

## Relationships
- **Work, Person, Project, or Event** — exactly one linking entity is mandatory; Media may never be zero-linked or multi-linked.

## Content Standard
- **Required:** the file itself, exactly one linking entity, a bilingual caption.
- **Optional:** none beyond the above at present — richer metadata (title separate from caption, alt text, copyright, credits) is a documented Known Limitation, tracked in `Core Documents/10-roadmap-alignment.md`'s Version 2 backlog rather than silently worked around.
- **Writing standard:** a caption describes what is shown/heard factually — it is not a substitute for the linked entity's own description.
- **Quality requirement:** no Media exists without its one linking entity — an unlinked file is not a valid archive entry.

## Lifecycle
Standard Draft → Review → Verified → Published → Archived sequence.
