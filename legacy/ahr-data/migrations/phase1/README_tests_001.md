# tests_001.PREP.sql — how to run (NOT executed on Supabase yet)
Run only after migration 001 is applied and Ahmed approves. Each part is a single statement; run each in its own call.

## Part A (read-only SELECT)
Returns 57 rows: 53 tests + 4 completeness checks (A06), then `ZZ SUMMARY`. Success = every row `PASS` and `ZZ SUMMARY` = `PASS` with actual `0 FAIL / 57 total`. A test that is missing from the results, an extra or duplicated test, or a different row count makes A06 and the summary FAIL.

## Part B (DO block, always rolled back)
**The ONLY success is an error message that starts with `PHASE1_001_PART_B_PASS (fails=0 / total=49)`.**
Any other outcome is a FAILURE: `PHASE1_001_PART_B_FAIL` (FAIL lines are listed first), `PHASE1_001_PART_B_ERROR` (the test crashed), any other SQL error (including a syntax error, which carries no `PHASE1_001` prefix), no message at all, or an interrupted / cut-off execution.
Nothing remains in any table or in change_log in any case; change_log_id_seq advances by exactly 5 (asserted by the test).

## Part C (optional, only with Ahmed's approval)
Proves the DOWN statement works, always rolled back. The only success is a message starting with `PHASE1_001_PART_C_PASS`; anything else is a failure.

## Local validation (scratch PostgreSQL 16 with a shim of auth.jwt / roles / change_log; deleted afterwards; Supabase untouched)
001.up applies; Part B = PASS with 0 failures and leaves 0 residue; Part B with one CHECK removed = FAIL and still leaves 0 residue; Part A runs without errors (the exact grants matrix grantee/privilege/is_grantable of the new table is compared with `works`; it passes locally and fails when one privilege is revoked), and its completeness check reports missing tests when the manifest has fewer than 20 tables. Part A's values are Supabase-specific (PostgreSQL 17, 24 grants), so they are only meaningful on the real project. Part C's `old_tables_20` is false locally by design (the shim has 3 tables).
