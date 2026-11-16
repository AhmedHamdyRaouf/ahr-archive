# AHR Platform — Public Site, Growth, Content-Quality & Ops Ideas

**Purpose:** Additional improvement ideas surfaced 2026-07-21, covering areas outside the Dashboard UX backlog (`Dashboard-UX-Enhancement-Backlog.md`) and the AI features backlog. None implemented yet — data owner has approved adding these to the list for future consideration, not committed to a release yet.

**Status of each item below:** 🔲 Not started (all items, as of this writing).

## Public site experience (visitors)

1. **Career Timeline page** — an interactive year-by-year view combining works, awards, and events together, instead of each type living only in its own separate section.
2. **Press Kit page** for journalists — high-resolution photos + official bio + highlight reel of achievements, packaged for direct download.
3. **Embedded audio/video** directly on Work pages (rights permitting), instead of only external links.
4. **Custom Open Graph / social share cards** per Work/Person page — proper title + image when a link is shared on WhatsApp/Twitter/etc., instead of a generic fallback.

## Growth & discoverability

5. **Lightweight newsletter (no account required)** — email + confirmation only, notifying subscribers when a new Work/Award is added. A much lighter alternative to the full "members" system that was tabled earlier in this conversation.
6. **Structured data (schema.org Person/CreativeWork) for Arabic content specifically** — to improve how pages surface in Google search results. `sitemap.ts`/`robots.ts` already exist; this extends discoverability further.

## Content quality tooling

7. **Broken-link checker** — especially relevant for the still-pending real photo uploads and external press links.
8. **Orphaned-record detector** — e.g. a Work with no linked Person, or an Organization with zero contributions, so these can be cleaned up or completed.

## Operations

9. **Scheduled automatic backups + an actual tested restore drill** — relates to the already-open Decision Log operational items (G-track).
10. **Simple status page** — a public "is the site up" page, useful ahead of the real production launch (Vercel/Hostinger).

---

**Decided On:** 2026-07-21
**Next step:** none of the above is scheduled yet — revisit alongside the Dashboard UX backlog and the AI features backlog when prioritizing actual build work.
