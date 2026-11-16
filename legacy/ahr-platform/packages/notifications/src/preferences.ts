/**
 * Implements: Milestone 11 §"User notification preferences using the
 * existing architecture." See ../docs/blocked-notifications.md §2 — no
 * per-user persistence exists. This module builds the domain model and
 * validation so wiring up real storage later is a drop-in
 * `NotificationPreferenceProvider` implementation, not a redesign.
 */

import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENT_TYPES,
  type NotificationChannel,
  type NotificationEventType,
} from "./types";

/** Which channels are enabled for a single event type. */
export type ChannelSettings = Partial<Record<NotificationChannel, boolean>>;

/** A full preference set — one ChannelSettings per event type. */
export type NotificationPreferenceSet = Record<NotificationEventType, ChannelSettings>;

export class NotificationPreferenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationPreferenceValidationError";
  }
}

/** Validates a (possibly partial/untrusted) preference set — every key must be a real event type, every channel a real channel, every value a boolean. */
export function assertValidPreferenceSet(input: Record<string, unknown>): void {
  for (const [eventType, channelSettings] of Object.entries(input)) {
    if (!(NOTIFICATION_EVENT_TYPES as readonly string[]).includes(eventType)) {
      throw new NotificationPreferenceValidationError(
        `Unknown notification event type: "${eventType}".`,
      );
    }
    if (
      typeof channelSettings !== "object" ||
      channelSettings === null ||
      Array.isArray(channelSettings)
    ) {
      throw new NotificationPreferenceValidationError(
        `Channel settings for "${eventType}" must be an object.`,
      );
    }
    for (const [channel, enabled] of Object.entries(channelSettings as Record<string, unknown>)) {
      if (!(NOTIFICATION_CHANNELS as readonly string[]).includes(channel)) {
        throw new NotificationPreferenceValidationError(
          `Unknown notification channel: "${channel}".`,
        );
      }
      if (typeof enabled !== "boolean") {
        throw new NotificationPreferenceValidationError(
          `Channel setting for "${eventType}.${channel}" must be a boolean.`,
        );
      }
    }
  }
}

/**
 * The single fixed policy every user gets in V1 (no per-user override is
 * possible — see docs/blocked-notifications.md §2): every event type
 * dispatches on both email and in_app, unconditionally.
 */
export const DEFAULT_NOTIFICATION_POLICY: NotificationPreferenceSet = Object.fromEntries(
  NOTIFICATION_EVENT_TYPES.map((eventType) => [eventType, { email: true, in_app: true }]),
) as NotificationPreferenceSet;

export interface NotificationPreferenceProvider {
  /** Returns the effective preference set for a given user — V1's implementation ignores the argument entirely (see FixedNotificationPreferenceProvider). */
  getPreferences(platformUserId: string): Promise<NotificationPreferenceSet>;
}

/**
 * The only `NotificationPreferenceProvider` implementation that can exist
 * in V1 — there is nowhere to read a per-user override FROM. Returns
 * `DEFAULT_NOTIFICATION_POLICY` for every user, always. A future storage-
 * backed provider satisfies the same interface without any caller needing
 * to change.
 */
export class FixedNotificationPreferenceProvider implements NotificationPreferenceProvider {
  async getPreferences(_platformUserId: string): Promise<NotificationPreferenceSet> {
    return DEFAULT_NOTIFICATION_POLICY;
  }
}

export function isChannelEnabled(
  preferences: NotificationPreferenceSet,
  eventType: NotificationEventType,
  channel: NotificationChannel,
): boolean {
  return preferences[eventType]?.[channel] ?? false;
}
