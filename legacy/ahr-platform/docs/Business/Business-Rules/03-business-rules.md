# AHR Business Rules

**Source lineage:** Business Rules, Business Processes, Entity Lifecycles & State Transitions, Publication Rules, Verification Logic, Moderation Logic, Ownership Rules, Collaboration Logic, Platform Policies & Exception Handling (Phase 6); AI Decision Boundaries, Human-in-the-Loop Architecture (Phase 5).

---

## The Six Governing Rules

Every specific rule in this document traces back to one of these six, and none may contradict them:

1. **No publication without accountability.** Every published entity has one identified, responsible owner. There is no "ownerless" content.
2. **No verification without human review.** Any verification decision is issued by an authorized human, never by AI alone — consistent with AI Decision Boundaries.
3. **No state transition without its condition met.** Any move between an entity's lifecycle states requires the specific business condition defined below to actually hold.
4. **No collaboration without both parties' consent.** Any interaction within the Creative Network requires explicit consent from every party involved.
5. **An exception is a documented procedure, not a substitute rule.** Any departure from an approved rule goes through a documented exception path and never automatically becomes precedent for similar cases.
6. **Business rules never contradict what came before them.** Every rule here honors Core Principles, Data Integrity Rules, and AI Decision Boundaries — never overrides them.

---

## Content Lifecycle

### State Transition Conditions

| Transition | Required business condition |
|---|---|
| **Draft → Review** | The minimum required data for the entity type is complete (per its Content Standard, `06-content-standards.md`). |
| **Review → Verified** | Verification Logic's conditions are met and an authorized reviewer has reviewed it. |
| **Verified → Published** | Publication Rules' additional conditions are met — verification alone is necessary but not sufficient. |
| **Published → Archived** | A decision by the responsible owner, or the result of a Moderation action. |
| **Archived → Published (recovery)** | A review confirms the reason for archiving no longer applies. |

**No skipping stages.** An entity may never move directly from Draft to Published, or from Review to Archived, bypassing the intermediate states. This sequence is fixed; this document defines the entry conditions for each step, not a new sequence.

### Core Business Processes

Every business process below follows the same two fixed phases: **entry**, then **review before any published effect.**

- **Person Registration:** enter a new Person → initial review → link to Identity → Draft state until verified.
- **Contribution Registration:** link a Person to a Work/Project/Event via Contribution → determine the nature of the role → review → verify.
- **Work Publication:** create a Work → link at least one Contribution (mandatory per Data Integrity Rules) → review and satisfy Publication Rules → publish.
- **Organization Registration:** enter an Organization → verify it is a documented official body → link its associated Projects/Awards/Events.
- **Award Recording:** record an Award linked to a granting Organization and a beneficiary Person → verify the documentation source.
- **Event Documentation:** record an Event with date and place → link participants via Contribution → link supporting Media.
- **Academy Enrollment (conceptual):** a request to join → an eligibility review → acceptance → link the student to an *existing* Person record (never a duplicate, per the Identity Model). Academy's own full operational detail is a Release 2 concern; this rule covers only its point of contact with the central platform.
- **Creative Network Membership Request (conceptual):** a request to join → review of the applicant's existing documented record in the Archive → acceptance → activation of a collaboration profile (detailed under Collaboration, below).

---

## Publication Rules

Passing verification is necessary but never sufficient on its own. Publication additionally requires all five of the following:

1. **Bilingual completeness.** An entity is not published with content in only one language if its type requires an equivalent in both, per bilingual consistency.
2. **A responsible owner exists.** No publication without a determined Ownership, even if the entity has passed verification.
3. **Minimum mandatory relationships are linked.** Any entity with a mandatory relationship in the Domain Model (a Work without a Contribution) is not published until that relationship is satisfied.
4. **Explicit consent from the data's subject, when needed.** If an entity concerns a Person other than the platform owner (an artist, a Creative Network member), documented consent to publish is required — never assumed.
5. **No active report.** An entity with an open Moderation report under review is not published or re-published.

---

## Verification Logic

### Who Holds Verification Authority

| Entity type | Who may verify |
|---|---|
| Person (general data) | The Administrator. |
| Work / Contribution | The Administrator, or the contributing Person themself if they have access (a self-confirmation stays at `self_reported` until additional administrative verification). |
| Organization / Award | The Administrator, based on a documented official source. |
| Media / Press | The Administrator, by verifying the file's or coverage's source. |

### Accepted Evidence Types

- An official document or source (a contract, a certificate, credible press coverage).
- Direct confirmation from the relevant Person or Organization.
- Consistency with another already-verified entity (a verified work mentioning a contributor whose identity can be confirmed through it).

### AI's Role in Verification

AI may suggest a confidence level or flag a potential inconsistency, but **it never issues a final verification decision under any circumstance.** The decision always belongs to the human authority named above.

### Disputed Verification

If verification sources conflict (two people claiming the same contribution, or contradictory information), the case is referred to Moderation — never resolved unilaterally.

---

## Moderation

### The Oversight Cycle

```
① Reporting
        ↓
② Review — by an authorized administrator
        ↓
③ Escalation — if the case exceeds the first reviewer's authority
        ↓
④ Resolution — a final decision: keep / amend / archive the reported entity
        ↓
⑤ Audit — the decision and its reason are recorded in the historical record
```

### Cases Requiring Moderation

A verification conflict referred from Verification Logic; a user report concerning the accuracy or appropriateness of published content; a discovered conflict between two documented entities (a duplicate Person, a contradictory Contribution).

### Temporary Suspension Rule

Any entity under an active report is automatically suspended from republication or editing (consistent with Publication Rules), without being permanently archived until a resolution decision is made.

### Who Holds Resolution Authority

The Administrator alone holds final resolution authority. AI may summarize a report or suggest a classification, but never participates in the decision itself.

---

## Ownership

**Architectural principle: ownership here is platform stewardship, not intellectual property.** This distinction is mandatory to remove any future ambiguity about what "ownership" means — it has nothing to do with copyright or the intellectual property of the work itself (which, if ever relevant, is addressed in separate legal documents outside this architecture's scope).

### The Default Ownership Rule

Every entity has exactly one responsible owner at any given moment — no ambiguous joint ownership. The default owner of any entered entity is whoever entered it, until formally transferred.

| Entity | Default owner |
|---|---|
| Person / Work / Contribution / Project / Organization / Award / Event / Media / Press | The Administrator who reviewed and approved the entry. |
| A Person with an active User (artist, student, member) | Granted review rights over their own data, but final responsibility for its published accuracy remains with the Administrator. |

### Transferring Ownership

Responsibility for an entity may be transferred from one owner to another (e.g., when the administrator supervising a given section changes), on condition that the transfer is documented in the historical record — it never happens implicitly or automatically.

### Owner Responsibility

The owner is responsible for: data accuracy, tracking the entity's lifecycle progress, and responding to any Moderation report concerning their entity.

---

## Collaboration Logic (Creative Network)

### Prior Documentation Requirement

No Person may request or accept collaboration within the Creative Network without at least a minimal documented record (at least a verifiable "self-reported" state) — consistent with the network's vision of being built on documented trust, not personal acquaintance.

### The Collaboration Request Cycle

```
① A member requests collaboration with another member
        ↓
② The target member views only the requester's published, documented record (no restricted data)
        ↓
③ Explicit acceptance or rejection from both parties
        ↓
④ On acceptance: the collaboration is recorded as a Contribution or joint Project (per its nature)
```

### Mutual Consent Rule

No collaboration is recorded as an approved Contribution without explicit, documented consent from every party. One party may never register another's contribution on their behalf without confirmation.

### Collaboration Disputes

Any disagreement over the nature or share of a recorded collaboration is referred to Moderation Logic — never resolved unilaterally by one party.

### Visibility Boundaries Between Members

A member sees only another member's published or documented data (per Visibility in the Metadata Model) — never internal or restricted data.

---

## Platform Policies

1. **Linguistic Equivalence Policy.** English content is never treated as a secondary translation of Arabic, or vice versa — both are original versions held to the same standard of accuracy.
2. **Inactivity Policy.** A Person whose User has been inactive for a long period does not lose their record or documentation (consistent with No Hard Delete), though some interactive privileges (like requesting new collaboration) may be restricted until reactivation.
3. **Sensitive Content Policy.** Any content concerning minors or sensitive personal information is subject to mandatory additional review before publication, regardless of otherwise satisfying Publication Rules.

## Exception Handling

```
① A case not clearly covered by an approved rule
        ↓
② The case and the reason the existing rule doesn't apply are documented
        ↓
③ Review of its architectural impact (Claude, and ChatGPT when engaged)
        ↓
④ The platform owner's decision
        ↓
⑤ The exception is recorded as a documented individual case — it does not automatically become a general rule
```

**Repeated exceptions trigger an architectural review** to determine whether they represent a genuine edge case or should become a formal part of the approved business rules. The architecture defines governance principles, not numeric repetition thresholds.

---

## AI Usage Rules (Cross-Reference)

The full AI philosophy and the single governing test ("could the platform work correctly if the suggestion were ignored?") live in `01-business-bible.md`'s AI Philosophy. The business-rule consequence of that philosophy is:

- AI may never change a Verification Status.
- AI may never publish, archive, or delete any entity as a final act.
- AI may never assign or alter a Role.
- AI may never represent a brand in its own voice to the public.
- AI may freely perform presentation-layer operations that do not change platform state (search ranking, recommendation ordering, personalized display) — the only category of automatic AI action permitted without a mandatory human review step.

Every AI-assisted task in AHR Platform v1.0 (`generate_description`, `suggest_tags`, `translate_field`) was built to return a suggestion for human review, never to save automatically — this is not a technical limitation, it is this rule set applied correctly from the start.
