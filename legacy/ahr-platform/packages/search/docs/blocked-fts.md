# @ahr/search — Specified but Blocked (Database Architecture Frozen v1)

**Status:** Documented gap, not implemented. Revisit only via an official Database Architecture Review Round — never worked around in code.

## PostgreSQL Full-Text Search (`tsvector`, GIN indexes, `ts_rank`)

**Requested/anticipated:** Database Architecture §16 ("Search Readiness") describes a plan for GIN indexes over `tsvector` columns on 5 entities (Person, Work, Project, Event, Organization), enabling stemming-aware, relevance-ranked full-text search.

**Blocked because:** This was documented as an _intention_ in §16's prose, but **no migration, from Milestone 2 onward, ever created a `tsvector` column or a GIN index on any table.** The schema as it is frozen today has zero PostgreSQL full-text search infrastructure. Per explicit instruction: "§16 documents PostgreSQL Full-Text Search as a future intention, [but] it was never implemented in the frozen schema. Therefore, it is not part of the approved database architecture for AHR Platform v1." Adding it now — even as a purely additive, non-breaking migration — is a database architecture change this milestone is not authorized to make.

**What ships instead:** Substring matching (`ILIKE`) across the same bilingual columns §16 named, using the same query-building technique already proven in `@ahr/cms-core`'s admin list search (Milestone 4). Ranking is a **deterministic heuristic** (`relevance.ts`): exact match, then verified status, then recency — matching Search Architecture (Phase 3)'s own documented ranking order ("exact match → verified → relevance") — but this is not `ts_rank`, has no language-aware stemming, and will rank differently than true full-text search would for multi-word or partial-word queries.

**Path to unblocking:** Add generated `tsvector` columns + GIN indexes for the 5 named entities, and switch `relevance.ts`'s heuristic scoring for `ts_rank`-based scoring — a Database Architecture Review Round decision, not made here.

## Media Search Ranking

Also worth noting: `media_asset` was never one of the 5 entities named in §16 even in its original, unimplemented form — Database Architecture always intended Media to be discoverable _through_ its owning Work/Person/Project/Event, not via its own ranked index. `mediaSearch` in this package therefore does plain substring matching on `caption_ar`/`caption_en` with no relevance heuristic beyond an exact-match boost — this is not a new gap, it is the frozen document's original design, carried forward.
