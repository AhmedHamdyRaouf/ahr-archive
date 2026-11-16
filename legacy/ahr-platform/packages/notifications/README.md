# @ahr/notifications

**Status:** 🟢 Milestone 11 — Notifications implemented and tested (32 passing unit tests). Built strictly against the Frozen v1 Database Architecture — no schema changes in this package itself.

**Update 2026-07-21:** A persisted notification inbox now exists (Database Architecture Review Round item E4, approved by the data owner) — see [`docs/blocked-notifications.md`](./docs/blocked-notifications.md), updated to reflect this. The `notification` table and its read/write logic live in `apps/web` (`apps/web/lib/notification-inbox.ts`), not in this package, for the same reason `email-config.ts`'s actual database reads live in `apps/web/lib/settings-admin.ts` — this package has no database access of its own by design. Per-user notification *preferences* remain unbuilt (see the doc — a separate, smaller gap).

## Modules

| File                  | Responsibility                                                                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider.ts`         | The `NotificationProvider` abstraction — same discipline as Milestone 6's `StorageAdapter`                                                                                                    |
| `email-config.ts`     | Parses `platform_settings.email_configuration` — only non-secret operational config lives there; the API key itself lives in a server-side env var named by the config, never in the database |
| `email-provider.ts`   | `HttpEmailProvider` — a real, working implementation calling a configurable HTTP email API (Resend/SendGrid/Postmark-shaped)                                                                  |
| `templates.ts`        | Bilingual (ar/en) subject+body templates, one per wired-up event type, with `{{placeholder}}` substitution                                                                                    |
| `preferences.ts`      | The preference domain model + validation, and `FixedNotificationPreferenceProvider` — the one fixed policy every user gets in V1                                                              |
| `in-app-indicator.ts` | Formalizes the Moderation Badge's live-derived-count pattern (Milestone 3) as a reusable interface                                                                                            |
| `dispatch-service.ts` | `dispatchNotificationEvent` — renders a template, checks the (fixed) preference policy per channel, calls each enabled channel's provider; one channel's failure never blocks another         |

## Wired-Up Events

Only events with a real, already-built trigger point are included — nothing speculative: `moderation_report_opened`/`escalated`/`resolved` (Milestone 10's workflow) and `content_published` (Milestone 4/5's content lifecycle). `apps/web`'s Route Handlers call `dispatchNotificationEvent` after these actions succeed.

## Testing

```bash
npm run test --workspace=packages/notifications      # 32 tests
npm run typecheck --workspace=packages/notifications
```
