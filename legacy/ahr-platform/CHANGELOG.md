# Changelog

This changelog tracks consolidation-level events for this repository — not feature development, which is tracked in Git commit history (`git log`).

## Consolidation — July 2026

- Merged all prior project material (architecture, knowledge base, experience & design, source code, content, CTO review reports) into this single repository, `AHR-Platform/`.
- Removed 18 redundant full-repository milestone snapshots (~33 MB), superseded by the live Git history in `apps/`/`packages/`.
- Removed all `__MACOSX`, `.DS_Store`, and raw `.zip` remnants from the active tree.
- Renamed all live documentation/project files to remove version-style suffixes (`v1`, `Final`, `Draft`, etc.); preserved original names only inside `Archive/`, where they are historical record.
- Promoted the API Specification and both cycles of CTO review reports from archived material into live `docs/`.
- Merged in the real content dataset (`content/Master-Content-Dataset/`), previously not part of any prior consolidation pass.
- Flagged, but did not resolve, one genuine data conflict (three differing legacy press-archive spreadsheets) — see `content/Master-Content-Dataset/12-Source-Files/Excel-Sheets/CONFLICT-NOTE.md`.
- Produced `README.md`, `MASTER_INDEX.md`, `PROJECT_STRUCTURE.md`, and `CONSOLIDATION_REPORT.md` for this repository.

No business decisions, architecture choices, or code behavior were changed as part of this consolidation.
