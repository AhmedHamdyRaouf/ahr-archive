# AHR Platform v1 — Testing Specification

**Status:** 🔒 Final (CTO Deliverable, v1.0)

---

## 1. Testing Priority Principle

A test that verifies a Data Integrity Rule, Business Rule, or AI Decision Boundary is a higher-priority test than one that merely exercises code paths — testing priority follows the same priority the architecture itself established (Development Principles §6). Tests exist to prove the architecture holds, not just that the code runs.

## 2. Required Verification Layers

| Layer | Verifies compliance with |
|---|---|
| Structural integrity | Data Integrity Rules, Relationship Model — no data can be saved that breaks a mandatory relationship |
| Business logic | Business Rules, Entity Lifecycles & State Transitions — no status transition without its approved condition |
| AI decision boundaries | AI Decision Boundaries — no autonomous action exceeds the approved human-review exception |
| Access control | Identity and Access Architecture, Ownership Rules — no access exceeds the authorized role |
| Experience | UX Principles — every approved user journey is actually completable as described |
| Accessibility | Design System Foundations (Accessibility) — minimum contrast and screen-reader support |

**Continuous, not one-time:** every layer above runs with every implementation change, not as a single pre-launch step.

**Fail-safe principle:** a failing test in a critical layer (data integrity, business logic, AI decision boundaries) automatically blocks promotion to the next environment (`13-Deployment-and-DevOps.md` §3) — this is not left to individual judgment call.

## 3. Current Automated Test Coverage (As Built)

| Package | Test count | Verifies |
|---|---|---|
| `@ahr/auth` | 34 | Session resolution chain, role/capability lookup, activity logging (mocked Supabase, no live project required) |
| `@ahr/cms-core` | 51 (49 + 2 added with the transition-history fix) | Generic lifecycle graph, no-skip-a-stage guarantee, soft/hard delete rules, `entity_state_transition` write-on-transition |
| `@ahr/content` | 40 | Per-entity `ResourceDefinition`s, Contribution/Press Mention "exactly one" rules, taxonomy domain scoping |
| `@ahr/media` | 39 | Path construction, MIME/type validation, exactly-one-owner rule, storage abstraction (mocked) |
| `@ahr/relationships` | 33 | Taxonomy join services, hierarchy walks (cycle-safe), state-history reads |
| `@ahr/search` | 25 | Relevance scoring, five documented search endpoints |
| `@ahr/workflow` | 25 | Moderation report lifecycle, resolution/assignment validation |
| `@ahr/notifications` | 32 | Template rendering, provider dispatch, per-channel failure isolation |
| `@ahr/site` | 33 | Bilingual routing, SEO/sitemap building, public-settings allowlist |
| Database (`packages/database/tests/smoke-test.sql`) | 1 transactional smoke suite | Structural integrity directly against a real Postgres instance (see §4) |

Every package's test suite runs via `npm run test --workspace=packages/<name>`, and the full suite runs via `npm run test --workspaces --if-present` in CI (`13-Deployment-and-DevOps.md` §4).

## 4. Database Smoke Test — What It Actually Proves

`packages/database/tests/smoke-test.sql` runs against a real Postgres instance (any environment, including production) and verifies, then rolls back in a transaction so it leaves no data behind:

- `contribution` rejects a row with no Work/Project/Event target.
- `media_asset` rejects zero owners and rejects two simultaneous owners, accepting only exactly one.
- `ON DELETE RESTRICT` blocks deleting a `person` row still referenced elsewhere.
- The shared `updated_at` trigger actually advances the timestamp.
- The `status` `check` constraint rejects a value outside the approved lifecycle sequence.
- `platform_user` enforces a 1:1 Person↔User relationship and rejects roles not yet valid in v1.
- `moderation_report` and `activity_log` reject invalid status/action values.
- `platform_settings` is seeded correctly with its initial keys.

This is the structural-integrity layer's authoritative, environment-real proof — unit tests elsewhere mock the database client surface; this suite does not.

## 5. Testing Discipline Rules

- No live Supabase project is required for package unit tests — every test mocks the Supabase client/Storage surface the package actually calls, so the full suite runs without provisioning infrastructure.
- Typecheck (`npm run typecheck --workspaces --if-present`) is treated as a required check, not optional, in the same CI run as tests (`13-Deployment-and-DevOps.md` §4).
- A synthetic, deliberately-not-business-named `ResourceDefinition` (e.g., `sample_generic_entity`) is used to test `@ahr/cms-core`'s generic engine — proving the engine is genuinely entity-agnostic, not accidentally coupled to a real entity's shape.

## 6. Definition of Done (v1) — Testing-Relevant Criteria

Carried forward from the Final Build Manifest, restated here only for the testing-relevant subset (full Definition of Done: `13-Deployment-and-DevOps.md` §6):

- All Testing Architecture layers (§2) pass: structural integrity, business logic, AI decision boundaries, access control, experience, accessibility.
- Security is enforced by default (RLS active on every table) and observability is live (every state transition and AI output logged) — verified, not assumed.
- Every migrated legacy record is traceable to its original source.

## 7. Code Review as a Testing Gate

The following are code-review-blocking, not merely "nice to have," per Development Specification:
- A new foreign key without its corresponding index.
- A list view fetching related data with an N+1 query pattern instead of a single batched query.
- A Route Handler containing inline business-rule or validation logic instead of delegating to its owning package.
- A test suite change that reduces coverage of a Data Integrity Rule or Business Rule without an explicit, reviewed justification.

## Backlog

- Automated accessibility test tooling (currently a manual review checklist item; no automated a11y test runner is wired into CI as of this document).
- End-to-end (browser-level) test automation for full user journeys — current coverage is unit/integration-level per package plus the database smoke test, not a browser-driven E2E suite.
- Load/performance testing under realistic traffic, ahead of public launch.

---

**Prepared By:** CTO Office
**Approved By:** Pending Platform Owner sign-off
**Dependencies:** Testing Architecture (Phase 9); Development Principles (Development Specification 01); package READMEs (all `packages/*`); `packages/database/tests/smoke-test.sql`
