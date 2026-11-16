# Addendum to 14-AI-Integration.md — Implementation Note

**Added:** Development Audit (Development track), following CTO Final (Phase 3) Deliverables
**Purpose:** `14-AI-Integration.md` is preserved unedited in this folder as the original, historical specification. This addendum records what actually changed since it was written — it does not replace or contradict that document; every decision boundary, scope limit, and security control `14-AI-Integration.md` specifies is unchanged and was verified, not revised, during implementation.

---

## What Changed

`14-AI-Integration.md` §4 stated: *"Not yet built... this document specifies the target implementation so the eventual build is traceable to an approved specification, not built ad hoc when the time comes."*

**As of this Development Audit, it is built**, exactly to that specification:

- `packages/ai` (`@ahr/ai`) implements the `aiClient` abstraction (§6), the two in-scope suggestion kinds (§1), the four governing decision boundaries (§2) verified by direct test coverage, the security/cost controls (§7), and the interim logging approach (§8).
- `POST /api/ai/suggest` implements the Route Handler `07-API.md` §11 already named as "planned."
- The `ai:suggest` capability was added to `@ahr/auth`, filling in the one missing piece of the Permissions Matrix row `08-Authentication-and-Authorization.md` §5 already specified.

## What Did Not Change

- **The schema gap (§5) is still open.** No `ai_recommendation_log` table was added. AI suggestions remain ephemeral, exactly as §5 predicted — this was a documented, accepted consequence of the frozen schema, not something implementation was expected to solve on its own.
- **The UX contract (§9) is not yet realized in any UI.** No CMS form currently surfaces a suggestion panel. Building that surface belongs to the Experience & Design track, not the Development track this audit covers — §9's visual-contract rule (never mistakable for saved content) still governs whenever that UI is eventually built.
- **Every Decision Boundary in §2 held exactly as specified**: no autonomous write exists anywhere in `@ahr/ai`'s code; every output carries a rationale and confidence level; every prompt is built from only the given entity's own fields; a human (the Administrator, via whatever UI eventually calls this API) remains the only path from a suggestion to a real effect.

## Where to Look

- Package: `packages/ai/` (`README.md` for the package-level summary, `docs/blocked-persistence.md` for the schema-gap detail).
- Route: `apps/web/app/api/ai/suggest/route.ts`.
- Tests: `packages/ai/tests/` (31 tests, all mocking the `AiClient` interface — no live OpenAI key required to run them).
- Full narrative: `Development Status Report.md`, §2.1, in this same delivery.
