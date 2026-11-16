# AHR Platform v1 — Archive API

**Status:** 🔒 Frozen

## No Public HTTP API

Archive (Packages Specification Package 04) is a domain/service layer. Its own specification is explicit: **"Internal module functions only... No separate Archive HTTP API is exposed"** (Package 04 §14). CMS (03 - CMS API) and Website (04 - Website API) call Archive's functions directly from their own Route Handlers/Server Actions — Archive itself has no routes, and this document does not invent any to satisfy the requested file structure.

## What Archive Contributes to Every Other API Document

Every validation rule, error code, and business rule referencing Data Integrity Rules, Entity Lifecycles & State Transitions, or Relationship Model (Phase 4/6) throughout this specification (`MISSING_CONTRIBUTION`, `INVALID_STATUS_TRANSITION`, `TAXONOMY_DOMAIN_MISMATCH`, the transition-endpoint shape) is Archive's logic, surfaced through CMS's and Website's endpoints — not duplicated per package.

## If This Boundary Ever Changes

Should a future release need Archive exposed as its own service (e.g. for a separate consumer beyond this monorepo's own packages), that is an architectural change requiring its own review round — not something this document should pre-empt by inventing routes today.

---

**Status:** 🔒 Frozen — intentionally empty of endpoints; this is correct, not incomplete
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 04
