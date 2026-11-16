# AHR Platform — Master Roadmap (Revised Post-Gap-Analysis)

**Status:** 🔒 Final — planning document only; no phase below has been started as a result of this document.
**Companion Document:** `Gap Analysis and Remaining Work Report.md` — every item referenced by ID (A1, C1, G1, etc.) is fully specified there.

---

## Part 1 — Completed Phases

| Phase | Scope | Status |
|---|---|---|
| Phases 1–9 | Vision, Domain Model, Brand Architecture, Information Architecture, Data Architecture, AI Architecture, Business Logic, UX Foundations, Technical Architecture — the approved planning corpus underlying all three tracks | ✅ Complete, locked |
| Development Milestones 1–11 | Project Foundation → Data Foundation → Identity & Access → CMS Foundation → Content Domain (10 entities) → Media Library → Relationships & Metadata → Public Website → Search → Workflow/Moderation → Notifications | ✅ Complete, tested |
| Development — AI Integration | Provider-agnostic `AiClient`, category/tag + summary suggestions, `POST /api/ai/suggest` | ✅ Complete, tested (backend only — see A2/E1 for the UI gap) |
| Knowledge Base v1.0 | Business Bible, Domain Model, Business Rules, Entity Specifications, Standards, Terminology, Governance, CMS Rules, AI Knowledge, Naming Convention | ✅ Complete |
| Experience & Design v1.0 | Design Principles/System/Tokens, Information Architecture, User Flows, Wireframes, Accessibility Guidelines, Website/Dashboard/Mobile Designs, Prototype spec | ✅ Complete (structurally — B10 blocks final literal values, see C1) |
| Product Integration & Validation | Assembled all three tracks into one product structure; cross-validated entity/page/rule/terminology consistency; found and disclosed 1 broken-link issue | ✅ Complete |
| Phase 1 Platform Implementation Audit | Independently re-verified the entire pipeline (install, lint, typecheck, 350/350 tests, build) and the full database layer (19 migrations, RLS) against a clean environment and a real PostgreSQL 16 instance; fixed 2 real documentation gaps (`.env.example`, `README.md`) | ✅ Complete |
| This Cross-Package Gap Analysis | Verified Design wireframes against actual Development page files; found 3 new Design→Development integration gaps and 1 stale Knowledge Base backlog claim | ✅ Complete (this document's companion) |

---

## Part 2 — Remaining Phases

### Phase 12 — Critical Path to Launch
**Goal:** Get a real, live, secure instance of AHR Platform v1.0 running in production.

| Item | From Gap Report |
|---|---|
| Provision live Supabase project | G1 |
| Deploy to Vercel | G2 |
| Set real `NEXT_PUBLIC_SITE_URL` | G3 |
| Dependency security upgrade (Next.js / `@supabase/ssr`) | A5 / G9 |
| Rate limiting at the edge | G6 |
| Confirm backup/PITR | G7 |
| Monitoring + error tracking tool selection and wiring | G4, G5 |
| Named on-call/support owner | G8 |

**Exit Criteria:** A real, publicly reachable AHR Platform instance running the security-patched codebase, with monitoring, error tracking, rate limiting, and a named support owner all confirmed live — not just planned.

**Execution Order Within Phase 12:** G1 → G2/G3 (parallel) → A5 (can start independently, land before or immediately after G2) → G4/G5/G6/G7 (parallel, all depend only on G1/G2) → G8 (parallel with all of the above, organizational).

---

### Phase 13 — Close the Design→Development Integration Gaps
**Goal:** Build the three pieces of UI that Design has already fully specified but Development has not yet built.

| Item | From Gap Report |
|---|---|
| Media Upload UI | A1 / E2 |
| AI Suggestion Panel UI | A2 / E1 |
| Dashboard Overview screen | A3 |

**Exit Criteria:** All three screens implemented, matching their existing Design specifications exactly, with tests added and the full pipeline (lint/typecheck/test/build) still clean.

**Execution Order Within Phase 13:** A1 → A2 → A3 (no hard dependency between them; ordered by how much of the backend is already sitting unused — A1 and A2 both have complete, tested backends waiting).

**Can run in parallel with Phase 12** — this phase is pure application code and does not require live infrastructure.

---

### Phase 14 — Brand Identity & Design Finalization
**Goal:** Resolve the one blocking business decision and finalize every Design deliverable that depends on it.

| Item | From Gap Report |
|---|---|
| Ratify Brand Identity literal values (B10) | C1 — **blocking, must happen first in this phase** |
| Finalize Design Tokens, Color System, Typography with real values | depends on C1 |
| Finalize Brand Identity, High-Fidelity Designs, UI Kit | depends on C1 |
| Select icon set library | C4 — do after C1 |
| Field-structured Settings editor | A4 (independent of C1, can run in parallel) |

**Exit Criteria:** No Design deliverable references a token name without a ratified literal value; the application's visual layer reflects final brand values, not placeholders.

**Execution Order Within Phase 14:** C1 (stakeholder decision — the critical blocker) → tokens/typography/brand/UI-kit finalization → C4. A4 has no dependency on C1 and can run any time.

---

### Phase 15 — Knowledge Foundation Corrections
**Goal:** Fix the small number of accuracy issues found in Knowledge Foundation documentation.

| Item | From Gap Report |
|---|---|
| Fix 8 broken links in `00-Knowledge-Foundation-Overview.md` | B3 / H1 |
| Correct the stale "Moderation Queue screen" backlog claim | B2 / H2 |
| Author the Award content standard | B1 |
| Stand up a formal cross-track Decision Log | B4 / H3 |

**Exit Criteria:** No stale claim remains in any track's Backlog; every Core Document's internal links resolve; every entity type has its own ratified content standard; one authoritative, dated Decision Log exists tracking every open item from this report.

**Execution Order Within Phase 15:** B3, B2 (trivial, do immediately, no dependency) → B4 (stand up the log so every other phase's decisions get tracked in one place going forward) → B1 (can happen any time, no dependency).

**Should run first, in parallel with everything else** — these are quick, low-risk, and unblock nothing else, but make every other phase's tracking cleaner once done.

---

### Phase 16 — Content Population
**Goal:** Replace placeholder content and populate the platform with real historical archive data.

| Item | From Gap Report |
|---|---|
| Real Home/About page copy | D1 |
| Resolve canonical legacy data source (Blocking Issue B5) | D2 — **blocking, must happen first in this phase** |
| Execute legacy data migration | D3 — depends on D2 |

**Exit Criteria:** No placeholder text remains on any public page; the platform's Archive contains the real, migrated historical dataset, verified against the canonical source.

**Execution Order Within Phase 16:** D1 can happen independently and immediately. D2 (business decision) → D3 (execution) is a hard sequence.

---

### Phase 17 — Deferred Schema Decisions (Database Architecture Review Round)
**Goal:** Make deliberate, reviewed decisions on the items every track already agrees are open, rather than leaving them permanently undecided.

| Item | From Gap Report |
|---|---|
| `ai_recommendation_log` activation | E3 |
| Notification table activation | E4 |
| Organization schema gap activation | E5 |
| Profile Management scope decision | C2 |
| Contact page mechanism decision | C3 |

**Exit Criteria:** Each item has an explicit, dated decision recorded in the Decision Log (Phase 15) — either "approved, scheduled for Phase 18" or "declined, moved to the permanent Backlog" — with nothing left ambiguously "maybe someday."

**Execution Order Within Phase 17:** All five items are independent decisions and can be reviewed in a single Database/Scope Architecture Review session; no sequencing dependency between them.

---

### Phase 18 — Quality Hardening
**Goal:** Close the remaining testing gaps now that a stable, deployed, and mostly-feature-complete v1.0 exists.

| Item | From Gap Report |
|---|---|
| HTTP-level Route Handler test suite | A6 / F1 |
| Automated accessibility testing in CI | A8 / F4 |
| Browser-driven E2E suite | A7 / F2 |
| Coverage threshold as a CI gate | F3 — do last, once the fuller suite exists |
| Execute the rollback drill | F5 — requires Phase 12's live environment |

**Exit Criteria:** CI enforces a coverage floor against a suite that includes HTTP-level and E2E coverage, not just unit-level; accessibility regressions are caught automatically; a rollback drill has actually been run once, successfully, against the live environment.

**Execution Order Within Phase 18:** F5 can happen as soon as Phase 12 completes (doesn't need to wait for the rest of this phase). A6 → A8 (independent, can be parallel) → A7 (larger effort, do after the dependency-upgrade in Phase 12 lands, so E2E tests aren't written against a framework version about to change) → F3 (last, once the suite is at its fuller state).

---

## Part 3 — Recommended Overall Execution Order

```
Immediately, in parallel (no dependencies, all low-risk):
  Phase 15 (Knowledge Foundation Corrections)
  Phase 13 (Design→Development Integration Gaps)
  A5 dependency upgrade (part of Phase 12, but can start immediately as its own workstream)

Next, in parallel:
  Phase 12 (Critical Path to Launch) — once A5 is far enough along not to block deployment
  Phase 14 (Brand Identity & Design Finalization) — gated on the C1 stakeholder decision, which
    should be requested as early as possible since it is a pure calendar/availability dependency,
    not an effort dependency

Next:
  Phase 16 (Content Population) — D2's business decision should also be requested early in parallel
    with the above, since it too is a calendar dependency, not an effort one

Next:
  Phase 17 (Deferred Schema Decisions) — a single review session, can happen any time after
    Phase 15 stands up the Decision Log

Last:
  Phase 18 (Quality Hardening) — deliberately sequenced last because F5 needs Phase 12's live
    environment and A7 benefits from Phase 12's dependency upgrade already having landed
```

**Two items should be kicked off on Day 1 regardless of everything else, because they are calendar/availability dependencies rather than effort dependencies:** the Brand Identity decision (C1) and the legacy data source decision (D2). Both block later work but require zero engineering effort to *request* — the sooner they're asked for, the less they end up as the critical path.

---
**Prepared By:** CTO / Chief Knowledge Officer / Chief Experience & Design Officer / Project Director (this audit)
