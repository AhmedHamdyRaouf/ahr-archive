# AHR Platform v1 — Git Workflow

**Status:** 🔒 Frozen

Restates and operationalizes `docs/branching-strategy.md` (Milestone 1) as the day-to-day working process — that document defines the branch model; this one defines the workflow developers actually follow.

## Daily Flow

```
① Pull latest staging
② Create feature/<milestone>-<short-description> from staging
③ Work in small, reviewable commits: "[<milestone-id>] <description>"
④ Push, open a Pull Request into staging (18 - Pull Request Rules)
⑤ Address review feedback (19 - Code Review Checklist)
⑥ Merge into staging once approved and CI passes
⑦ Promote staging → main only after the full milestone's review is complete
   (Environment Strategy, Phase 9 — no partial-milestone promotion)
```

## No Direct Commits

`main` and `staging` accept changes only via Pull Request — enforced by repository settings, not just convention (Branch Strategy, doc 17).

## Commit Hygiene

Commits are logically scoped (one concern per commit where practical) and always reference the milestone they belong to — this is what makes `docs/coding-standards.md`'s traceability rule auditable at the commit level, not just the file level.

## Rebasing vs. Merging

Feature branches rebase onto `staging` before opening a PR (keeps history linear and review diffs clean); merging `staging` into `main` is a standard merge (preserves the promotion event as a discrete point in history).

## Tags/Releases

Each production promotion (`staging` → `main`) is tagged with the milestone/release identifier it corresponds to, matching `docs/release-notes/` (Build Manifest Package 12).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Branch Strategy (17), branching-strategy.md (Milestone 1), Environment Strategy (Phase 9)
