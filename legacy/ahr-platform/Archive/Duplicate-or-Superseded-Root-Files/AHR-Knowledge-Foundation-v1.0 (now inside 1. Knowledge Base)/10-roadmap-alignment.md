# AHR Roadmap Alignment

**Source lineage:** Official Roadmap (Phase 0); Release 2/Backlog (Final Build Manifest); Future Evolution Strategy (Phase 9); the Platform v1.0 release package's own `12-known-limitations.md` and `13-future-backlog-v2.md`. This document is the bridge between everything above and what gets built next — it does not introduce new commitments; it maps existing ones.

---

## Where AHR Actually Stands

The Official Roadmap defined eleven phases, Phase 0 through Phase 10, with a hard rule: no code before Phase 10. Phases 0–9 produced exactly the planning corpus this Knowledge Foundation draws from. **Phase 10 — Development — is AHR Platform v1.0**, delivered across sixteen engineering milestones and now the stable baseline. This Knowledge Foundation is not a twelfth phase or a new Phase 10 revision; it is the durable knowledge layer that Phase 10's software was always meant to serve, made explicit and permanent now that the software exists to check it against.

Of the five Ecosystem components (Business Bible), **exactly one — Archive — was built in V1**, together with the minimal, human-supervised beginning of AI Platform. Personal Brand exists as a placeholder (the Website's Home/About pages, per Known Limitation #28 in the Platform release). Academy and Creative Network are entirely unbuilt, exactly as the Official Roadmap and Final Build Manifest always scoped them — postponed, not forgotten, and blocked on their own dedicated Information Architecture, Data Architecture, and Business Logic documents (Blocking Issues B8/B9), which this Foundation does not attempt to substitute for.

---

## Archive Foundation

**What it is:** The documented body of Person, Work, Contribution, Project, Organization, Award, Event, Media, Press, Category, and Tag records, governed by the lifecycle, verification, and ownership rules in `02-domain-model.md` and `03-business-rules.md`.

**How this Foundation supports it:** Every rule this Foundation states about the Archive is already implemented and tested in AHR Platform v1.0 — the two are, right now, in agreement. The Foundation's job going forward is to be the thing any future Archive change (a new entity type, a new required field) is checked against *before* it's built, the same way Entity Catalog and Data Integrity Rules were checked before any code existed.

**What's next:** completing the Dashboard UI gaps already identified in the Platform release (a Media Library browse screen, a Moderation queue screen, real Home/About content, Person/Event/Organization detail pages on the public Website) — none of these require a new Domain Model concept; they are presentation work on data this Foundation already fully describes.

## Content Intelligence

**What it is:** The Knowledge Graph and Timeline lenses described in `09-knowledge-architecture.md` — making the Archive's existing relationships and chronology genuinely explorable, not just individually browsable one entity at a time.

**How this Foundation supports it:** The Relationship Model (`02-domain-model.md`) already defines every connection a Knowledge Graph would visualize; nothing new needs to be invented, only presented. `@ahr/relationships` (Platform v1.0) is the direct precedent to build on.

**What's next:** the query-capability gaps the Platform release already found and documented (`@ahr/analytics`'s missing `GROUP BY`/date-range support) are the first technical blockers to clear before richer Content Intelligence features (aggregate insight across the whole Archive, not just one entity at a time) become practical.

## AI Native Platform

**What it is:** AHR AI Platform's full vision — an AI layer serving Archive, Academy, and Creative Network alike, going beyond the three minimal suggestion tasks V1 shipped.

**How this Foundation supports it:** Every future AI capability, without exception, is tested against the single question in `01-business-bible.md`'s AI Philosophy before it is built: *could the platform work correctly if the suggestion were ignored?* This test does not get weaker as AI capability grows — a more powerful AI model is still bound by the same six AI Principles and the same Human-in-the-Loop cycle a simple one is.

**What's next:** the Platform release's own AI backlog — an AI recommendation log (so a suggestion's history and acceptance can be tracked, which V1's frozen schema didn't support), embeddings/semantic search (explicitly deferred by the Database Architecture itself), and a second AI provider behind the existing `AIProvider` abstraction (Database Architecture's own stated intent: "OpenAI now, others later").

## Public Experience

**What it is:** Everything a Visitor, Student, Artist, or Researcher (Business Bible's stakeholder table) actually encounters — the Website today, and Academy's and Creative Network's own public-facing experiences once built.

**How this Foundation supports it:** Design Principles and Editorial Guidelines apply identically to every future Public Experience surface — a future Academy course page is bound by the same bilingual parity, clarity-before-beauty, and accuracy-before-marketing rules as today's Website, not a fresh set invented for it.

**What's next:** the Visual Identity values still deferred (Known Limitation B10 — real colors, typography, logo), Academy's and Creative Network's own dedicated architecture documents (Blocking Issues B8/B9), and the Dashboard UI completeness gaps already tracked in the Platform release.

## Automation

**What it is:** The operational lens described in `09-knowledge-architecture.md` — today, minimal infrastructure automation (notifications, health checks, CI); eventually, real business-process automation (an Academy enrollment workflow, a Creative Network matching process).

**How this Foundation supports it:** Automation is held to the exact same test as AI (`01-business-bible.md`) — any future automation that silently changes governed platform state without a human decision point is not automation, it is an unauthorized decision. This is a permanent constraint, not a V1-specific one.

**What's next:** the persistent rate-limiting and distributed-caching gaps the Platform release already documented (`@ahr/security`) are infrastructure prerequisites for automation that needs to run reliably across multiple serverless instances, not just within one.

## AHR Platform v2

**What it is:** Everything postponed from V1 by explicit, documented scope decision — Academy in full, Creative Network in full, the Release 2 backlog already itemized in the Platform release's `13-future-backlog-v2.md`, and any Release 2 role (`trainer`, `student`, `creative_member`) activation, which requires new RLS policies specific to each role, not just the `is_administrator()`-or-public split V1 built.

**How this Foundation supports it:** Nothing in Version 2 planning starts from zero. Every Version 2 capability is either a Domain Model concept already named here waiting for its own dedicated architecture (Academy, Creative Network), or a database/infrastructure gap already precisely identified with its exact "path to unblocking" (the Platform release's Known Limitations). Version 2 planning's job is to sequence and architect these — not to rediscover what's already been decided.

**The one rule that governs all of it:** no Version 2 capability is built by silently reinterpreting a Core Principle, a Business Rule, or a Domain Model boundary to make room for it. If a genuinely new capability doesn't fit what's documented here, the correct order is: propose it, review it against every principle in this Foundation, get it explicitly approved through Governance (`08-governance.md`), update this Foundation, and only then build it — never the reverse.
