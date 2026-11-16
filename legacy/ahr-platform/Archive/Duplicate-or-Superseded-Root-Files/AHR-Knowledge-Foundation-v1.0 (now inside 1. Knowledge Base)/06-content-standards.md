# AHR Content Standards

**Source lineage:** Entity Catalog, Metadata Model, Data Integrity Rules (Phase 4); Content Architecture, Content Taxonomy (Phase 3); Publication Rules, Verification Logic (Phase 6). Field-level specificity below is cross-checked against what AHR Platform v1.0 actually built (`@ahr/content`'s entity definitions), so these standards are enforceable today, not aspirational.

---

## Standards That Apply to Every Content Type

Regardless of entity type, every entry must have:

- **A bilingual name/title** (Arabic and English) — per Linguistic Equivalence Policy, neither is a secondary translation.
- **A recorded source** — where the information came from (an archive document, a verified external source, direct confirmation, manual entry). No entry with an unrecorded source may leave Draft.
- **A determined Owner** before publication (per Ownership Rules) — accountability, not authorship.
- **A Verification Status** appropriate to its evidence (Verified / Self-Reported / Under Review) — never defaulted to Verified without the evidence Verification Logic requires.
- **At least the minimum mandatory relationships** its entity type requires (see the Domain Model) before it may leave Draft for Review.

---

## Works

**Required:** bilingual title, work type (Category — e.g., song, album, theatrical piece, TV series, film, film score, arrangement, choir, live concert), at least one linked Contribution.
**Optional:** bilingual description, Tags, linked Media, linked Press, linked parent Work (for a compound work made of smaller ones), a public identifier/slug.
**Writing standard:** a concise, factual, dignified description — no promotional language, no unverifiable claims. Two to three sentences is typically sufficient; length is never a proxy for quality.
**Metadata:** status, visibility, verification status, source, owner — same as every entity.
**Quality requirement:** never published without a Contribution — an "orphan" Work with no documented contributor is not a complete archive entry, regardless of how complete its other fields are.

## Artists / Persons

**Required:** bilingual name, a public identifier/slug.
**Optional:** bilingual biography, name variants (alternate spellings/transliterations), a "featured" flag, linked Contributions, Awards, Media, Press.
**Writing standard:** biographical text is factual and third-person; it documents career and role, not opinion about the person's talent or reputation.
**Quality requirement:** never duplicated — before creating a new Person, the existing Archive is checked for a matching Identity (per One Identity, Multiple Roles).

## Organizations

**Required:** bilingual name, a public identifier/slug.
**Optional:** bilingual description, linked Awards/Projects/Events.
**Writing standard:** factual institutional description — what the organization is and its documented connection to the Archive's content, not a promotional profile of the institution itself.
**Quality requirement:** an Organization entry exists only because it is genuinely connected to documented Archive content (an award grantor, an event organizer, a project sponsor) — not added speculatively.

## Projects

**Required:** bilingual title, project type (Category — e.g., training, judging, cultural activity, educational activity, choir management, initiative), at least one linked Contribution.
**Optional:** bilingual description, linked Organization (if sponsored), Tags, linked Media.
**Writing standard:** same factual, concise standard as Works — a Project's description explains what the activity is and its documented timeframe, not its impact in subjective terms.
**Quality requirement:** same "no orphan" rule as Works — a Project needs at least one documented participant via Contribution.

## Events

**Required:** bilingual title, a specific date, a specific place, at least one linked Contribution.
**Optional:** bilingual description, linked Organization, linked Media.
**Writing standard:** factual — what happened, when, where, and who documented-ly participated.
**Quality requirement:** an Event without a fixed date and place is not a complete Event entry — this is what distinguishes it conceptually from a Project.

## Images / Videos / Audio (Media)

**Required:** the file itself, exactly one linking entity (a Work, Person, Project, or Event — never zero, never more than one), a bilingual caption.
**Optional:** none beyond the above at present — richer metadata (title separate from caption, alt text, copyright, credits) is a documented Known Limitation (see the Platform v1.0 release, `@ahr/media/docs/blocked-metadata.md`), tracked in `10-roadmap-alignment.md`'s Version 2 backlog, not silently worked around.
**Writing standard:** a caption describes what is shown/heard factually — it is not a substitute for the linked entity's own description.
**Quality requirement:** no Media exists without its one linking entity — an unlinked file is not a valid archive entry.

## Documents

**Not currently a supported content type.** AHR Platform v1.0's Media entity is constrained to image, audio, and video — a general "document" type was considered and explicitly not built in V1 (see `@ahr/media/docs/blocked-metadata.md`). Until this is revisited through Governance, any document-type source (a contract, a certificate) is retained as the underlying *evidence* for Verification, not entered as a standalone content entity.

## References / Sources

Every entity's `Source` metadata field records where its information came from — this is the reference. AHR does not maintain a separate, independent "Reference" or "Citation" entity type; a reference is always an attribute of the entity it supports, consistent with Entity Catalog's "No Independence Rule" (every entity relates to at least one other; a bare, unattached citation would violate that).

## Press / Press Mentions

**Required:** at least one linked entity (Person, Work, Event, or Organization), the publishing body (an Organization).
**Optional:** bilingual excerpt or summary of the coverage.
**Writing standard:** Press documents that external coverage exists and what it says — it supplements the internal record, it never replaces the Archive's own documented facts with a journalist's characterization of them.
**Quality requirement:** Press without a documented, identifiable publisher is not admissible as Press — an anonymous or unverifiable source stays as informal background, not a Press entry.

## Timeline Entries

**Not a distinct entity type today.** A chronological view of AHR's content is a *presentation* of existing Event, Work, and Contribution dates — not a separate content type requiring its own standard. See `09-knowledge-architecture.md` for how a future Timeline experience would be built as a read layer over these existing entities, not a new place to enter data.

---

## Citation Standards (Cross-Reference)

Every entity's `Source` field is the citation. Where a claim rests on an external source (a press article, an official document), that source is recorded in `Source`, and the entity's Verification Status reflects how strong that source is (Verified vs. Self-Reported) — see Verification Logic in `03-business-rules.md`. AHR does not use inline footnote-style citations within description text; the entity-level `Source` and `Verification Status` fields together *are* the citation mechanism.

## General Quality Requirements

1. No entity is marked Verified without evidence meeting Verification Logic's bar.
2. No entity is published missing a mandatory relationship its type requires.
3. No entity is published in only one language if its type requires bilingual parity.
4. No description substitutes promotional language for documented fact (see `07-editorial-guidelines.md`).
5. No entity is created that duplicates an existing, documented Person, Work, or Organization — the Archive is checked first.
