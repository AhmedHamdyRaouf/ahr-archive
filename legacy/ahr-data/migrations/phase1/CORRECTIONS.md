# Phase 1 — corrections log

## C-001 — owner_all policy roles (2026-11-11)
- **Found by:** tests_002 Part A1, test A1.07 (first run on Supabase right after 002 was applied).
- **Finding:** the 19 pre-existing `owner_all` policies are `TO authenticated`. The policies created by 001 (`ref_relationship_type`) and 002 (`work_relationship`) had no TO clause (= `TO public`). USING / WITH CHECK were identical, so access was equivalent in practice (anon has no jwt email), but it deviated from the pattern. The 001 assertion A04 did not compare roles, so it did not catch this.
- **Correction (executed on Supabase, migration name `phase1_fix_001_002_policy_roles`):** `fix_001_002_policy_roles.up.sql` — `ALTER POLICY owner_all ... TO authenticated` on both tables. No data touched. DOWN: `fix_001_002_policy_roles.down.sql` (back to TO public).
- **Files changed afterwards (so a fresh install is correct):** `001_ref_relationship_type.up.sql` and `002_work_relationship.up.sql` now say `to authenticated`; each has a NOTE header stating what was executed originally.
- **Tests changed:** `tests_001.PREP.sql` A04 and `tests_002.PREP.sql` A1.07 compare role names; `tests_002` A2 adds "every policy in public is TO authenticated only" (45 tests). New `tests_001_policy_recheck.sql` re-runs the 001 policy assertions once 002 exists (the full tests_001 Part A is a point-in-time suite for "backup + 001"; after 002 it is superseded by tests_002 A2, which is cumulative).
- **Verified:** locally (original UP files -> policy tests FAIL; after the fix -> PASS; DOWN/UP reversible; fresh install with new UP files -> PASS) and on Supabase (see report).

## D-001 — data_dictionary is intentionally NOT logged (decision, 2026-11-11)
- `public.data_dictionary` has no `trg_log_*` trigger (it never had one). Ahmed decided not to add one: changes to the dictionary (including the 19 rows from migration 003) are intentionally not recorded in `change_log`. It is a descriptive table, not archive data.
- Enforced by tests: tests_003 A1.10 (no triggers on data_dictionary) and Part B4 (change_log untouched), A2 (change_log still 1304, no rows for data_dictionary).
- 003 hardening vs the first draft: one DO block, refuses to run twice, deterministic row_id order, checks exactly 19 rows inserted.
