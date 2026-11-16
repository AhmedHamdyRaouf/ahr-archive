# AHR Platform v1 — Final Build Manifest

**Status:** 🟡 Working — pending your approval
**Supersedes:** AHR Build Manifest v1 (Release 1 draft)
**Freeze Decision:** AHR Academy and AHR Creative Network are officially postponed to Release 2 and are completely out of scope for Version 1.

This document is the single source of truth for building AHR Platform v1. It is an architecture freeze — no code, no SQL, no APIs, no pages are generated here.

---

## 1. Version 1 Scope Freeze — Module List

Version 1 ships **exactly** these modules and nothing else:

| # | Module | Description |
|---|---|---|
| M1 | Project Foundation | Monorepo, tooling, CI, coding standards |
| M2 | Data Foundation | Database conventions + Archive entity schema |
| M3 | Identity & Access | Administrator-only access, Person/User linkage |
| M4 | Content Services | CRUD + lifecycle for the 11 Archive entities |
| M5 | Administrator Dashboard | The only interface for creating/verifying/publishing/moderating content |
| M6 | Verification & Moderation Governance | Verification authority + moderation workflow |
| M7 | Search & Discovery | Full-text search over published Archive content |
| M8 | Public Experience | Public Archive pages only (Home, About, Works, Work Detail, Projects, Project Detail, Media, Recognition, Contact) |
| M9 | Legacy Data Migration | Import from the Phase 0 legacy archive into the new schema |
| M10 | Minimal AI Assistance | AI Recommendation Model, Archive-scoped only |
| M11 | Security, Observability & Testing | RLS, structured logging, full test coverage of Data Integrity Rules |
| M12 | Operational Readiness & Launch | Go-live checklist, production release |

**Explicitly out of scope for V1:** AHR Academy, AHR Creative Network, any page, route, table, or package referencing either. There is no stub, placeholder route, or "coming soon" page for either module in V1 — their absence is complete, not partial.

---

## 2. Release 2 / Backlog

| Module | Why it's here | What's needed before it can be planned |
|---|---|---|
| **AHR Academy** | Named Platform Component (Phase 1) with legacy CRM/content assets (Phase 0 Audit), but no Information Architecture, Data Architecture, or dedicated Business Logic of its own | Academy-specific IA, Data Architecture, and Business Logic documents, authored and locked the way Archive's were in Phases 3/4/6 |
| **AHR Creative Network** | Named Platform Component (Phase 1) with only Collaboration Logic (Phase 6) — interaction rules, not entities, pages, or a data model | Same as Academy: dedicated IA, Data Architecture, and UX documentation |

Neither module is referenced by, depended on by, or blocking any V1 package below. When Release 2 planning begins, it starts from a fresh Build Manifest pass for these two modules — not from anything in this document.

---

## 3. Frozen Technology Stack

| Layer | Decision | Status |
|---|---|---|
| Repository strategy | Monorepo (npm workspaces) | 🔒 Frozen — ADR-0001 |
| Frontend framework | Next.js | 🔒 Frozen |
| Styling | Tailwind CSS | 🔒 Frozen |
| Database / Backend-as-a-Service | Supabase (Postgres) | 🔒 Frozen |
| Hosting | Vercel | 🔒 Frozen |
| Source control | GitHub | 🔒 Frozen |
| Development tooling | Cursor | 🔒 Frozen |
| API mechanism (Route Handlers vs. Server Actions vs. separate service) | **Not frozen** | 🟡 Open — item B1 |
| Bilingual URL mechanism (path prefix vs. subdomain vs. other) | **Not frozen** | 🟡 Open — item B3 |
| AI model / vendor | **Not frozen** | 🟡 Open — item B6 |

The three open rows are genuine unresolved engineering decisions, not product-scope questions like Academy/Creative Network. Each needs its own single-question engineering decision (the same way Monorepo vs. Polyrepo was decided) before the packages that depend on it can move from Pending to in-progress. They are not guessed here.

---

## 4. Packages — Recalculated Dependencies

Package 7 (Public Experience) is the only package whose scope changes from the previous draft: the Academy and Creative Network stub entry points are removed entirely, not merely marked blocked. No other package depended on either module, so no other dependency graph changes.

| # | Package | Depends On | Academy/CN Dependency? |
|---|---|---|---|
| P1 | Project Foundation | — | None |
| P2 | Data Foundation & Archive Migrations | P1 | None |
| P3 | Identity & Access (Administrator only) | P2 | None |
| P4 | Content Services & Lifecycle | P2, P3 | None |
| P5 | Administrator Dashboard | P3, P4 | None |
| P6 | Verification & Moderation Governance | P4 | None |
| P7 | Search & Discovery | P4 | None |
| P8 | Public Experience (Archive pages only) | P4, P6, P7 | **Removed** — no Academy/CN stub pages in V1 |
| P9 | Legacy Data Migration | P2, P4 | None |
| P10 | Minimal AI Assistance | P4 | None |
| P11 | Security, Observability & Testing Hardening | P3–P10 | None |
| P12 | Operational Readiness & Launch | P1–P11 | None |

Confirmed: with the Academy/Creative Network stub pages removed, **zero packages in V1 reference either module**, directly or transitively.

---

## 5. Master File Manifest — Changes from the Previous Draft

Full per-file detail (File ID, Path, Type, Purpose, Dependencies, Status) for Packages 1–6, 9–12 is unchanged from AHR Build Manifest v1 and is not repeated here to avoid duplication — that document remains the field-level reference. This section records only what changed.

| Change | Detail |
|---|---|
| Removed | `apps/web/app/academy/page.tsx` (was F078) |
| Removed | `apps/web/app/creative-network/page.tsx` (was F079) |
| Renamed | "Package 7 — Public Experience" → **Package 8 — Public Experience**, to match the renumbering below (Administrator Dashboard is inserted as Package 5, shifting everything after it by one) |
| Added (newly named, not newly invented) | Package 5 — Administrator Dashboard is promoted from "blocking gap B7" in the previous draft to a **first-class, required Package** for V1. Its own file manifest cannot be produced yet for the same reason it couldn't before: no page-level specification exists for it the way Sitemap exists for public pages. This remains open — see Section 8. |

**Revised file count for Version 1:** 95 files (97 from the previous draft, minus the two removed stub pages), of which 41 are Done (Packages 1–2) and 54 are Pending/Blocked across Packages 3–12 (including the Administrator Dashboard's file count, which remains at zero until its specification exists).

---

## 6. Final Package Execution Order

```
P1  Project Foundation                         🔒 Done
P2  Data Foundation & Archive Migrations        🔒 Done
P3  Identity & Access (Administrator only)      🟡 Pending — item B4 (Supabase not provisioned)
P4  Content Services & Lifecycle                🟡 Pending — item B1 (API mechanism)
P5  Administrator Dashboard                     🔴 Cannot start — item B7 (no specification exists)
P6  Verification & Moderation Governance        🟡 Pending — item B2 (no Report/ModerationCase entity)
P7  Search & Discovery                          🟡 Pending
P8  Public Experience (Archive pages only)       🟡 Pending — item B3 (bilingual routing), item B10 (visual identity)
P9  Legacy Data Migration                       🟡 Pending — item B5 (canonical CRM version undecided)
P10 Minimal AI Assistance                       🟡 Pending — item B6 (AI vendor undecided)
P11 Security, Observability & Testing Hardening 🟡 Pending
P12 Operational Readiness & Launch              🟡 Pending — may need item B11 (legal deletion procedure)
```

This is a strict sequence: no package starts before the packages it depends on (Section 4) are done, regardless of whether its own blocking item is resolved early.

---

## 7. Definition of Done — Version 1

Version 1 is done when **all** of the following are true simultaneously:

1. **Scope purity**: no code, route, table, or reference to Academy or Creative Network exists anywhere in the codebase.
2. **All 12 packages (P1–P12) are complete** and each has passed the review cycle used throughout this project (Claude review → optional ChatGPT review → explicit approval by the Platform Owner).
3. **The Administrator Dashboard (P5) exists and is the only interface used** to create, verify, publish, and moderate content — no direct database/API access is required for normal operation.
4. **All Testing Architecture layers (Phase 9) pass**: structural integrity, business logic, AI decision boundaries, access control, experience, and accessibility.
5. **The Archive is fully populated** from the legacy sources identified in the Phase 0 Audit, with every migrated record traceable to its original source (Migration Strategy, Phase 9).
6. **Security is enforced by default** (Row-Level Security active on every table) and **observability is live** (every state transition and AI output is logged) per Security Architecture and Observability and Operational Architecture (Phase 8).
7. **Operational Readiness (Phase 9) is formally signed off** by the Platform Owner via the checklist in Package 12.
8. **Items B1, B2, B3, B4, B5, B6, and B7 are all resolved** — none of the "Open"/"Blocked" markers in Sections 3, 4, or 6 remain outstanding. (Items B10 and B11 concern visual launch-readiness and a legal edge case respectively; they do not block code-completeness but do block **public** launch — see note below.)
9. **The production release has been deployed** following Release & Deployment Strategy (Phase 9), and the Platform Owner has given the explicit Delivery Governance approval required by Phase 9.

**Note on B10/B11:** Version 1 can be code-complete and pass every technical Definition-of-Done item above while B10 (final visual identity) and B11 (legal deletion procedure) remain open — the platform simply cannot go **publicly live** until B10 is resolved, and should not accept a real deletion request until B11 is. Both are called out explicitly so "code complete" is never mistaken for "ready to launch publicly."

---

## 8. Remaining Blocking Issues (V1-Scoped)

Academy (B8) and Creative Network (B9) are no longer listed here — they are fully described in Section 2 and do not block V1.

| ID | Issue | Blocks |
|---|---|---|
| B1 | API mechanism (Route Handlers vs. Server Actions vs. separate service) not chosen | Package 4 |
| B2 | No `Report`/`ModerationCase` entity in Entity Catalog (Phase 4) | Package 6 |
| B3 | Bilingual URL mechanism (path prefix vs. subdomain) not chosen | Package 8 |
| B4 | Supabase project not yet provisioned | Package 3, and effectively all packages needing a real environment |
| B5 | Canonical CRM version (of 9 conflicting legacy files) not chosen | Package 9 |
| B6 | AI model/vendor not selected | Package 10 |
| B7 | No Administrator Dashboard page-level specification exists | Package 5 |
| B10 | Visual Identity values (colors, typography, logo) not yet decided | Public launch readiness (not code-completeness) of Package 8 |
| B11 | Legal/compliance procedure for permanent-deletion exception not specified | Package 12 sign-off, only if a real deletion request arises before resolution |

Each of B1, B3, B5, and B6 is a single, narrow engineering or product decision — the same shape as the Monorepo vs. Polyrepo decision already made — and can be resolved individually without reopening any other part of this manifest.

---

**Status:**
🟡 Working — pending your approval

**Prepared By:**
Claude

**Approved By:**
Pending
