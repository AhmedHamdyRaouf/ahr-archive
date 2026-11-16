# AHR Platform v1 — Notifications API

**Status:** 🔒 Frozen, **every endpoint below except Get Moderation Count is Specified but Blocked — see the gap note**

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
- **Business Rules:** Derived live from `moderation_report` where `status IN ('open', 'escalated')` — not a stored/cached notification record.
- **Notes:** **This is the only notification-related capability that actually exists in V1.** It is not a general notification feed — see the gap note below for everything else requested.

---

## Specified but Blocked — Schema Gap

Packages Specification Package 10 §13 established that **no `notification` table exists in the Frozen v1 Database Architecture.** The following were requested for this document but have no data to operate on:

| Requested endpoint | Purpose (if it existed) | Blocked because |
|---|---|---|
| `GET /api/notifications` | List | No `notification` table |
| `POST /api/notifications/{id}/read` | Read | Same |
| `GET /api/notifications/unread-count` | Unread count | Same (distinct from the one real endpoint above, which is specifically moderation-report-derived, not a general unread count) |
| `POST /api/notifications/mark-all-read` | Mark All Read | Same |
| `DELETE /api/notifications/{id}` | Delete | Same |

**None of these are implemented with a workaround** (e.g. faking them against `activity_log` or `moderation_report` directly) — `activity_log` is an audit trail, not a per-recipient notification inbox, and conflating the two would misrepresent both. This entire endpoint group becomes real only after a `notification` table is added via a Database Architecture Review Round 2 (Packages Specification Package 10 §22), at which point this document is the natural place to specify them properly (recipient-scoped list, read/unread state per `platform_user`, etc.).

---

**Status:** 🔒 Frozen — five of six requested endpoints are schema-blocked; this is a scope limitation of V1, not a documentation gap
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 10; Notification Experience (Phase 7)
