# AHR Platform v1 — Development Principles

**Status:** 🔒 Frozen

## 1. Architecture First, Always
No code is written that isn't traceable to an approved document (Vision through API Specification). If a developer can't point to which document a piece of code implements, that code shouldn't exist yet — raise it for a review round instead of guessing (Implementation Principles, Phase 9).

## 2. One Place for Every Rule
A business rule, validation, or data-shape decision is implemented exactly once (Package 04/Archive for domain rules, `01 - API Standards` for API shape, Design System for UI tokens) and consumed everywhere else. Never re-implemented per call site.

## 3. Traceability Comments Are Mandatory
Every file implementing a rule, entity, or flow from the approved architecture includes a short header comment naming the source document (established in Milestone 1's Coding Standards, carried forward here as the platform-wide rule, not just a web-app convention).

## 4. No Silent Schema/Feature Invention
If a requested feature has no home in the Frozen v1 Database Architecture or Packages Specification, it is flagged (as "Specified but Blocked," matching the API Specification's own convention) — never silently worked around with an invented table, column, or endpoint.

## 5. Incremental, Reviewable Delivery
Work proceeds milestone by milestone (Build Manifest, Solution Decomposition), each producing a working, reviewable artifact — never a large, unreviewable batch of changes.

## 6. Tests Prove the Architecture, Not Just the Code
A test that doesn't verify a Data Integrity Rule, Business Rule, or AI Decision Boundary is a weaker test than one that does — testing priority follows the same priority the architecture itself established (Testing Architecture, Phase 9).

## 7. Reversibility Over Speed
Every change should be revertible without data loss (No Hard Delete, Phase 1/4) and without breaking a previously-shipped URL or API contract (Release & Deployment Strategy, Phase 9).

## 8. Security and Accessibility Are Not Deferred Features
Row Level Security, least privilege, and accessibility requirements are implemented alongside a feature, not retrofitted after — consistent with "Security is enforced by default" (Database Architecture §7, Security Architecture Phase 8).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** All seven frozen documents (Vision through API Specification)
