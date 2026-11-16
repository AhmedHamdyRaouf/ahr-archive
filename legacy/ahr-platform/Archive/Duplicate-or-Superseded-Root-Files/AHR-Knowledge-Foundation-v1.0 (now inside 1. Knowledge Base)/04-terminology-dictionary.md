# AHR Terminology Dictionary

This is the official language of AHR. Every term below has one meaning across every AHR document, product, and conversation. Where two terms sound similar but mean different things, that distinction is stated explicitly — using one for the other is a governance error, not a stylistic choice.

---

### AHR
**Definition:** Ahmed Hamdy Raouf Platform — the entire ecosystem of five components (Personal Brand, Archive, Academy, Creative Network, AI Platform) under one identity, one central database, one governance model.
**Usage:** "AHR" always refers to the platform, never to a single product or the Website alone.
**Related terms:** AHR Core, Ecosystem, Platform.
**Never confuse with:** the Website (an output of AHR, not AHR itself); a "startup" (AHR is not funded/growth-oriented in that sense — see the Business Bible).

### Platform (vs. Product)
**Definition:** A system qualifies as a Platform, not a single Product, only when four conditions hold together: more than one output serves users in different roles; every output relies on the same core data instead of duplicating it; governing decisions (identity, naming, deletion, roles) are made once at the platform level and apply automatically to every dependent product; and any new output added later falls under the same governance rather than starting with independent identity or data.
**Usage:** "AHR is a Platform" is a precise architectural claim, not a marketing description.
**Related terms:** AHR Core, Products, Ecosystem.

### AHR Core
**Definition:** The shared foundational layer: identity, governance, and the central data store. Every other component depends on it; it depends on none of them.
**Usage:** "Built on AHR Core" means a component's identity data (people, works, organizations) lives in the shared model, not a separate one.
**Related terms:** Ecosystem, Identity.

### Component (Platform Component)
**Definition:** One of the five officially recognized parts of AHR (Personal Brand, Archive, Academy, Creative Network, AI Platform).
**Usage:** A new idea is not a Component until it passes Brand Governance's review path.
**Related terms:** Product, Ecosystem.
**Never confuse with:** Product — a Component is a structural part of the platform; a Product is what's actually delivered to an end user (e.g., "the public digital archive" is a Product delivered by the Archive Component).

### Archive
**Definition:** The Component documenting Ahmed Hamdy Raouf's career, works, and professional relationships. This is what AHR Platform v1.0 built.
**Usage:** "The Archive" refers to the documented body of Person/Work/Project/Event/Award/Media/Press/Contribution records — not the software that manages it.
**Related terms:** Work, Contribution, Entity Catalog.

### Person
**Definition:** Any individual within AHR's knowledge system, whether or not they have platform access.
**Usage:** "Register a Person" — enter someone into the Archive as a documented individual.
**Related terms:** Identity, User, Role, Profile.
**Never confuse with:** User (a Person may never have a User; a User always has exactly one Person) or Role (a Role is a capacity a Person holds, not the Person themself).

### Identity
**Definition:** The complete set of data that uniquely and consistently defines a Person — name, biography, central identifier — independent of whether they have platform access.
**Usage:** "One Identity per Person" — never duplicated, no matter how many Roles that Person holds.
**Related terms:** Person, One Identity Multiple Roles (Core Principle).
**Never confuse with:** Profile (a *display* of identity data in a given context, not the identity data itself).

### User
**Definition:** The activation of a Person's ability to sign in and access the platform.
**Usage:** "Not every Person has a User" — a documented historical figure in the Archive need not have platform access.
**Related terms:** Person, Authentication, Authorization.
**Never confuse with:** Role (a User's Role determines what they can do; the User concept itself is only about *whether* they can sign in).

### Role
**Definition:** The functional capacity a Person/User holds in a given context — artist, student, trainer, creative member, administrator, platform owner.
**Usage:** "One person, several Roles" — a Creative Network member can simultaneously be an Academy trainer, on one Person record.
**Related terms:** Identity, Profile, User Types (Visitor, Student, Trainer, Creative Member, Administrator, Platform Owner, AI System).
**Never confuse with:** Ownership (Ownership is about accountability for an entity's accuracy; Role is about functional capacity — they are governed by entirely separate rule sets).

### Profile
**Definition:** The informational view of a Person displayed within a specific Role's context (an Academy Profile differs in presentation from a Creative Network Profile), but always sourced from the same underlying Identity.
**Usage:** "Multiple Profiles, one Identity."
**Related terms:** Identity, Role.

### Verification Status
**Definition:** The state of confidence in the accuracy of data tied to a Person, Work, or Contribution: **Verified**, **Self-Reported**, **Under Review**, or **Archived**.
**Usage:** A Work can be Published while its Verification Status is Self-Reported — Publication and Verification are related but distinct gates (see Publication Rules).
**Related terms:** Publication Rules, Verification Logic.
**Never confuse with:** Status (the lifecycle stage — Draft/Review/Published/Archived) — Verification Status is about *trustworthiness*, Status is about *lifecycle position*. An entity can be Published (Status) and still Self-Reported (Verification Status).

### Verified
**Definition:** The highest Verification Status — confirmed via an official document/source, direct confirmation from the relevant Person/Organization, or consistency with another already-verified entity.
**Related terms:** Self-Reported.
**Never confuse with:** Self-Reported — a stronger, administrator-confirmed state than a self-confirmation.

### Self-Reported
**Definition:** A Verification Status meaning the subject themself confirmed the data, but it has not yet received additional administrative verification.
**Related terms:** Verified.
**Never confuse with:** Verified — self-reporting is a real, legitimate, but lower-confidence state, not a synonym for confirmed.

### Status (Lifecycle Status)
**Definition:** An entity's current stage in its lifecycle: **Draft → Review → Verified/Published → Archived** (with optional Recovery back to Published).
**Usage:** "Move to Review" refers to lifecycle Status, not Verification Status.
**Never confuse with:** Verification Status (see above).

### Draft
**Definition:** The initial lifecycle Status of any newly created entity — unpublished, with its input source recorded.
**Related terms:** Review.

### Review
**Definition:** The lifecycle Status in which an entity's consistency with approved rules and its type definition is checked, before verification or publication.
**Related terms:** Draft, Verified.

### Published
**Definition:** The lifecycle Status in which an entity is visible in the public interface, having passed Review, Verification, and every condition in Publication Rules.
**Related terms:** Verified, Archived.

### Archived (Status)
**Definition:** The lifecycle Status in which an entity is hidden from public view without its data being deleted — per No Hard Delete.
**Usage:** "Archive it" means hide it from public view, never delete its record.
**Never confuse with:** Deleted — see below.

### Deleted / Deletion
**Definition:** True, permanent removal of an entity's data. **This does not happen to anything ever published.** What is colloquially called "deleting" published content is Archiving. Genuine deletion is restricted to drafts entered in error and never published, or to a documented legal/compliance exception executed only by the Platform Owner.
**Never confuse with:** Archived — these are not synonyms. "Delete this Work" said about a published Work means Archive it, not remove its record.

### No Hard Delete
**Definition:** The Core Principle that no entity is ever permanently removed once it exists in the system; it is archived or hidden instead.
**Related terms:** Archived, Historical Preservation.

### Contribution
**Definition:** The precise linking entity describing a specific Person's role in a specific Work, Project, or Event. Never exists without a Person, and never without at least one of (Work/Project/Event).
**Usage:** "Register a Contribution" — link a Person to a Work with a defined role (composer, performer, director, trainer...).
**Related terms:** Person, Work, Project, Event.
**Never confuse with:** Role — Contribution describes involvement in a specific Work/Project/Event; Role describes a Person's general functional capacity on the platform.

### Work
**Definition:** A completed, documented creative unit (a song, an album, a film score, a theatrical piece).
**Related terms:** Contribution, Media, Press, Category, Tag.
**Never confuse with:** Project — a Work is a finished, standalone creative piece; a Project is an ongoing activity not classified as one finished piece (training, judging, an initiative).

### Project
**Definition:** A time-extended activity — training, judging, a cultural initiative — that people participate in through Contribution, not classified as a single finished Work.
**Related terms:** Contribution, Organization.
**Never confuse with:** Work (see above) or Event (a Project is ongoing; an Event is fixed to one date and place).

### Event
**Definition:** An occurrence fixed to a specific date and place, which several people or works may participate in.
**Related terms:** Contribution, Organization, Media.

### Organization
**Definition:** Any institution or official body connected to the Archive's content — a granting body, a producing channel, a judging institution.
**Related terms:** Award, Project, Event.

### Award
**Definition:** A prize, honor, or official recognition, documented with a mandatory granting Organization.
**Related terms:** Organization, Person.
**Rule to remember:** an Award without a documented institutional source is not a valid Award entry.

### Media
**Definition:** Any visual or audio file supporting another entity. Never exists in isolation — always linked to exactly one Work, Person, Project, or Event.
**Related terms:** Press.
**Never confuse with:** Press — Media is a file (image/audio/video); Press is external written/broadcast coverage referencing AHR content.

### Press
**Definition:** External press or media coverage referencing AHR content — supplements the internal documented record, never replaces it.
**Related terms:** Media, Organization.

### Category
**Definition:** A hierarchical classification with a fixed parent/child structure (e.g., Work type: song, album, film score).
**Related terms:** Tag.
**Never confuse with:** Tag — see the Category/Tag rule below.

### Tag
**Definition:** A free, non-hierarchical, repeatable descriptive label (e.g., an era, a mood, an occasion).
**Related terms:** Category.
**The Category/Tag rule:** a fixed, hierarchical classification is always a Category; a free, non-hierarchical, repeatable descriptor is always a Tag. The same property is never a Category in one place and a Tag in another for the same content type.

### Ownership (Stewardship)
**Definition:** Administrative accountability for an entity's accuracy and upkeep — **not intellectual property.** Every entity has exactly one responsible owner at any moment.
**Usage:** "Who owns this entry?" asks who is accountable for its accuracy, never who holds copyright to the underlying work.
**Never confuse with:** intellectual property / copyright — entirely separate, out of this domain's scope.

### Moderation Report
**Definition:** A recorded concern about an entity's accuracy or appropriateness, triggering the Oversight Cycle (Report → Review → Escalation → Resolution → Audit).
**Related terms:** Escalation, Resolution.

### Escalation
**Definition:** Moving a Moderation case beyond the first reviewer's authority when the case exceeds it.
**Related terms:** Moderation Report, Resolution.

### Resolution
**Definition:** The final Moderation decision on a reported entity: keep, amend, or archive it. Held exclusively by the Administrator — never by AI.

### Human-in-the-Loop
**Definition:** The mandatory human review point that every AI-generated recommendation passes through before any final effect on the platform.
**Related terms:** AI Decision Boundaries, Explainability, Confidence.

### Explainability (AI)
**Definition:** The requirement that no AI output is presented without the ability to clarify its source and reasoning.
**Related terms:** Confidence.

### Confidence (AI Confidence Model)
**Definition:** A suggested level of certainty AI may attach to a recommendation — never a substitute for human verification, and not displayed everywhere by default; it appears only where it materially affects a user's understanding or decision.

### Recommendation (AI Recommendation)
**Definition:** A suggestion AI produces (a classification, a proposed link between entities, a description draft) that requires human acceptance before it has any effect.
**Never confuse with:** a Decision — a Recommendation has no platform effect until a human accepts it; a Decision is the human act of accepting, modifying, or rejecting it.

### Governed Platform State
**Definition:** Any state AI may never change automatically: an entity, ownership, permissions, verification status, publication status, archival status, or any other governed business record. Distinguished from presentation-layer state (search ordering, personalization), which AI may change automatically.

### Governance
**Definition:** The decision-making process by which any platform-level rule, brand, or architectural element is proposed, reviewed, and approved or rejected.
**Related terms:** Locked, Approved, Working, Backlog.

### Working / Approved / Locked
**Definition:** The three states any AHR document or decision can hold: 🟡 **Working** (still under discussion), 🟢 **Approved** (adopted), 🔒 **Locked** (finalized; changeable only by the platform owner's explicit decision).
**Related terms:** No Silent Change (Core Principle).

### Backlog
**Definition:** The holding area for any idea or proposed feature not yet formally adopted into the Roadmap. Being in the Backlog does not change the currently locked plan.
**Related terms:** Official Roadmap.

### Architectural Debt
**Definition:** A deliberate, temporary, and explicitly documented deviation from approved architecture, made under time pressure or an exceptional circumstance — reviewed periodically and resolved when practical. Never a silent, permanent departure treated as a fait accompli.

### Master Brand / Sub-Brand
**Definition:** AHR is the Master Brand; Academy, Creative Network, and similar named components are Sub-Brands, each required to remain visibly connected to AHR (never fully independent identities).
**Related terms:** Naming System, Brand Governance.

### AHR AI Platform
**Definition:** The internal AI layer serving the Archive, Academy, and Creative Network. Has no independent public identity or voice; appears only as a feature inside another brand's experience.
**Related terms:** AI Philosophy, Human-in-the-Loop.
