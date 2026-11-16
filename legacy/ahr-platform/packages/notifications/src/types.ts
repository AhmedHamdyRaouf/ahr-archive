/**
 * Implements: Milestone 11 — Notifications. See ../docs/blocked-
 * notifications.md for what is intentionally absent (persisted inbox,
 * persisted per-user preferences) and why.
 */

export const NOTIFICATION_CHANNELS = ["email", "in_app"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

/**
 * Every event type this milestone actually wires up. Deliberately small —
 * only events with a real, already-built trigger point in this platform
 * (Milestone 10's Moderation workflow, Milestone 4/5's content
 * publication) are included; nothing speculative.
 */
export const NOTIFICATION_EVENT_TYPES = [
  "moderation_report_opened",
  "moderation_report_escalated",
  "moderation_report_resolved",
  "content_published",
] as const;
export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export function isNotificationEventType(value: string): value is NotificationEventType {
  return (NOTIFICATION_EVENT_TYPES as readonly string[]).includes(value);
}

export interface NotificationRecipient {
  /** platform_user.id — the only stable recipient identifier this schema has (Database Architecture §2.1). */
  platformUserId: string;
  /** Resolved separately (Milestone 3's identity chain) — this package never queries `person` itself. */
  email?: string;
}

/**
 * The data a specific event carries — deliberately generic (a bag of
 * named values) so `templates.ts`'s placeholder substitution can render
 * any event without this type needing a variant per event.
 */
export interface NotificationEvent {
  type: NotificationEventType;
  recipient: NotificationRecipient;
  data: Record<string, string>;
}

export interface RenderedNotification {
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  subject: string; // meaningful for email; ignored for in_app
  body: string;
}
