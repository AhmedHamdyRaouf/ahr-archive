# AHR Platform v1 — Notifications API

**Status:** 🟢 Persisted inbox activated 2026-07-21 (Database Architecture Review Round item E4) — List and Mark Read now exist; three smaller endpoints remain unbuilt follow-up work (see below).

Base path: `/api/notifications`

---

### Get Moderation Count

- **Purpose:** Return the count of open moderation reports, for the Dashboard's `ModerationBadge`.
- **Package:** Notifications
- **HTTP Method:** GET
- **Route:** `/api/notifications/moderation-count`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None.
- **Success Response:** `200 { "data": { "openCount": <integer> } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`; on any internal failure, the recommended client behavior is to omit the badge rather than show a broken state (Packages Specification Package 10 §19) — the endpoint itself still returns a normal `500` for logging purposes.
- **Business Rules:** Derived live from `moderation_report` where `status IN ('open', 'escalated')` — not a stored/cached notification record. Unchanged by the 2026-07-21 activation below — this answers a different question ("how many reports are open right now") than the inbox does ("what have I personally been told, and have I read it").

---

### List Notifications

- **Purpose:** List the signed-in Administrator's own notifications, newest first.
- **Package:** Notifications
- **HTTP Method:** GET
- **Route:** `/api/notifications`
- **Authentication Required:** Yes
- **Required Role:** Any authenticated session (see Business Rules — this is inherently "your own data," not a capability-gated action)
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** `unread` (optional, `"true"` to return only unread notifications)
- **Request Body:** None
- **Success Response:** `200 { "data": [ { "id": uuid, "recipient_id": uuid, "type": string, "entity_table": string | null, "entity_id": uuid | null, "message": string, "read_at": timestamp | null, "created_at": timestamp } ], "error": null }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHORIZED` if not signed in.
- **Business Rules:** Row Level Security (`notification_recipient_read`, `recipient_id = auth.uid()`) guarantees this can never return another user's notifications — the Route Handler itself performs no additional recipient filtering beyond what RLS already enforces.
- **Notes:** Added 2026-07-21 (Decision Log item E4). `apps/web/lib/notification-inbox.ts`.

---

### Mark Notification Read

- **Purpose:** Mark one of the signed-in Administrator's own notifications as read.
- **Package:** Notifications
- **HTTP Method:** `PATCH` (originally speculated as `POST` in this document's prior draft — implemented as `PATCH` since this updates an existing resource's state, matching this platform's convention elsewhere, e.g. CMS status transitions)
- **Route:** `/api/notifications/{id}/read`
- **Authentication Required:** Yes
- **Required Role:** Any authenticated session (same reasoning as List, above)
- **Path Parameters:** `id` — the notification's own id.
- **Request Body:** None
- **Success Response:** `200 { "data": { "ok": true }, "error": null }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHORIZED` if not signed in.
- **Business Rules:** Row Level Security (`notification_recipient_update`, `recipient_id = auth.uid()`) guarantees this can never touch another user's row.
- **Notes:** Added 2026-07-21 (Decision Log item E4).

---

## Still Not Built — Smaller Follow-Up Work

Three of the originally-speculated endpoints remain unbuilt. Unlike the original "schema gap" framing, these are no longer blocked by a missing table — the `notification` table exists now — they simply haven't been implemented yet:

| Requested endpoint | Purpose | Status |
|---|---|---|
| `GET /api/notifications/unread-count` | A dedicated unread-count endpoint (distinct from Get Moderation Count) | Not yet built — `getUnreadNotificationCount()` exists in `apps/web/lib/notification-inbox.ts` and is already used server-side by the Dashboard layout for the TopBar bell; no separate API route wraps it yet. |
| `POST /api/notifications/mark-all-read` | Mark every notification read in one call | Not yet built |
| `DELETE /api/notifications/{id}` | Delete a notification | Not yet built |

These are tracked as new Development follow-up work, not schema-blocked items — see `docs/Program-Status/Gap-Analysis-and-Remaining-Work.md`.

---

**Status:** 🟢 Core inbox (List, Mark Read) built and live 2026-07-21; three smaller endpoints remain as follow-up work
**Reviewed By:** Claude
**Approved By:** Data owner (2026-07-21, activation decision)
**Dependencies:** Packages Specification Package 10; Notification Experience (Phase 7); `docs/Program-Status/Decision-Log.md` item E4
