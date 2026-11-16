# AHR Platform v1 — Rollback Plan

**Added:** Phase 3 CTO Audit (Deployment & Production Readiness Review). No rollback plan existed in the project before this document.
**Governing principle:** `13-Deployment-and-DevOps.md` §6 item 2 — "Immediate rollback capability: every release has a fast rollback path to the previous version without losing data entered during it." This document is the concrete procedure that principle requires.

---

## 1. Application-Only Rollback (No Migration Involved)

This is the common case: the release being rolled back did not add a database migration, or its migration is purely additive and safe to leave in place (a new nullable column, a new table nothing yet depends on).

1. In Vercel, redeploy the previous known-good production deployment (Vercel keeps prior deployments available for instant re-promotion — no rebuild needed).
2. Confirm the rollback deployment is serving traffic: check the Dashboard loads, the homepage loads, and the security headers are present.
3. Revert the merge commit on `main` (and `staging`, if the branch already advanced) so the next ordinary deploy doesn't reintroduce the same code.
4. Record the rollback (what was rolled back, why, when) the same way a release is recorded (`release-checklist.md`, Post-Release).

**Recovery time target:** minutes, since this is a redeploy of an already-built artifact, not a new build.

## 2. Rollback Involving a Database Migration

This is the sensitive case, and the reason `02-Database.md` §13 requires every migration to be additive: "no migration drops a column or table that has already shipped to production; corrections ship as a new migration."

Because of that rule, **a migration is never rolled back by reversing it** — it is rolled back by shipping a new, forward-only corrective migration, exactly the same way a schema mistake would be fixed at any other time:

1. Roll back the application code first, per §1 — this alone usually resolves a production incident, since the additive migration remains harmless (unused columns/tables cause no error for code that doesn't reference them).
2. If the migration itself is the source of the problem (e.g. a constraint that's too strict and is rejecting valid data), write a new migration that corrects it — never edit or delete the already-applied migration file (`02-Database.md` §13's "never edited after shipping").
3. Apply the corrective migration to staging first, verify with both smoke tests, then apply to production — the same promotion path as any other migration (`deployment-guide.md` §6).
4. If data was written incorrectly by the faulty migration or the code that shipped with it: correct it via a reviewed, deliberate data-correction script — never a blind mass update. Since No Hard Delete means nothing was destructively removed, the incorrect rows are still present, `archived` or otherwise recoverable rather than gone.

**A rollback never restores an entire database from a backup as its first response** — that would lose every legitimate write made since the backup, which No Hard Delete and Historical Preservation (`02-Database.md`, Archive Model) exist specifically to avoid discarding. Restoring from backup is a last resort for catastrophic data loss (see §3), not a routine rollback tool.

## 3. Catastrophic Data Loss (Backup Restoration)

If data is genuinely, irrecoverably lost or corrupted at the storage layer itself (not a code/migration mistake, but e.g. an operator error running a destructive query directly against the database, bypassing the application entirely):

1. Use Supabase's own point-in-time recovery / backup restoration feature (an operational, project-level Supabase capability, not application code) to restore to the most recent point before the incident.
2. Accept and document the data-loss window (writes between the restoration point and the incident) — communicate this transparently rather than presenting the restored state as fully current.
3. Re-apply the Release Checklist in full before considering the platform healthy again, since a restored database may be behind the currently-deployed code's expected schema.

**This path requires Supabase's backup feature to actually be configured and tested** — see the Backup Strategy section of the Deployment & Production Readiness Review Report for this phase's finding on that specific item.

## 4. Who Decides

Per `13-Deployment-and-DevOps.md` §10 (Delivery Governance), the Platform Owner (or their designated on-call delegate) makes the call between "roll back" and "forward-fix" during an incident — this plan exists so that decision is made calmly, from a known procedure, not improvised under pressure.
