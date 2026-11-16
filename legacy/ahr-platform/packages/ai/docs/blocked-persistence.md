# @ahr/ai — Specified but Blocked: Persistence (Frozen v1 Database Architecture)

**Status:** Documented gap, not implemented. Revisit only via an official Database Architecture review round — never worked around in code.

This package is built entirely against the Frozen v1 Database Architecture exactly as it exists. `14-AI-Integration.md` §5 already names this exact gap before this package existed; this document confirms it remains true now that the package is built, and records the one consequence that follows from it.

## Suggestions Are Ephemeral

**Requested (implicitly, by a usable AI feature):** a way for an Administrator to come back later and see what was suggested, what they did with it, or to audit AI usage over time.

**Blocked because:** no `ai_recommendation_log` table (or equivalent) exists in the 20-table frozen schema. There is no column, table, or constraint anywhere that this package could write a suggestion's outcome into.

**What exists instead:** `suggestCategoriesAndTags` and `suggestSummary` return a value to their caller and nothing more. Every call's outcome (success or failure, with a reason) is written to the technical/operational log stream only (`consoleAiCallLogger`, or a caller-supplied equivalent) — this is a debugging/observability trail, not a queryable, per-suggestion audit record, and was never claimed to be one (`14-AI-Integration.md` §8: "a temporary logging home for traceability, not a substitute for the eventual persisted, queryable table").

**Consequence for callers:** if an Administrator navigates away from a CMS form before accepting a suggestion, it is gone — the request must be made again. This is a real, disclosed functional limitation, not an oversight.

**Path to unblocking:** add `ai_recommendation_log` exactly as proposed in `14-AI-Integration.md` §5, through the same Database Architecture review round already used for `moderation_report`/`platform_settings`/`activity_log` — not made here, and not assumed by any code in this package (nothing in `@ahr/ai` references a table that doesn't exist).
