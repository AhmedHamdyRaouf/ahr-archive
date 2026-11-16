# AHR Platform v1 — Prototype

**Status:** 🟡 Textual click-through specification complete; no interactive prototype file (e.g. Figma) is produced — agreed scope, see Design Status Report.md

## What This Folder Contains
Since no visual design tool output exists in this engagement (text-based deliverable, agreed with the requester before this build), the "prototype" is expressed as a **click-through script**: the exact sequence of screens and states a click-through prototype would present, built entirely from already-approved material in `User Flows/README.md`, `User Journeys/README.md`, and `Wireframes/`.

## Administrator Click-Through — "Publish a new Work"
1. `Wireframes/Authentication.md` Sign In screen → submit → redirect
2. `Dashboard Designs/README.md` Dashboard Home
3. `Wireframes/CMS.md` Works Entity List → Create
4. `Wireframes/CMS.md` Entity Edit (Details tab) → fill bilingual fields
5. `Wireframes/AI.md` panel (optional) → Accept/Edit/Reject
6. `Wireframes/CMS.md` Contributions tab → attach Contribution (Publish stays disabled until this step)
7. `Wireframes/Media-Library.md` Upload (optional, linked to this Work)
8. `Wireframes/CMS.md` status transition Dialog → Publish confirmed → badge updates
9. `Wireframes/Notifications.md` badge check → `Dashboard Designs/README.md` Moderation Queue (if any open reports)

## Visitor Click-Through — "Discover a Work"
1. Public Home (`Website Designs/README.md`)
2. Works list → filter by Category
3. Work Detail (verification badge visible throughout)
4. Related Project link
5. Locale switch (instant, same page)
Alternative entry: `Wireframes/Search.md` Search Results → same Work Detail.

## Build-Ready Note
Once B10 resolves and an actual visual kit exists (`UI Kit/README.md`), this script can be dropped directly into a Figma/prototyping tool's click-map without re-deriving the flow logic — that work is already done here.

---
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
