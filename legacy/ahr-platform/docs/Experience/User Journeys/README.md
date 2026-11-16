# AHR Platform v1 — User Journeys

**Status:** 🟡 New deliverable — end-to-end journeys assembled from existing, approved User Flows (no new flow content invented)

## Purpose
User Flows (see `User Flows/README.md`) documents 11 discrete flows at the interaction-step level. This document assembles those flows into the two role-based journeys defined in `Personas/README.md`, showing how a real session strings several flows together — a level of synthesis that did not exist before this audit.

## Journey — Administrator: "Publish a new Work end-to-end"
1. **Login** (User Flows §1) → lands on Dashboard Home.
2. **CMS Editing** (User Flows §7): navigates to CMS → Works → Create.
3. Fills bilingual fields; optionally uses **AI Assistant** (§8) to suggest a Category or Summary — reviews, accepts or edits, never auto-applied.
4. Attaches a required Contribution — without this, Publish stays disabled (a deliberate friction point, Design Principles §5).
5. Optionally uploads related media via **Media Upload** (§6), linking it to this Work.
6. Moves the Work through its lifecycle to Published — status badge updates immediately, no full-page reload.
7. Checks **Notifications** (§9) badge for any open moderation reports before moving to the next task.
8. **Logout** (§2) at end of session.

## Journey — Visitor: "Discover and read about a Work"
1. Arrives at Home (direct link, search engine, or shared link).
2. Browses via **Archive Browsing** (§5): Home → Works → filters by Category → opens a Work.
3. Reads the Work Detail: description, Contributions, related Media — verification badge visible throughout (Design Principles §2).
4. Follows a contextual related-content link to a Project.
5. Switches locale mid-browse — same page, other language, no loss of place (Design Principles §3).
6. Alternatively, uses **Search** (§4) directly from any page instead of browsing, arriving at the same Work Detail via a different path.

## Why This Matters for Integration
These journeys are what Development and QA should test end-to-end, not just flow-by-flow — a Work can be Published correctly per §7 in isolation and still fail this journey if, say, the AI suggestion panel blocks the Contribution field's focus order. This document exists specifically to make that kind of cross-flow check possible.

---

**Status:** 🟡 Complete for the two defined personas; would expand if/when new personas are approved (see Personas/README.md)
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
**Dependencies:** User Flows/, Personas/, Information Architecture/
