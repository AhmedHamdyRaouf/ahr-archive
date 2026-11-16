# Package 10 — Notifications

**Status:** 🟡 Working — pending review, **contains an unresolved schema gap (see §13)**
**Package Type:** Backend service, minimal admin UI

## 1. Package Overview

Implements Notification Experience (Phase 7) for V1: internal notifications to the Administrator when something needs attention — new moderation report, AI suggestion available for review (if surfaced this way), settings change confirmation.

## 2. Objectives

- Ensure the Administrator is made aware of things that need attention without needing to constantly check every dashboard section manually.
- Keep notifications meaningful, not frequent (Notification Experience, Phase 7 — fatigue minimization).

## 3. Scope

**In scope (V1, single-Administrator context):** In-dashboard notification indicators for new moderation reports; no external channels (email/SMS/push) in V1.
**Out of scope:** Multi-recipient routing (only one Administrator exists — there's no one else to route to), Academy/Creative Network notifications (Release 2), any external delivery channel.

## 4. Features

- In-dashboard indicator (e.g. a badge count) for open `moderation_report` rows — this is the only notification-worthy event with a concrete data source in V1's frozen schema.

## 5. User Stories

- As the Administrator, I see an indicator when a new moderation report is open, without having to navigate to the Moderation Queue to check.

## 6. Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FR-1 | The Dashboard shell must show a count of open `moderation_report` rows. | ✅ Supported (derived from `moderation_report`, no new table needed) |
| FR-2 | The system must notify the Administrator of arbitrary "events" (logins, settings changes, content published, etc.) as a general notification feed. | 🔴 **Blocked — no table to store notification events (§13)** |
| FR-3 | The system must support external delivery (email) of notifications. | 🔴 Out of scope for V1 regardless of schema — no email sending infrastructure specified in the frozen stack beyond Supabase Auth's own transactional emails |

## 7. Non-Functional Requirements

- Notification fatigue minimization (Notification Experience, Phase 7): the moderation-report badge is a count, not a stream of individual pop-ups per report.

## 8. Pages

No dedicated page. The indicator lives in `DashboardShell` (Package 07); clicking it routes to the Moderation Queue (Package 07).

## 9. Components

- `ModerationBadge` (count indicator, embedded in `DashboardShell`)

## 10. Navigation Flow

```
Dashboard shell (any page) → ModerationBadge (count) → click → Moderation Queue (Package 07)
```

## 11. Complete Workflow

```
① A moderation_report is created or its status changes to 'open'/'escalated'
② ModerationBadge's count query re-runs (on next page load / periodic refresh)
③ Administrator sees the updated count and can navigate to review it
```

There is no event-driven push notification pipeline in V1 — the badge is a live count query, not a stored, dismissible notification feed. This is a direct consequence of §13's schema gap, not an independent design choice.

## 12. Roles & Permissions

Administrator only — the sole recipient of any notification in V1.

## 13. Database Tables Used — and the Schema Gap

**Tables used:** `moderation_report` (read-only, for the count derivation) — this is the only notification-adjacent feature buildable against the frozen schema without a new table.

**No `notification` table exists in the Frozen v1 Database Architecture.** Notification Experience (Phase 7) describes a general notification concept (student updates, trainer replies, collaboration requests, moderation alerts) — none of which has a storage home in the frozen 20-table schema, and most of which (student/trainer/collaboration) are Release 2 concepts (Academy/Creative Network) anyway and correctly out of scope here regardless.

**What this means concretely for V1:** Notifications, as a general system, are **not implemented**. The only thing this package delivers is a derived count badge computed live from `moderation_report`. Anything resembling "you have 3 new notifications" as a persistent, dismissible, per-event feed requires a new table and is not built here.

**Recommended path (not assumed here):** a `notification` table — `id`, `recipient_id` (FK → `platform_user`), `type`, `entity_table`, `entity_id`, `message`, `read_at` (nullable), `created_at` — proposed for a Database Architecture Review Round 2, the same process already used for `moderation_report`/`platform_settings`/`activity_log`. Given V1 has exactly one Administrator, the practical urgency of this table is low; it becomes materially more important once Release 2 introduces roles with things to be notified about from each other.

## 14. APIs Required

- `getOpenModerationCount()` — the only "notification" query that exists in V1.

## 15. Validation Rules

N/A — no user input in this package.

## 16. Business Rules

- Notification Experience (Phase 7): meaningful over frequent. With only a count badge in V1, this principle is trivially satisfied — there is no risk of over-notifying with a single derived count.

## 17. Security Considerations

- The count query respects the same Row Level Security as the Moderation Queue itself (Package 07) — no separate access path is introduced.

## 18. Edge Cases

- Zero open reports → badge shows nothing (or a zero state), not a distracting always-visible element.

## 19. Error Handling

| Scenario | Behavior |
|---|---|
| Count query failure | Badge silently omits rather than showing a broken/error state in the primary navigation |

## 20. Acceptance Criteria

- [ ] Moderation-report count badge is accurate and updates on navigation.
- [ ] No other "notification" claim is made anywhere in the product for V1 — documentation and UI copy must not imply a general notification system exists.

## 21. Dependencies

- **Depends on:** Package 07 (Dashboard shell hosts the badge), `moderation_report` table.
- **Depended on by:** None.
- **Blocked by:** The `notification` table schema gap (§13) for anything beyond the moderation count.

## 22. Future Improvements (Post v1)

- General `notification` table and feed (pending schema decision).
- Email delivery channel.
- Release 2: Trainer/Student/Creative Member-facing notifications (collaboration requests, replies, enrollment updates).

## 23. Testing Checklist

- [ ] Badge count matches the actual number of open moderation reports.
- [ ] Badge updates after a report is resolved.

## 24. UX Notes

- Do not over-promise: no UI copy anywhere should say "Notifications" as if a full system exists — call it what it is ("Open Reports") until §13 is resolved.

## 25. Developer Notes

- Resist the temptation to fake a notification feed with an in-memory or client-only structure — that would silently violate durability/audit expectations (Observability, Phase 8) the moment the browser tab closes. Wait for the schema decision.

---

**Status:**
🟡 Working — schema gap unresolved; scope is intentionally minimal in V1

**Package:**
10 — Notifications

**Reviewed By:**
Claude

**Approved By:**
Pending

**Dependencies:**
Package 07 (Dashboard), Moderation Logic (Phase 6), Notification Experience (Phase 7) — **full implementation pending a Database Architecture amendment, see §13**
