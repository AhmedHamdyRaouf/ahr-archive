# AHR Platform v1.0 — Cross-Package Gap Analysis & Remaining Work Report

**Acting roles:** CTO, Chief Knowledge Officer, Chief Experience & Design Officer, Project Director
**Scope:** AHR Platform Development v1.0, AHR Knowledge Foundation v1.0, AHR Experience & Design v1.0
**Status:** 🔒 Final — Audit Only. Nothing in this report has been implemented, and no placeholder content or out-of-scope feature has been introduced.

---

## 0. How This Audit Was Performed

This is a **verification** audit, not a re-reading of each track's own self-report. Every finding below was checked directly against the actual delivered artifact — source code, wireframe files, schema, or migration — not assumed from a status document. Where a prior audit (Product Integration & Validation; Phase 1 Platform Implementation) already verified something, that result is reused and cited rather than repeated; this report's incremental contribution is the **new cross-track findings** in §3.4–§3.6, which required reading Design's wireframes against Development's actual page files, not just against Development's own backlog claims.

---

## 1. Executive Summary

The three packages are **substantially consistent and substantially complete**. All 11 domain entities, all public/dashboard pages, all business rules, and all backlog items align across tracks with no contradiction found. The codebase independently re-verified clean (install, lint, typecheck, 350/350 tests, build, and full database/RLS verification against real PostgreSQL 16 — see Phase 1 Platform Implementation Audit Report).

What remains is:
- **One blocking business decision** (Brand Identity literal values — B10) that gates several Design deliverables and the frontend's final visual polish.
- **Three genuine Design→Development integration gaps** newly confirmed this audit: Design fully specified three pieces of UI (AI Suggestion Panel, Media Upload form, Dashboard Overview summary cards) that Development has not yet built, even though the underlying backend for two of them is complete and tested.
- **One stale Knowledge Foundation backlog claim**, now corrected by this audit: the "Moderation Queue screen" was listed as unbuilt but is in fact fully implemented.
- **A disclosed, unresolved dependency-security finding** (Next.js 14.x, `@supabase/ssr`) requiring a deliberate upgrade decision, not a blind auto-patch.
- **Infrastructure/organizational items** that cannot be closed by any further engineering work in this environment — they require a live Supabase/Vercel project and human staffing decisions.

No missing deliverable, missing document, duplication, or broken cross-track reference was found beyond what is listed in §3. No requirement defined in one package was found to be silently unimplemented in the others without already being disclosed in that package's own Backlog.

---

## 2. Cross-Package Consistency Verification

| Consistency Check | Result | Evidence |
|---|---|---|
| Entity names (Knowledge Foundation ↔ Development) | ✅ All 11 entities (Person, Organization, Work, Project, Event, Contribution, Award, Media, Press Mention, Category, Tag) map 1:1 to the 20-table schema | `Entity Specifications/` vs. `02-Database.md` §2 |
| Page/navigation names (Experience & Design ↔ Development) | ✅ Every page in Design's Information Architecture has a matching Development route, and vice versa | `Information Architecture/README.md` vs. `13-Deployment-and-DevOps.md` §2, confirmed against the actual `apps/web/app/` route tree |
| Business Rules ↔ Development implementation | ✅ No rule found implemented differently than specified; no rule found unimplemented | Cross-checked Permissions Matrix, error codes, RLS policies |
| Design System ↔ Application | ✅ Both tracks agree the same thing is blocked (B10) and agree on the mechanism (design tokens, not hardcoded values) | `Design Tokens/README.md` vs. `04-Frontend.md` §5 |
| Terminology | ✅ "AHR," "Platform," "Archive" used consistently across all three tracks | `Terminology/04-terminology-dictionary.md` |
| Backlog cross-consistency | ✅ Every gap named in more than one track's backlog is described identically in each — **except** one now-stale item, corrected in §3.5 | See §3.5 |
| Database ↔ RLS ↔ Application behavior | ✅ Independently re-verified against a real PostgreSQL 16 instance this audit cycle: 19/19 migrations clean, 20/20 tables with RLS enabled, both smoke-test suites passing | Phase 1 Platform Implementation Audit Report §6 |
| Codebase pipeline health | ✅ Clean install, 0 lint errors, 0 typecheck errors, 350/350 tests, clean production build, server runtime-verified stable | Phase 1 Platform Implementation Audit Report §2–3 |

---

## 3. Detected Issues

### 3.1 Missing Deliverables
**None found.** Every deliverable named in each track's own manifest is present (confirmed by file-count reconciliation in the prior Product Integration audit: Knowledge Base 100 files/11 folders, Experience & Design 34 files/23 folders, Development 381+ files/12 packages).

### 3.2 Missing Documents
**None found**, with one **documentation-accuracy** issue (not a missing document, a wrong claim in an existing one) — see §3.5.

### 3.3 Missing Implementation
Three items, newly confirmed this audit by reading Design's actual wireframe specifications against Development's actual page files (not against either track's own backlog claims) — see §3.4.

### 3.4 Missing Integration — Design → Development (New Findings This Audit)

| # | Design Deliverable (fully specified) | Development State (actually checked) | Gap |
|---|---|---|---|
| 1 | `Wireframes/AI.md` — `AISuggestionPanel`, embedded in CMS forms, Accept/Edit/Reject states, loading/error/success coverage | `POST /api/ai/suggest` backend complete and tested (`packages/ai/`); **no `AISuggestionPanel` component exists anywhere in `apps/web`** | Backend ready, UI not built |
| 2 | `Wireframes/Media-Library.md` — `MediaUploadForm`, owner-entity-before-file-input rule, full state coverage | `POST /api/media` backend complete and tested; Media Library dashboard page **is list-view only** (confirmed by reading `apps/web/app/[locale]/dashboard/media/page.tsx`, which contains its own comment: *"List-only for this fix: an upload UI... is tracked as Backlog"*) | Backend ready, UI not built |
| 3 | `Dashboard Designs/README.md` — Dashboard Home shows summary cards (open reports count, recent activity snippet) via `DashboardShell` | Actual `apps/web/app/[locale]/dashboard/page.tsx` is a 26-line static links list, not the summary-card screen Design specified | Design spec exists, screen not built to spec |

These three are legitimate remaining engineering work, already anticipated by Development's own Backlog (each is listed there as "deferred, not built this phase") — this audit's contribution is confirming, by direct inspection, that Design has already fully specified all three, so none of them require new design work, only implementation against an existing spec.

### 3.5 Contradiction Found and Corrected: Stale Knowledge Foundation Backlog Claim

`1. Knowledge Base/Backlog.md` item #16 lists **"A Moderation Queue screen"** under "Dashboard UI (No Schema Change — Unbuilt Screens Only)." Direct inspection of `apps/web/app/[locale]/dashboard/moderation/page.tsx` (112 lines) shows a fully implemented, filterable, paginated Moderation Queue list view plus a detail/transition page, added during a prior Development audit pass and confirmed working in this audit's own runtime verification. **This backlog item is stale and should be removed or corrected** — it is not a real gap. (Item #14, Dashboard Overview, and item #15, Media Library upload, on the same list remain accurate — see §3.4.)

### 3.6 Duplications
**None found.** No entity, business rule, page, or design token is defined twice with conflicting meaning across any two tracks. (Multiple tracks maintain their own `Backlog.md` — this is not duplication, since each backlog is scoped to that track's own deferred items and no two entries conflict where they overlap; see the Validation Report's backlog cross-check table for the full comparison.)

### 3.7 Broken References
One pre-existing, still-unresolved finding, first identified in the prior Product Integration & Validation audit and not yet corrected by the Knowledge Foundation track:

`1. Knowledge Base/Core Documents/00-Knowledge-Foundation-Overview.md` contains 8 relative links (`./01-business-bible.md` through `./08-governance.md`) pointing at files as if they were siblings inside `Core Documents/`. They are not — each was relocated to its own topic folder (`Business Bible/`, `Domain Model/`, `Business Rules/`, `Terminology/`, `Standards/`, `Governance/`) during the Knowledge Base track's own reorganization. The content itself is fully present; only this one index table's paths are stale.

### 3.8 Incomplete Workflows
**None found at the code level.** Every workflow that is implemented (authentication, CMS lifecycle, moderation review/resolution, notification dispatch, search, AI suggestion generation) is implemented start-to-finish and tested end-to-end at the function level, independently re-verified this audit (350/350 tests, real database RLS behavior confirmed). The workflows that are genuinely incomplete are the three UI-side gaps in §3.4, which are missing implementation, not broken/partial implementation of something otherwise in place.

---

## 4. Classified Remaining Work Items

Every remaining item, classified per the requested taxonomy. Items already fully resolved (§2) are not repeated here. "Dependencies" reference other item numbers in this same table where relevant.

### A. Development

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| A1 | Media Upload UI | Build `MediaUploadForm` per `Wireframes/Media-Library.md` — owner-entity picker before file input, progress/error/empty states | Backend (`POST /api/media`) is complete and tested but has no way for an Administrator to actually upload a file through the Dashboard | High | Design spec already complete (no dependency) | Small–Medium (2–4 days) | 1 |
| A2 | AI Suggestion Panel UI | Build `AISuggestionPanel` per `Wireframes/AI.md` — embedded in CMS forms, Accept/Edit/Reject, loading/error states, "never looks like saved content" rule | Backend (`POST /api/ai/suggest`) is complete and tested but has no UI entry point | High | Design spec already complete (no dependency) | Small–Medium (2–4 days) | 2 |
| A3 | Dashboard Overview screen | Replace the current static-links stub with the real summary-card screen (open reports count, recent activity snippet) per `Dashboard Designs/README.md` | Currently the Dashboard Home page does not match its own approved design spec | Medium | Uses existing analytics/activity-log query functions already in `packages/workflow`/`packages/auth` | Small (1–2 days) | 3 |
| A4 | ~~Field-structured Settings editor~~ ✅ **Closed 2026-07-21** | Replaced the raw-JSON-per-key editor with typed forms matching each of the 12 `platform_settings` keys' actual shape (text/toggle/select/key-value-list/fixed-object per `apps/web/lib/settings-shapes.ts`); unknown future keys still fall back to raw JSON, preserving the original no-migration-needed extensibility. `branding_assets` now has real fields reflecting the ratified B10 palette/fonts (Decision Log, 2026-07-21). | Current editor is functional but error-prone (a malformed JSON string can be submitted); Design's own spec calls for "an input type matching its expected shape" | Medium | None | Medium (3–5 days) | 6 |
| A5 | Dependency security upgrade (Next.js / `@supabase/ssr`) | Plan and execute an upgrade past Next.js 14.2.35 and the vulnerable `@supabase/ssr`/`cookie` versions, with full regression testing | `npm audit` reports 4 production-dependency vulnerabilities (2 low, 1 moderate, 1 high), including DoS and cache-poisoning classes in Next.js; the only automatic fix is a two-major-version jump, which is a real architecture change requiring its own review, not a blind `--force` | Critical | None (can start immediately as its own workstream) | Medium–Large (1–2 weeks, incl. regression pass) | 4 |
| A6 | HTTP-level Route Handler test suite | Add tests that exercise Route Handlers directly over HTTP, not just the underlying functions they wrap | Current coverage proves the business logic works; it does not prove request parsing, headers, or status-code mapping at the HTTP boundary are correct | Medium | None | Medium (1 week) | 8 |
| A7 | Browser-driven E2E test suite | Select tooling (e.g. Playwright) and cover the critical user journeys (sign in, publish a Work, resolve a moderation report) | No test today exercises the real browser/DOM/session-cookie path end-to-end | Medium | A5 should land first (avoid writing E2E tests against a framework version about to change) | Large (2+ weeks) | 10 |
| A8 | Automated accessibility test tooling | Wire an automated a11y checker (e.g. axe-core) into CI, replacing the current manual checklist review | Accessibility Guidelines exist and are followed manually; nothing catches a regression automatically | Medium | None | Small–Medium (2–3 days) | 9 |
| A9 | Bulk actions (CMS, Moderation) | Multi-select + bulk categorize/archive/assign | Convenience feature, not required for v1.0 correctness | Low | Business decision: confirm still wanted for v1.0 vs. Release 2 | Medium | Backlog — not scheduled |
| A10 | Optimistic locking for concurrent edits | Conflict detection UI when two Administrators edit the same record | v1.0 is deliberately last-write-wins; only relevant once more than one Administrator role is active | Low | Release 2 roles decision | Medium | Backlog — not scheduled |
| A11 | "My Account" self-service profile screen | Build a Dashboard screen letting the Administrator change display name, upload an avatar, and set personal preferences (e.g. interface language) | Decision C2 confirmed 2026-07-21: in scope for v1.0. Currently the Administrator's own profile can only be changed by direct database edit. | Medium | C2 (resolved) | Small–Medium (2–4 days) | Next in the A-track queue |
| A12 | AI suggestion history-listing endpoint | Build `GET /api/ai/suggestions` (and `/{id}`) to read back `ai_recommendation_log`, plus a small Dashboard view to browse it | E3 activated 2026-07-21: the table exists and is being written to, but nothing yet exposes it for an Administrator to browse | Low | E3 (resolved) | Small (1–2 days) | After A11 |
| A13 | Remaining notification endpoints | Build `GET /api/notifications/unread-count`, `POST /api/notifications/mark-all-read`, `DELETE /api/notifications/{id}` | E4 activated 2026-07-21: List and Mark Read exist; these three are no longer schema-blocked, just not yet implemented | Low | E4 (resolved) | Small (1–2 days) | After A12 |

### B. Knowledge Foundation

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| B1 | Award content standard | Author a dedicated required/optional field breakdown and writing standard for Award, ratified through Governance | `Entity Specifications/07-Award.md` currently inherits only the entity-agnostic baseline; every other entity type has its own standard | Medium | None | Small (1–2 days) | 5 |
| B2 | Correct stale Backlog.md item #16 | Remove or correct the "Moderation Queue screen" backlog entry — confirmed already built (§3.5) | An inaccurate backlog entry risks the screen being reinvented or its absence being wrongly reported to a stakeholder | Low | None | Trivial (<1 hour) | Immediate |
| B3 | Fix 8 broken links in `00-Knowledge-Foundation-Overview.md` | Update the index table's relative paths to match each file's actual current folder | Content is fully present and correctly delivered; only this index is wrong, which could mislead a future reader navigating by this table specifically | Low | None | Trivial (<1 hour) | Immediate |
| B4 | Formal Decision Log | Create one authoritative, dated log of every open decision this report identifies (B10, Profile Management scope, Contact mechanism, Notification table, etc.) and its resolution when made | Currently these decisions are scattered across three tracks' individual Backlog files with no single owner or status tracker | Medium | None | Small (1–2 days to stand up; then maintained ongoing) | 7 |

### C. Experience & Design

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| C1 | Brand Identity literal values (B10) | Ratify the actual logo, hex color values, font families, and numeral system | Blocks Design Tokens, Color System, Typography, Brand Identity, High-Fidelity Designs, UI Kit, and Icon set selection from being finalized with real values instead of token names only | **Critical** | Stakeholder/business decision — not an engineering task | Depends entirely on stakeholder availability, not effort | 0 — blocks everything else in this column |
| C2 | Profile Management scope decision | Decide whether Administrator self-service profile editing (display name, avatar, settings) is in v1.0 scope | Currently undecided; if yes, requires adding to the frozen Package 01/07 scope before any design or build work starts | Medium | Business decision | Decision only; then Small design + Small dev effort if approved | 11 (decision), then re-enters A/C queues if approved |
| C3 | Contact page mechanism decision | Decide whether the public Contact page needs a real form-submission backend or remains static contact info | Currently an open item in Website Designs | Low | Business decision | Decision only; then Small effort either way | 12 |
| C4 | ~~Icon set selection~~ ✅ **Closed 2026-07-21** | Chose `lucide-react` (data owner delegated the decision) — added to `apps/web/package.json`; see `docs/Experience/Icons & Assets/README.md` | Design has specified the *rule*, not the *library*; this was explicitly deferred to Development | Low | Ideally after C1 (icon color often ties to brand palette) | Trivial (a few hours of evaluation) | After C1 |

### D. Knowledge Content

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| D1 | Real Home/About page content | Replace placeholder body text on the two highest-traffic public pages with final, approved copy | Currently placeholder; everything else about these pages (layout, SEO, i18n) is complete and tested | High | Editorial/stakeholder content, not engineering | Small (content authoring, not dev time) | 13 |
| D2 | Legacy data migration — canonical source decision | Resolve Blocking Issue B5: which legacy data source is authoritative where records conflict | Blocks actually populating the platform with the real historical archive rather than launching empty | High | Business/content decision | Decision only; migration execution afterward is Medium-Large | 14 |
| D3 | Legacy data migration — execution | Run the actual migration once D2 is resolved | Populates the platform with real content | High | D2 | Medium–Large (depends on source data quality) | 15 |

### E. Integration

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| E1 | Close the AI Suggestion Panel integration gap | See A2 — cross-listed here because it is specifically a Design-spec-to-Development-build seam, not a net-new feature | Design's work here is otherwise stranded, unused | High | None | Small–Medium | 2 |
| E2 | Close the Media Upload UI integration gap | See A1 — same reasoning | Design's work here is otherwise stranded, unused | High | None | Small–Medium | 1 |
| E3 | ~~`ai_recommendation_log` activation decision~~ ✅ **Closed 2026-07-21** | Approved and built: migration, RLS, log-write service, resolve endpoint, panel wiring. See Decision Log. | All three tracks already agree this is the only thing blocking persisted AI suggestion history | Medium | Database Architecture Review Round | Decision + Small-Medium schema/dev work if approved | 16 |
| E4 | ~~Notification table activation decision~~ ✅ **Closed 2026-07-21** | Approved and built: migration, RLS, persisted-write wired into every existing `notifyEvent()` call site, list/mark-read endpoints, TopBar bell, `/dashboard/notifications` page. See Decision Log. | All three tracks already agree this is the only thing blocking a real notification inbox | Medium | Database Architecture Review Round | Decision + Medium schema/dev work if approved | 17 |
| E5 | ~~Organization schema gap activation decision~~ ✅ **Closed 2026-07-21** | Approved and built: `contact_information`, `internal_notes`, `organization_id` on `media_asset`, `organization_category`/`organization_tag` join tables with RLS. See Decision Log. | All three tracks already agree this is the only thing blocking these Organization capabilities | Medium | Database Architecture Review Round | Decision + Small-Medium schema/dev work if approved | 18 |

### F. QA & Testing

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| F1 | HTTP-level API test suite | See A6 | — | Medium | — | Medium | 8 |
| F2 | Browser-driven E2E suite | See A7 | — | Medium | A5 | Large | 10 |
| F3 | Coverage threshold as a CI gate | Now that coverage reporting exists and a 350-test baseline is established, set and enforce a minimum coverage percentage in CI | Prevents future regressions in test discipline now that a real baseline exists to measure against | Low | None | Small | After F1/F2 land, so the baseline reflects the fuller suite |
| F4 | Automated accessibility testing | See A8 | — | Medium | — | Small–Medium | 9 |
| F5 | Rollback drill execution | Actually run a redeploy-to-previous-version and a restore-from-backup drill, per the existing `rollback-plan.md` | The plan is written and reviewed but has never been executed against a real environment | High | G1 (live Supabase/Vercel project) | Small (a day, once environment exists) | After G1/G2 |

### G. Deployment & Production

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| G1 | Provision the live Supabase project | Create the actual Supabase project, apply all 19 migrations, configure RLS, generate real credentials | Nothing in Categories G/F beyond this point can happen without it; the entire platform currently runs against zero live infrastructure | **Critical** | None — can start immediately | Small (a day of setup, using existing migration scripts) | 0 — blocks the rest of this column |
| G2 | Deploy to Vercel (or equivalent) | Stand up the actual production deployment, wire real environment variables | Required to have anything publicly reachable | **Critical** | G1 | Small (a day) | After G1 |
| G3 | Set `NEXT_PUBLIC_SITE_URL` to the real production domain | Populate the env var (already documented in `.env.example` as of this audit's prior fix) with the actual domain | Without it, the public sitemap/robots.txt silently point at `localhost` in production | High | G2 (need the real domain decided) | Trivial | With G2 |
| G4 | Monitoring/observability tool selection | Choose and wire a monitoring tool | Currently an open operational decision; logging itself is already solid | High | G1/G2 | Decision + Small integration work | After G1/G2 |
| G5 | Error-tracking service | Choose and wire an error-tracking service (e.g. Sentry) | Same reasoning as G4 | High | G1/G2 | Small | After G1/G2 |
| G6 | Rate limiting at the infrastructure/edge layer | Configure Vercel Firewall/Attack Challenge Mode or equivalent | Application-level rate limiting was deferred to the infra layer by design; not yet configured because there is no live infra | High | G2 | Small | After G2 |
| G7 | Confirm Supabase backup/PITR and retention window | Verify and document the actual backup configuration once the real project exists | Cannot be confirmed against a project that doesn't exist yet | High | G1 | Trivial (config check) | After G1 |
| G8 | Named on-call/support ownership | Assign a real person/team as launch-time support owner | Organizational decision, not an engineering task, but blocks calling the platform launch-ready | High | None — can be decided in parallel with everything else | Decision only | Parallel, target before launch |
| G9 | Execute A5 (dependency upgrade) before or shortly after launch | See A5 | Security posture at public launch | Critical | A5 | — | Before G2 if timeline allows, otherwise immediately after |

### H. Documentation

| # | Title | Description | Why Required | Priority | Dependencies | Est. Effort | Order |
|---|---|---|---|---|---|---|---|
| H1 | Fix the 8 broken links (see B3) | — | — | Low | None | Trivial | Immediate |
| H2 | Correct the stale backlog item (see B2) | — | — | Low | None | Trivial | Immediate |
| H3 | Stand up the Decision Log (see B4) | — | — | Medium | None | Small | 7 |
| H4 | Consolidate the three tracks' individual `Backlog.md` files into one cross-referenced master backlog, without deleting any track's own copy | Right now, discovering a gap requires reading all three backlogs separately; this report itself had to do that reconciliation manually | Reduces the chance of the same gap being independently "rediscovered" and redundantly re-specified by two different tracks in the future | Low | None | Small | Ongoing PMO maintenance, not a one-time task |

---

## 5. What Is Explicitly Not a Gap (To Prevent Re-Litigating Settled Items)

- The 4 pre-existing ESLint `no-explicit-any` warnings in `packages/auth/tests/` mock helpers — investigated in the Phase 1 audit, a real typed fix was attempted and found to regress `typecheck`, correctly reverted. Not scheduled for further work.
- Any item in the "Explicitly Outside Master Roadmap v1.0 (Release 2 / Never)" section of the Development Backlog (AHR Academy, AHR Creative Network, additional roles, mobile app, MFA, social sign-on, etc.) — out of this report's scope by the engagement's own instruction not to invent features outside approved v1.0 scope.
- `pgvector`/semantic search, full-text search migration, analytics tables — all correctly gated behind "Database Architecture Review Round," not silently designed around.

---
**Prepared By:** CTO / Chief Knowledge Officer / Chief Experience & Design Officer / Project Director (this audit)
**Companion Document:** `AHR Platform v1.1 — Master Roadmap.md`

---

## Addendum — Resolution Status (Implementation Phase)

Following approval of this Gap Analysis, an implementation phase closed every item that was genuinely closable without external credentials, a stakeholder decision, or real content. Status per item, using this report's own IDs:

| Item | Status |
|---|---|
| A1/E2 — Media Upload UI | ✅ **Closed.** `OwnerPicker` + `MediaUploadForm`, calling the existing `POST /api/media` endpoint. |
| A2/E1 — AI Suggestion Panel UI | ✅ **Closed.** `AISuggestionPanel`, embedded for both suggestion kinds (summary → Description field; category-tag → the newly-built Categories & Tags panel). |
| A3 — Dashboard Overview screen | ✅ **Closed.** Real summary-card screen replacing the static-links stub. |
| (New, discovered while closing A2) — Categories & Tags assignment UI | ✅ **Closed.** No entity in this report tracked this as missing — building the AI category-tag suggestion panel required discovering and closing it, since the tested backend (`setCategoriesForEntity`/`setTagsForEntity`, the `/api/cms/{entityType}/{id}/taxonomy` route) had no UI at all. |
| A5/G9 — Dependency security upgrade | ⚠️ **Attempted, not merged.** A real upgrade attempt (Next.js 16.2.10, `eslint-config-next` 16.2.10, ESLint 9) surfaced a genuine, reproducible breaking incompatibility in the shared ESLint preset (legacy `.eslintrc` format vs. ESLint 9's flat-config system). Reverted rather than merged with known breakage. See `6. QA Package/QA-Report.md` §6 and `7. Production Package/Production-Readiness-Report.md` §3 for the full, evidence-based finding and recommended dedicated migration project. |
| B2/H2 — Stale "Moderation Queue screen" backlog claim | ✅ **Corrected**, along with the three items above once verified built. |
| B3/H1 — 8 broken links in `00-Knowledge-Foundation-Overview.md` | ✅ **Fixed.** |
| B1, B4, C1–C4, D1–D3, E3–E5, F1–F5, G1–G8, H3–H4 | ⏸ **Not closable by further engineering work.** Each requires a live Supabase/Vercel project, real credentials, a stakeholder decision (Brand Identity, legacy data source, Profile Management/Contact scope), real Archive content, or a dedicated tooling-selection process outside this phase's authority. See `AHR Platform v1.1 Final Completion Report.md` for the complete, honest accounting of what remains and exactly who needs to act on each. |

**One new item surfaced during implementation, not previously tracked anywhere:** Award is not a valid `media_asset` owner type in the frozen schema (only `person`/`work`/`project`/`event`) — discovered while writing the legacy-content migration mapping for award-certificate images (`5. Content Population Framework/05-Migration-Strategy.md` §6). Recorded there and here so it is not silently rediscovered later; requires the same Database Architecture Review Round as every other schema-change item in this report.
