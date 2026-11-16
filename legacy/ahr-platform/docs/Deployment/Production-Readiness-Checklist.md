# AHR Platform v1 — Production Readiness Checklist

**Added:** Phase 3 CTO Audit (Deployment & Production Readiness Review). Operationalizes `13-Deployment-and-DevOps.md` §9 (Operational Readiness Checklist Categories) as concrete, checkable items, cross-referenced with every finding from all three CTO audit phases.

---

## Data Readiness

- [x] All 20 tables migrated, structurally verified against a real Postgres instance (`packages/database/tests/smoke-test.sql`).
- [x] RLS enabled and policied on all 20 tables, behaviorally verified (`packages/database/tests/rls-smoke-test.sql`).
- [ ] Legacy data migration executed against the real, provisioned Supabase project (Blocking Issue B4/B5 — canonical CRM version still undecided per the Final Build Manifest; not resolved by any CTO audit phase, since it is a content/data decision, not a code one).
- [x] Every migrated entity's verification status defaults to `self_reported`/`pending`, never auto-`verified` (`13-Deployment-and-DevOps.md` §8 item 3) — confirmed as the schema default in every content table migration.

## Security Readiness

- [x] RLS enforced by default on every table (Phase 2 CTO Audit).
- [x] Least privilege confirmed: exactly one active role in v1, audit tables have no client write policy (Phase 2 CTO Audit).
- [x] Secrets confirmed server-side-only, never in `NEXT_PUBLIC_*`, never logged (Phase 1/3 review).
- [x] Standard security response headers present on every route (Phase 3 CTO Audit — see Security & Performance Final Review Report).
- [ ] Rate limiting configured at the infrastructure/edge layer (Vercel Firewall / Attack Challenge Mode or equivalent) — flagged since `10-Security.md` §9 as an infrastructure-configuration step, not a code gap; still not configured as of this document, since it requires access to the live Vercel project's settings.
- [ ] `activity_log` failed-login edge case (Phase 2 CTO Audit, Database Verification Report §5) — recommended fix not yet applied; requires a live Supabase project to verify safely.

## Observability Readiness

- [x] Every content status transition is logged (`entity_state_transition`), verified append-only at the database level.
- [x] Every actor action is logged (`activity_log`), verified append-only at the database level, admin-readable via the Dashboard's Activity Log viewer.
- [ ] A named monitoring/error-tracking tool is selected and wired up — see the Deployment & Production Readiness Review Report's Monitoring/Error Tracking findings; not selected as of this document (an operational decision, not a code blocker per `11-Performance.md` §8, but required before this checkbox can be honestly checked).

## Governance Readiness

- [x] Delivery Governance path exists and is documented (`13-Deployment-and-DevOps.md` §10), operationalized as a concrete Release Checklist (Phase 3 CTO Audit).
- [x] The Platform Owner retains final production-release approval authority; nothing in this document or any CTO deliverable grants an automated system that authority.

## Recovery Readiness

- [x] A rollback plan exists and distinguishes application-only rollback, migration-involved rollback, and catastrophic backup restoration (Phase 3 CTO Audit, `rollback-plan.md`).
- [ ] The rollback plan has been **actually tested** (a real redeploy-to-previous-version drill, and a real restore-from-backup drill) — not yet performed, since it requires a live Vercel/Supabase project. `13-Deployment-and-DevOps.md` §9 is explicit that a rollback path must be "actually tested, not just documented as theoretically possible" — this item is correctly left unchecked, not assumed satisfied by the plan's existence.
- [ ] Supabase backup/point-in-time-recovery is confirmed enabled and its retention window is known — not yet confirmed, since it requires the live Supabase project's dashboard.

## Support Readiness

- [ ] Clear, named ownership for who responds to a post-launch operational issue immediately — an organizational assignment, not a code or documentation item; not established by any CTO audit phase, since it is outside engineering's authority to assign.

---

## Summary

| Category                | Status                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Data Readiness          | 🟡 Mostly ready — legacy migration itself still pending a content decision (B5), not a code gap |
| Security Readiness      | 🟡 Mostly ready — two items need a live environment to close                                    |
| Observability Readiness | 🟡 Logging is solid; tool selection for active monitoring is an open operational decision       |
| Governance Readiness    | 🟢 Ready                                                                                        |
| Recovery Readiness      | 🟡 Plan exists; drills not yet run (need a live environment)                                    |
| Support Readiness       | 🔴 Not established — requires an organizational decision outside this audit's scope             |

**No public-facing component should ship until every category above is satisfied for its scope** (`13-Deployment-and-DevOps.md` §9's own rule) — the items still open here are exactly the ones a code-level CTO audit cannot close on its own: they require a live Supabase/Vercel project and an organizational (not technical) staffing decision. This is the honest state of readiness, not a rounded-up one.
