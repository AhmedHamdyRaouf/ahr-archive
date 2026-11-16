# @ahr/notifications — Specified but Blocked (Database Architecture Frozen v1)

**Status:** §1 (persisted inbox) **resolved 2026-07-21** — see the update note below. §2 (per-user preferences) remains a documented gap, not implemented.

## 1. Persisted Notification Storage (an inbox/notification table) — ✅ Resolved 2026-07-21

**Requested/anticipated:** A general notification feed a user can read, mark read/unread, and revisit later.

**Update 2026-07-21:** Approved by the data owner (Database Architecture Review Round item E4, `docs/Program-Status/Decision-Log.md`). The `notification` table now exists (`packages/database/migrations/20260721110000_notification.sql`), in exactly the shape this document originally proposed below. It is written to and read from `apps/web` (`apps/web/lib/notification-inbox.ts`, `GET /api/notifications`, `PATCH /api/notifications/{id}/read`), never from this package directly — this package's own design (no database access) is unchanged.

**What ships now, in addition to what shipped before:**

- **Persisted inbox**: every event this package dispatches (`moderation_report_opened/escalated/resolved`, `content_published`) is now also written to `notification` via `apps/web/lib/notification-dispatch.ts`'s `notifyEvent()` call — a second, independent effect alongside email, never blocking it.
- **In-app, live indicators are unchanged**: the Moderation Badge and `in-app-indicator.ts`'s `DerivedCountIndicator` pattern still answer "how many X right now," a different question than the inbox's "what have I been told, and have I read it." Both exist side by side deliberately.
- **A Dashboard bell + `/dashboard/notifications` page** now exist for browsing the inbox.

**Original shape reference (now built exactly as proposed):** `notification` table (`recipient_id`, `type`, `entity_table`, `entity_id`, `message`, `read_at`).

## 2. Persisted User Notification Preferences — still blocked

**Requested:** Per-user control over which events trigger which channels (e.g. "email me on escalation, but not on every open report").

**Blocked because:** `platform_user` has no preferences column (`id`, `person_id`, `role`, audit columns only), and `platform_settings` is explicitly a **global**, site-wide key-value store (Database Architecture §2.3) — repurposing it for per-user data would require namespacing hacks (`user:{id}:preferences` keys) that stretch it well past its documented purpose. This was **not part of the 2026-07-21 E4 activation** — that decision was scoped to the inbox only, not preferences.

**What ships instead:** The preference **domain model** (`preferences.ts`) and its validation are fully built — a `NotificationPreference` shape, and a `NotificationPreferenceProvider` interface any future storage-backed implementation can satisfy. Since nothing can be persisted per user in V1, `FixedNotificationPreferenceProvider` returns **one hardcoded policy for every user**: every event type dispatches on every enabled channel, unconditionally. This is a real, working default — not a stub that throws — but it cannot be changed per person until storage exists.

**Path to unblocking:** Either a `platform_user.notification_preferences jsonb` column, or a dedicated `notification_preference` table — a separate Database Architecture Review Round decision, not made here.

---

## Summary Table

| Requested capability                       | Status     | What ships                                                      |
| ------------------------------------------ | ---------- | ----------------------------------------------------------------------------- |
| Persisted notification inbox (read/unread) | ✅ **Built 2026-07-21** | Real `notification` table, list/mark-read endpoints, Dashboard bell + page |
| Notification history/audit                 | ✅ **Built 2026-07-21** (for in-app events) | `notification` rows are queryable history; email delivery logs still live with the outbound provider only |
| Per-user notification preferences          | 🔴 Blocked | One fixed, hardcoded policy for every user (`DEFAULT_NOTIFICATION_POLICY`)    |

**The inbox is not a workaround** — it is the exact shape this document originally proposed, built after a real approval. Preferences still require their own Database Architecture Review Round before moving from this document into code.
