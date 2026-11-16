# AHR Platform v1 — Packages Specification

## Overview

This folder contains the complete functional specification for all 10 packages that make up AHR Platform v1, built strictly on **AHR Platform v1 Final Build Manifest** and **Database Architecture (Frozen v1)**. No code, SQL, or implementation exists here — this is specification only.

| # | Package | One-line purpose |
|---|---|---|
| 01 | Authentication | Resolves who is making a request; Administrator sign-in/out |
| 02 | CMS | Admin authoring: create/edit/lifecycle for all core content entities |
| 03 | Website | Public-facing pages presenting published Archive content |
| 04 | Archive | Domain layer — entities, relationships, business rules (no UI of its own) |
| 05 | Contacts & Organizations | Organization management + their relationships to Archive entities |
| 06 | AI | OpenAI-backed, human-reviewed content suggestions |
| 07 | Dashboard | Admin shell — navigation, Settings, Activity Log, Moderation Queue |
| 08 | Media Library | Upload and manage media files linked to Archive entities |
| 09 | Search | Full-text search over published content |
| 10 | Notifications | Minimal V1 scope — a moderation-report count badge only |

**Two schema gaps surfaced during this specification pass** (Package 06 and Package 10) are not silently worked around — see each package's §13 and the Integration Map below.

## Dependency Diagram (text-based)

```
                         ┌─────────────────────┐
                         │  01 Authentication   │
                         └──────────┬───────────┘
                                    │ (every admin package requires a session)
                ┌───────────────────┼───────────────────┬─────────────────┐
                │                   │                   │                 │
                ▼                   ▼                   ▼                 ▼
      ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐ ┌───────────┐
      │   04 Archive     │ │  07 Dashboard    │ │ 05 Contacts &     │ │ 06 AI     │
      │ (domain layer)   │◄┤ (shell/settings/ │ │    Organizations  │ │(suggests, │
      └───┬────┬────┬────┘ │  activity/mod.)  │ └─────────┬─────────┘ │ never     │
          │    │    │      └────────┬─────────┘           │           │ decides)  │
          │    │    │               │                     │           └─────┬─────┘
          │    │    │               ▼                     │                 │
          │    │    │        ┌──────────────┐             │                 │
          │    │    │        │ 10 Notifi-   │             │                 │
          │    │    │        │ cations      │             │                 │
          │    │    │        │ (badge only) │             │                 │
          │    │    │        └──────────────┘             │                 │
          ▼    ▼    ▼                                      ▼                 ▼
   ┌───────────────┐   ┌────────────────┐         ┌────────────────┐  (embedded inside
   │  02 CMS       │   │ 08 Media       │         │ (uses Archive's │   Package 02's forms,
   │ (uses Archive)│   │ Library        │         │  entity base)   │   not a standalone page)
   └───────┬───────┘   │ (uses Archive) │         └────────────────┘
           │           └───────┬────────┘
           │                   │
           ▼                   ▼
   ┌───────────────────────────────────┐        ┌────────────────┐
   │        03 Website (public)         │◄───────┤   09 Search     │
   │  reads only what CMS publishes     │        │ (reads Archive, │
   └────────────────────────────────────┘        │  surfaced on    │
                                                  │  Website too)   │
                                                  └────────────────┘
```

## Recommended Implementation Order

Matches the Final Build Manifest's Package Execution Order (P1–P12), mapped to this package set:

```
1. 01 Authentication        (Build Manifest P3)
2. 04 Archive                (Build Manifest P4 — domain layer first, nothing else can be built on top of it otherwise)
3. 07 Dashboard              (Build Manifest P5 — the admin shell everything else lives inside)
4. 02 CMS                    (Build Manifest P4/P6, built on Archive + Dashboard shell)
5. 05 Contacts & Organizations (parallel to CMS — same dependency shape, shares patterns)
6. 08 Media Library          (depends on Archive + Dashboard)
7. 09 Search                 (depends on Archive; can start once entities exist, doesn't need CMS finished)
8. 06 AI                     (embeds into CMS forms — build after CMS's forms exist)
9. 10 Notifications          (depends on Dashboard + a Moderation Queue existing — trivial scope in V1)
10. 03 Website                (last — consumes everything else; nothing depends on it)
```

## Integration Map

| Package | Reads from | Writes to | Embedded in |
|---|---|---|---|
| 01 Authentication | `auth.users`, `platform_user` | `platform_user`, `activity_log` | — (foundational) |
| 04 Archive | 8 core tables + join tables | Same | — (domain layer, no UI) |
| 07 Dashboard | `platform_settings`, `activity_log`, `moderation_report` | Same | Hosts Packages 02, 05, 06 (embedded), 08, 09, 10 |
| 02 CMS | Via Archive | Via Archive | Inside Dashboard shell |
| 05 Contacts & Organizations | `organization` + related tables (via Archive) | `organization` (via Archive) | Inside Dashboard shell |
| 08 Media Library | `media_asset` | `media_asset`, Supabase Storage | Inside Dashboard shell |
| 09 Search | 5 searchable tables (via Archive) | None (read-only) | Website (public) + CMS (admin) |
| 06 AI | Entity context (via Archive), OpenAI | Nothing persisted yet — **schema gap, §13 of Package 06** | Inside CMS forms |
| 10 Notifications | `moderation_report` (count only) | Nothing — **schema gap, §13 of Package 10** | Inside Dashboard shell (badge) |
| 03 Website | Everything, read-only, published+public filtered | Nothing | Standalone (public) |

## Package Interaction Summary

- **Archive (04) is the only package allowed to touch the 8 core content tables directly.** CMS (02), Contacts & Organizations (05), Website (03), and Search (09) all go through it — this is the enforced architectural boundary from Service Architecture (Phase 8), carried into this specification.
- **Dashboard (07) is a shell, not a content owner**, except for the two tables nothing else claims: `platform_settings` and `activity_log`.
- **AI (06) and Notifications (10) are both currently limited by the same kind of gap**: neither has a table to persist its core artifact (a recommendation; a notification event) in the Frozen v1 schema. Both are documented as functionally reduced in V1 rather than silently worked around — see each package's §13 and §22.
- **Website (03) is a pure consumer** — every other package's work becomes visible through it, but nothing depends on it.

## Open Items Before Full V1 Build-Out

1. **Package 05 schema gap** — contact info, notes, external links, tags/categories on `organization` (Contacts & Organizations §13).
2. **Package 06 schema gap** — no `ai_recommendation_log` table (AI §13).
3. **Package 10 schema gap** — no `notification` table (Notifications §13).

All three are recommended to go through a single **Database Architecture Review Round 2**, the same review process already used successfully for `moderation_report`, `platform_settings`, and `activity_log`, rather than three separate ad hoc changes.

---

**Status:**
🟡 Working — pending your approval

**Prepared By:**
Claude

**Approved By:**
Pending
