# AHR Platform v1 — Release Checklist

**Added:** Phase 3 CTO Audit (Deployment & Production Readiness Review). No release checklist existed in the project before this document.
**Use:** Complete every item before merging `staging → main` and deploying to production. This operationalizes `13-Deployment-and-DevOps.md` §6–§10 (Release & Deployment Principles, Definition of Done, Delivery Governance) as a concrete, repeatable checklist — it does not add any new gate beyond what those sections already require.

---

## Pre-Merge (on the `staging` branch)

- [ ] CI is green on `staging`: both the `verify` job (format, lint, typecheck, test, build) and the `database-verify` job (migrations + both smoke tests against a real Postgres instance).
- [ ] Every Testing Architecture layer relevant to this release's changes passes (`12-Testing.md` §2): structural integrity, business logic, access control — and AI decision boundaries / experience / accessibility if the release touches those areas.
- [ ] If this release adds or changes a database migration: it has been applied to staging's Supabase project and both smoke tests (`smoke-test.sql`, `rls-smoke-test.sql`) have been run against it.
- [ ] If this release touches Data Integrity Rules, Business Rules, or expands anything toward AI Decision Boundaries: an architecture review has happened and is referenced in the PR description (`13-Deployment-and-DevOps.md` §10).
- [ ] No code, route, table, or reference to AHR Academy or AHR Creative Network has been introduced (v1 scope purity, `13-Deployment-and-DevOps.md` §7 item 1).
- [ ] No feature outside Master Roadmap v1.0 has been introduced; anything adjacent is in a Backlog section of the relevant CTO Deliverable, not implemented.

## Merge to `main`

- [ ] PR is reviewed and approved per the normal code-review gate (`12-Testing.md` §7 — no foreign key without an index, no N+1 pattern, no inline business logic in a Route Handler, no unjustified drop in test coverage of a Data Integrity Rule or Business Rule).
- [ ] Merge is a fast-forward or a clean merge commit from `staging` — no direct, un-reviewed commit to `main`.

## Production Deployment

- [ ] Environment Variables for Production are confirmed current in Vercel (`deployment-guide.md` §3) — especially if this release adds a new one.
- [ ] If this release includes a new database migration: it is applied to **production's** Supabase project, in the correct order, before or immediately alongside the corresponding code deploy — never leaving code and schema out of sync in production for longer than necessary.
- [ ] Deploy to production.
- [ ] Immediately after deploy: confirm the Dashboard loads for the seeded Administrator, confirm the Public Website's homepage loads, confirm the security headers are present (`curl -sI`), confirm no elevated error rate in the technical log stream for at least the first 15 minutes.
- [ ] If anything in the immediate post-deploy check fails: follow `rollback-plan.md` immediately — do not attempt a forward-fix under pressure before rolling back.

## Post-Release

- [ ] Confirm the release is tagged/recorded (commit SHA, migration filenames applied, date) somewhere durable (e.g. a `CHANGELOG` entry or the team's release-tracking tool) so a future rollback or audit can identify exactly what shipped.
- [ ] If this release closed a Backlog item from any CTO Deliverable, update that document's Backlog section to reflect it.

---

This checklist itself is a living document — if a release surfaces a check that should have been here and wasn't, add it (as an explicit edit, reviewed like any other change), rather than relying on memory next time.
