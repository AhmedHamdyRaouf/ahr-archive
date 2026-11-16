# AHR Knowledge Architecture

**This is conceptual architecture — how knowledge is meant to move through AHR as a system of meaning, not the software architecture that implements it today.** For the actual technical architecture, see the Platform v1.0 release package. Where a concept below is already real in the software, this document says so; where it describes something not yet built, it says that too.

---

## The Governing Idea

AHR has exactly one body of knowledge — the documented Archive — and everything else (the CMS, the Website, Search, AI, and any future Timeline, Knowledge Graph, Recommendation, or Automation layer) is a different **lens onto that same body of knowledge**, never a separate copy of it. This is Content Governed Once (Core Principles) applied at the scale of the whole ecosystem, not just one content type.

```
                         ┌─────────────────────┐
                         │   THE ARCHIVE         │
                         │ (the one body of      │
                         │  documented knowledge) │
                         └──────────┬────────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                       │
        ┌────▼────┐          ┌──────▼──────┐          ┌─────▼─────┐
        │   CMS    │          │   Website    │          │  Search    │
        │ (write   │          │ (public read │          │ (find      │
        │  lens)   │          │  lens)       │          │  lens)     │
        └────┬────┘          └──────┬──────┘          └─────┬─────┘
             │                      │                       │
             └──────────────────────┼───────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │   AI (assist lens)  │
                          │ suggests, never      │
                          │ decides (see          │
                          │ AI Philosophy)         │
                          └─────────┬─────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                   │
          ┌──────▼──────┐   ┌───────▼───────┐   ┌───────▼────────┐
          │  Timeline    │   │ Knowledge Graph │   │ Recommendations │
          │ (chronology   │   │ (relationship    │   │ (discovery       │
          │  lens — not    │   │  lens — not       │   │  lens — not       │
          │  yet built)     │   │  yet built)        │   │  yet built)        │
          └───────────────┘   └───────────────────┘   └───────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │    Automation       │
                          │ (operational lens —  │
                          │  minimal today)        │
                          └─────────────────────┘
```

---

## The Archive (The Source)

The Archive is not a lens — it is the thing every lens looks at. It is the governed body of Person, Work, Contribution, Project, Organization, Award, Event, Media, Press, Category, and Tag records, each carrying the shared Metadata Model (status, visibility, verification status, source, ownership). Nothing downstream — not the CMS, not the Website, not AI — is a second source of truth for this data; every lens reads from or writes to this one body, never a copy of it.

## CMS (The Write Lens)

The CMS is where documented knowledge enters and moves through its lifecycle (Draft → Review → Verified → Published → Archived). It is the only lens with write access to the Archive in Version 1 — every other lens is read-only with respect to core content. This is real today: AHR Platform v1.0's Dashboard CMS screens are exactly this lens, generic across all ten Archive entity types.

## Website (The Public Read Lens)

The Website renders only the Archive's Published, publicly Visible subset, in both languages with parity, following Design Principles' hierarchy and progressive-disclosure rules. It never holds content the Archive doesn't already have — a Website page with no corresponding Archive entity is not a valid page.

## Search (The Find Lens)

Search lets a visitor or administrator locate Archive content by matching text against it — a retrieval lens, not a content source. What Search returns is always governed by the same Visibility rules as the Website (a public search never surfaces a Draft). AHR Platform v1.0's Search is a real, working ILIKE-based implementation with a relevance heuristic — a genuine find lens, even though its matching technique (as opposed to full-text ranking) is a documented, revisitable technical choice, not a conceptual limitation of the Find lens itself.

## AI (The Assist Lens)

AI reads across the other lenses to analyze, summarize, translate, or suggest — never to hold its own copy of knowledge and never to write to the Archive directly. Every AI output re-enters the system only through a human accepting it via the CMS (the Write Lens) — AI has no side door into the Archive that bypasses Review. This is exactly how AHR Platform v1.0's three AI tasks work: read from the Archive, suggest, return to a human, who then uses the CMS to save it if they choose.

## Timeline (Chronology Lens — Not Yet Built)

A Timeline would be a chronological re-presentation of Event, Work, and Contribution dates already in the Archive — not a new place data is entered. Conceptually, it answers "what happened, in what order" using data every other lens already has; building it is a presentation project, not a new content type (see `06-content-standards.md`'s note on Timeline Entries).

## Knowledge Graph (Relationship Lens — Not Yet Built)

A Knowledge Graph would make the Domain Model's relationships (`02-domain-model.md`) — Person↔Contribution↔Work, Organization↔Award, and so on — explorable as a connected structure, rather than one entity page at a time. Conceptually, this lens already exists in the *data* (the Relationship Model has always defined these connections); what doesn't exist yet is a dedicated way to *browse* the graph itself. AHR Platform v1.0's `@ahr/relationships` package is the closest real precedent — cross-entity queries already exist in code; a graph-browsing experience on top of them is Version 2 scope.

## Recommendations (Discovery Lens — Not Yet Built)

A Recommendation layer would suggest related content a visitor or member might not have searched for directly — governed entirely by the AI Decision Boundaries exception for presentation-layer operations: ranking and suggesting are permitted to be automatic because they don't change platform state, but a Recommendation is never allowed to imply a documented relationship that doesn't actually exist in the Archive (see Internal Linking Philosophy, `07-editorial-guidelines.md`).

## Automation (Operational Lens — Minimal Today)

Automation covers operational processes that keep the ecosystem running without manual repetition — sending a notification when content is moderated, dispatching an AI suggestion request, running a scheduled health check. AHR Platform v1.0 has real, minimal automation today (`@ahr/notifications`' event-driven dispatch, `@ahr/deployment`'s health checks and CI pipeline) — genuine infrastructure automation, not yet business-process automation (e.g., there is no automated Academy enrollment workflow, because Academy itself isn't built). Any future automation is tested against the same rule as AI: if it silently changes governed platform state without a human decision point, it isn't automation — it's an ungoverned decision wearing automation's clothing.

---

## Why This Matters for Every Future Addition

Any new feature — a mobile app, a membership product, an Academy course catalog — is a **new lens on the same Archive**, never a new, parallel body of knowledge. Before building anything new, ask: which existing entity does this read from or write to? If the honest answer is "none — it needs its own new data model," that is itself a Domain Model decision (`02-domain-model.md`) requiring Governance (`08-governance.md`) review before any lens is built on top of it.
