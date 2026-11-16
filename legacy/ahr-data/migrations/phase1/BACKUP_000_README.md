# Phase 1 / 000 — the backup (executed 2026-11-11, project qgxagmbkgelxvzsphlrg)

## What exists in the database (schema `backup_phase1`, 24 tables + 1 function; RLS on; no anon/authenticated access)
| Object | What it is | How to use it |
|---|---|---|
| 20 tables named like the originals | Full data copies of every `public` base table (`create table as select`) | `select * from backup_phase1.works` etc. Read-only reference; also the data source of restore |
| `_manifest` | Per table: live row count + md5 at backup time, and the same for the copy (`backup_rows`, `backup_md5`) | Compare any time: live md5 must equal `md5` while no phase has touched that table |
| `_ddl` | 794 ordered rebuild statements (columns `ord`, `seq`, `kind`, `obj`, `stmt`): function, sequence, tables, data load, setval, PK/UNIQUE/CHECK, FKs, indexes, triggers, RLS, policies, views, revoke/grants, comments | `restore_phase1.sql` runs them `order by ord, seq` |
| `_struct_manifest` + `fingerprint(sch)` | md5 fingerprints of 9 structure kinds (columns, constraints, indexes, triggers, policies, rls_flags, grants, views, sequences) | `select * from backup_phase1.fingerprint('public')` and compare with `_struct_manifest` after each migration; the 9 kinds legitimately change only for objects a migration adds |
| `_verification` | 31 results of the restore replay (all `ok = true`) | Audit evidence; also in `000_verification_results.csv` |

Not captured: platform-level backups, auth/storage schemas, owner = postgres grants, column-level grants (none exist), `change_log` rows written after the backup. Previous `backup_20261110` is untouched.

## Executed files (exact text run via execute_sql)
- `000a_backup_data.EXECUTED.sql` → schema, `_manifest`, 20 data copies
- `000b_backup_structure.EXECUTED.sql` → `_ddl`, `fingerprint()`, `_struct_manifest`
- `000c_restore_verification.EXECUTED.sql` → scratch-schema replay + the 31 checks (scratch schema dropped)
- `000d_post_check.EXECUTED.sql` → read-only post-check
- `000_verification_results.csv` → the 31 results with full md5 values
- `restore_phase1.sql` → full restore of `public` from the backup. NOT executed on `public`; its statement list is the one replayed in 000c.

## Prepared vs executed
- `prep_not_executed/000_backup.PREP.sql` and `tests_phase1.PREP.sql` are the first drafts (data copy only; tests for 001/002). They were NOT run. 000 was run in the expanded form above (adds structure capture, fingerprints, restore replay).
- `001_*`, `002_*`, `003_*` (up/down) are still prepared only, NOT executed. `tests_phase1.PREP.sql` is the draft for them.
