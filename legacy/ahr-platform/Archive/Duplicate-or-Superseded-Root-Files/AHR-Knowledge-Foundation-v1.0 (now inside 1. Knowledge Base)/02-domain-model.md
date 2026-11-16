# AHR Domain Model

**Source lineage:** Entity Catalog, Relationship Model, Identity Model, Data Lifecycle, Archive Model, Metadata Model, Data Integrity Rules (Phase 4). This document describes the business — what each concept *means* and *is responsible for* — not the database. For the actual tables, columns, and constraints that implement this model in AHR Platform v1.0, see `packages/database/` and `docs/AHR-Platform-v1-Database-Architecture.md` in the Platform release.

---

## Reading This Document

Every entity below is described by: what it *is*, what it is *responsible for* representing, and what it *must* relate to (its dependencies). No entity in AHR — except Person and Organization — exists independent of at least one other entity; a fully independent, unrelated entity is not architecturally permitted (Entity Catalog's "No Independence Rule").

---

## The Entities

### Person
**Is:** Any individual within the AHR ecosystem — regardless of whether they have platform access (a User) or not.
**Responsible for:** Representing one unified individual identity, no matter how many roles that identity holds.
**Relates to:** Contribution (directly), and through it, Work, Project, and Event.

### Work
**Is:** A completed, documented creative unit.
**Responsible for:** Representing a standalone artistic piece that can be referenced and linked to everyone who contributed to it.
**Relates to:** Contribution, Media, Press, Category/Tag.
**Business constraint:** A Work with no Contribution linked to it is architecturally incomplete — it cannot be considered a finished archive entry, let alone published.

### Contribution
**Is:** The precise linking entity between a Person and a Work, Project, or Event.
**Responsible for:** Describing the nature of a specific person's role in a specific work or activity — it never exists without a Person, and never without at least one of (Work / Project / Event).
**Relates to:** Person (mandatory), Work / Project / Event (at least one, mandatory).

### Project
**Is:** An ongoing activity that isn't classified as a single, finished creative work.
**Responsible for:** Representing a time-extended activity (training, judging, an initiative) that people participate in through Contribution.
**Relates to:** Contribution, Organization (if a sponsoring body exists), Media.

### Organization
**Is:** Any institution or official body connected to the content.
**Responsible for:** Representing external entities (institutions, channels, judging bodies) connected to works, awards, or projects.
**Relates to:** Award, Project, Event.

### Award
**Is:** A prize, honor, or official recognition.
**Responsible for:** Documenting formal recognition granted to a person or work by a specific body.
**Relates to:** Person (via Contribution or direct link), Organization (the granting body, mandatory — an Award with no documented institutional source does not exist as an Award).

### Event
**Is:** An occurrence fixed to a date and place.
**Responsible for:** Representing a single point-in-time occasion that several people or works may participate in.
**Relates to:** Contribution, Organization, Media.

### Media
**Is:** Any visual or audio file.
**Responsible for:** Providing supporting visual/audio documentation — it never exists in isolation from an entity it illustrates.
**Relates to:** Work, Person, Project, Event (exactly one — no Media exists unlinked to any of these).

### Press
**Is:** Any external press or media coverage.
**Responsible for:** Documenting an external source that references internal content — it supplements the internal record, never replaces it.
**Relates to:** Person, Work, Event, Organization (the publishing body).

### Category
**Is:** A hierarchical classification.
**Responsible for:** Organizing entities within a fixed parent/child structure.
**Relates to:** Work, Project (per the platform's Content Taxonomy).

### Tag
**Is:** A free, non-hierarchical descriptive label.
**Responsible for:** Adding descriptive properties that cut across hierarchical classification.
**Relates to:** Any content entity, without hierarchical constraint.

**The Category/Tag rule:** any property used for a fixed, hierarchical classification (a type, a fixed category) is a Category. Any free, non-hierarchical, repeatable descriptive property is a Tag. The same property may never be a Category in one place and a Tag in another for the same content type.

---

## Relationships

```
Person ──────┐
             ▼
        Contribution ──────┬──── Work
             │              ├──── Project
             │              └──── Event
             ▼
       (defines the nature of the contribution: composer, performer, director, trainer...)

Work ─────── Media          (a Work with supporting media)
Work ─────── Press          (a Work with press coverage)
Work ─────── Category/Tag   (a classified Work)

Project ─────── Organization   (an activity sponsored by a body)
Project ─────── Media
Project ─────── Category/Tag

Event ─────── Organization      (an occasion organized by a body)
Event ─────── Media
Event ─────── Contribution      (who participated in the occasion)

Organization ─────── Award       (the body granting the award)
Award ─────── Person             (via Contribution or direct link)

Media ─────── Person / Work / Project / Event   (no isolated Media)
Press ─────── Person / Work / Event / Organization
```

### Relationship Types

| Type | Description | Example |
|---|---|---|
| **Mandatory** | The dependent entity cannot exist without it. | Contribution cannot exist without a Person. |
| **Optional** | May or may not exist. | A Project may or may not relate to an Organization. |
| **Many-to-Many** | One entity relates to more than one of the same type. | One Work may have Contributions from several different people. |

Every relationship described here has a clear conceptual direction (who refers to whom), but this does not imply a technical foreign-key direction — that is a database implementation decision, made once and documented in the Platform's own Database Architecture, not re-litigated here.

---

## Identity — The Concept AHR Gets Most Precise About

Person, Identity, User, Role, Profile, Verification, Authentication, and Authorization are seven distinct concepts, deliberately never merged into one:

```
Person (a content entity, permanently existing)
   │
   ├── Identity (the unified identifying data)
   │
   ├── User (optional — platform-access activation)
   │      └── Authentication / Authorization (conceptual only)
   │
   ├── Role(s) (multiple, contextual)
   │
   ├── Profile(s) (display, per context/role)
   │
   └── Verification Status (data trustworthiness state)
```

- **Person** — a content entity representing an individual within AHR's knowledge system. May or may not have platform access.
- **Identity** — the total data that uniquely and consistently defines a Person (name, biography, central identifier), regardless of whether a User account exists. One Identity per Person, never duplicated across roles.
- **User** — the activation of a Person's ability to access the platform (sign in). Not every Person has a User, but every User maps to exactly one Person.
- **Role** — the functional capacity a Person/User holds in a given context (artist, student, trainer, member, administrator — see the Users concept in the Business Bible's stakeholder table). One person may hold several roles simultaneously.
- **Profile** — the informational view of a Person displayed within a given role's context (a Profile inside Academy looks different from one inside Creative Network), but always sourced from the same underlying Identity, never a separate copy.
- **Verification** — the state of confidence in the accuracy of data associated with a Person or Contribution (verified, self-reported, under review, archived) — a state concept, not a technical mechanism.
- **Authentication / Authorization** — conceptual only at this layer: confirming who is accessing the platform, and what they're permitted to do based on Role. The technical mechanism for either is entirely a Technical Architecture decision, out of this document's scope.

---

## Lifecycle and State Transitions

Every entity moves through the same fixed sequence — no entity skips a stage:

```
Draft → Review → Verified/Published → Archived → Recovered (optional) → Published
```

| Stage | Meaning |
|---|---|
| **Creation** | A new entity is entered in an initial, unpublished state, with its input source recorded as mandatory. |
| **Review** | The entity's consistency with approved rules and its type definition is checked, before any publication. |
| **Verification** | The entity is classified by trust level (verified / self-reported / under review), per the Verification concept above — this applies to non-person entities too (a Work, a Contribution), not people alone. |
| **Publishing** | The entity becomes visible in the public interface, after passing review and verification. |
| **Archiving** | The entity is hidden from public view without deleting its data, per No Hard Delete. |
| **Deletion** | There is no true permanent deletion of anything ever published. What's colloquially called "deletion" is permanent archiving. Actual data removal is permitted only for drafts that were never published and were entered in error. Genuine permanent deletion is a restricted administrative process, available only to the Platform Owner or through mandatory legal compliance procedures — see `03-business-rules.md`. |
| **Recovery** | An archived entity is restored to published state, without losing its history or original identifier. |
| **Historical Preservation** | A permanent copy of every state the entity has passed through (published, edited, archived) is kept, enabling its evolution to be traced over time. |

No entity may jump directly from Draft to Published, or from Review to Archived, skipping intermediate states.

---

## Archive Model — How History Is Preserved

- **Versioning:** every substantive edit to a published entity is preserved as a retrievable prior version — never overwritten or erased on edit.
- **Historical Records:** every entity carries a record of its state sequence over time (creation, publication, archiving, recovery dates).
- **Legacy References:** any old identifier or link for an entity that changed or was reorganized remains traceable to where it moved — never left dangling.
- **Source Preservation:** any data originating from the original uploaded archive (the legacy files reviewed in Phase 0) retains a reference to its original source, even after being rephrased within the new entities.
- **Future Expansion:** the archival model is designed to accommodate new entity types in the future (Course, Student, Membership, etc., per Phase 0's Future layer) without changing the historical-preservation principle itself.

**Governing principle:** archive, never replace. A new historical record is added on top of existing history; it never overwrites it. This guarantees a return to any prior state is always possible.

---

## Metadata Model — Shared Across Every Entity

Every entity in the Entity Catalog, without exception, carries the same metadata layer — never redefined per entity type:

| Metadata | Conceptual meaning |
|---|---|
| **Status** | The entity's current lifecycle stage (Draft / Review / Published / Archived). |
| **Visibility** | How widely the entity is shown (public, restricted to a specific context such as the Dashboard, hidden). |
| **Language** | Which language(s) the entity's data is available in (Arabic/English, per bilingual parity). |
| **Created Date** | Initial creation date. |
| **Updated Date** | Date of last substantive edit. |
| **Verification Status** | The entity's trust state (verified, self-reported, under review, archived). |
| **Source** | The original data source (an archive document, manual entry, a verified external source). |
| **Ownership** | Who is responsible for the entity's accuracy and upkeep (see `03-business-rules.md`'s Ownership Rules — this is stewardship, not intellectual property). |
| **Rights** | The nature of rights associated with the entity (chiefly relevant to Media and Press). |

This metadata layer is shared, not redefined per entity — this is precisely why AHR Platform v1.0's engine treats `status`/`visibility`/`verification_status` as one generic, reusable lifecycle graph (`@ahr/cms-core`) rather than bespoke logic per entity type: the business model itself is the shared layer; the software followed it, not the other way around.

---

## Domain Boundaries

An item is part of AHR's domain only if it satisfies both:

1. Its core data (people, works, connected organizations) is stored and governed within AHR's central data model.
2. Its naming and identity fall under AHR's Brand Architecture governance, whether directly or as an approved sub-brand.

An entity is **not** part of the domain if it: is a completely independent project of Ahmed Hamdy Raouf's that doesn't rely on AHR's data and isn't governed by its identity; is an idea or product proposed but not yet formally adopted (it stays in Backlog until adopted); is content whose source is external parties unconnected to AHR's documented network (referencing it does not make it part of the Archive); or is a general commercial/operational decision (pricing, funding, corporate structure) — those are out of this domain's scope entirely.
