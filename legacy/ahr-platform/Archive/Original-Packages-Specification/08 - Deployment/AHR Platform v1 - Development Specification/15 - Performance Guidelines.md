# AHR Platform v1 — Performance Guidelines

**Status:** 🔒 Frozen

## Stateless by Default

Route Handlers/Server Actions are written stateless — no in-memory state that would prevent horizontal scaling later (Scalability & Performance Architecture, Phase 8).

## Read/Write Asymmetry

Public read paths (Website, Search) are optimized for read throughput (indexing, caching per doc 13); administrative write paths (CMS, Contacts & Organizations) prioritize correctness and validation completeness over raw speed — a slightly slower Publish action that correctly enforces every Business Rule is preferred over a faster one that doesn't.

## Asynchronous, Non-Blocking Operations

AI suggestion requests (Package 06) and any future notification-sending never block the primary action they're attached to (a CMS save, a Publish) — they are secondary, best-effort operations.

## N+1 Query Avoidance

Any list view that displays related data (e.g. a Work list showing Contribution counts) fetches that related data in a single batched query, not one query per row — this is a `packages/content` responsibility, checked in code review (19 - Code Review Checklist).

## Pagination Everywhere

No endpoint or admin list view ever returns an unbounded result set — every list respects `pageSize` (max 100, `01 - API Standards`), even for internal/admin use.

## Index Discipline

Every foreign key is indexed (Database Architecture §10/§13) — a new migration adding a foreign key without its corresponding index is a code-review-blocking omission, not a minor style issue.

## Media Delivery

Public media is served from Storage/CDN directly, never proxied through the Next.js application server unnecessarily (Media Storage Structure, Database Architecture §11) — the application only mediates access for restricted/hidden content (signed URLs).

## No Premature Optimization

No caching layer, denormalization, or read-replica strategy is introduced speculatively — Scalability & Performance Architecture's "the platform can grow by addition, not premature complexity" principle governs here exactly as it did at the architecture level.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Scalability and Performance Architecture (Phase 8), Database Architecture (Frozen v1) §10/§13
