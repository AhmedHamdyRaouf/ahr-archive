# Phase 1 — Relationship architecture (production project, safe-execution protocol)
Order: 000_backup → 001 → tests → report → 002 → tests → report → 003 → tests → report. One migration per step; stop on any discrepancy; no auto-fix.
Rollback: *.down.sql in reverse (003→002→001). Full data restore: restore_phase1.sql (from backup_phase1).
No changes to existing tables, data, pub_ views, GitHub main or Vercel.

Status (2026-11-11): 000 done; 001 done; 002 done; correction C-001 (policy roles) done — see CORRECTIONS.md. 003 done (decision D-001: data_dictionary intentionally not logged in change_log). Phase 1 (000–003) is CLOSED; branch feat/works-architecture not merged to main.
