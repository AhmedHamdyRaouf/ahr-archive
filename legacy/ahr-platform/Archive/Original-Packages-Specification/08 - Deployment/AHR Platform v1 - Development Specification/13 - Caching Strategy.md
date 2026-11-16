# AHR Platform v1 — Caching Strategy

**Status:** 🔒 Frozen

## What May Be Cached

Public Website pages (Package 03) reading published+public content — this content changes relatively rarely and is read far more often than written (Scalability & Performance Architecture, Phase 8: "read-heavy archive content... designed for high read performance"). Search results for common/popular queries may also be cached briefly.

## What Must Never Be Cached

- Anything under `/dashboard/*` — Administrator-facing data must always be current; a stale Moderation Queue count or entity list is a working-tool defect, not an acceptable trade-off.
- Any restricted/hidden content or signed URL response.
- Session/authentication state.
- `platform_settings`' `aiConfiguration`/`emailConfiguration` keys, or any Administrator-only settings data.

## Cache Invalidation Trigger

Publishing, archiving, or updating a Work/Project/Event/Person/Organization/Award (any status or content change reaching `published`+`public`) must invalidate that specific page's cache — a stale published page showing outdated content is a correctness issue, not just a performance nuance. Invalidation is scoped to the specific affected page/resource, not a blanket full-site cache clear on every edit.

## Media Files

Public media files (images, audio, video) may be cached aggressively by the CDN layer, keyed by their stable Storage path — since Replace File (12 - File Upload Rules) always creates a new path rather than overwriting in place, a cached old version being served briefly after a replace is a acceptable, bounded staleness, not a correctness bug.

## No Client-Side Caching Library Required Beyond Framework Defaults

Given the "no heavy global client store" decision (09 - State Management Strategy), caching in V1 relies on the frontend framework's own built-in data-fetching cache behavior plus CDN-level caching for static/media assets — no additional caching library is introduced unless a specific, measured need arises (Scalability & Performance Architecture's "no premature complexity" principle, applied here).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Scalability and Performance Architecture (Phase 8), Database Architecture (Frozen v1) §8/§11
