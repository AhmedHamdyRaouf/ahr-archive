# Entity Specification — Organization

**Source lineage:** Entity Catalog, Relationship Model (Phase 4); Content Standards §Organizations.

## Description
Any institution or official body connected to AHR content.

## Responsibility
Represents external entities (institutions, channels, judging bodies) that connect to Works, Awards, or Projects.

## Relationships
- **Award** — as the granting body.
- **Project** — as sponsor (optional).
- **Event** — as organizer.
- **Media** — as owner (added 2026-07-21, Decision Log item E5) — an Organization can now own a `media_asset` directly (e.g. a logo, a building photo), alongside Work/Person/Project/Event.
- **Category / Tag** — added 2026-07-21 (Decision Log item E5) — `organization_category`/`organization_tag` join tables, same shape as Work's and Project's. Category rows with `domain = 'organization_type'` are a content-population task, not yet populated by this schema change alone.

## Independence
Organization is one of only two entities (with Person) allowed to exist without a mandatory relationship to another entity.

## Content Standard
- **Required:** bilingual name, a public identifier/slug.
- **Optional:** bilingual description, linked Awards/Projects/Events, linked Media (2026-07-21), Category/Tag assignment (2026-07-21), `contact_information` (2026-07-21 — open-ended: email/phone/address/website as applicable), `internal_notes` (2026-07-21 — Dashboard-only, never shown on the public Website).
- **Writing standard:** factual institutional description — what the organization is and its documented connection to the Archive's content, not a promotional profile of the institution itself.
- **Quality requirement:** an Organization entry exists only because it is genuinely connected to documented Archive content — not added speculatively.

## Lifecycle
Standard Draft → Review → Verified → Published → Archived sequence (see `Domain Model/05 - Data Lifecycle.md`).
