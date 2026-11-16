/**
 * @ahr/notifications — public exports only (Coding Standards: "no deep
 * imports from outside a package's public exports"). See
 * docs/blocked-notifications.md for what is intentionally absent
 * (persisted inbox, persisted per-user preferences) and why.
 */

export { NOTIFICATION_CHANNELS, NOTIFICATION_EVENT_TYPES, isNotificationEventType } from "./types";
export type {
  NotificationChannel,
  NotificationEventType,
  NotificationRecipient,
  NotificationEvent,
  RenderedNotification,
} from "./types";

export type { NotificationProvider } from "./provider";

export { EmailConfigurationError, parseEmailConfiguration } from "./email-config";
export type { EmailConfiguration } from "./email-config";

export { EmailDeliveryError, HttpEmailProvider } from "./email-provider";

export { NOTIFICATION_TEMPLATES, renderTemplate } from "./templates";
export type { NotificationTemplate } from "./templates";

export {
  DEFAULT_NOTIFICATION_POLICY,
  NotificationPreferenceValidationError,
  assertValidPreferenceSet,
  isChannelEnabled,
  FixedNotificationPreferenceProvider,
} from "./preferences";
export type {
  ChannelSettings,
  NotificationPreferenceSet,
  NotificationPreferenceProvider,
} from "./preferences";

export { DerivedCountIndicator } from "./in-app-indicator";
export type { LiveIndicatorProvider } from "./in-app-indicator";

export { dispatchNotificationEvent } from "./dispatch-service";
export type { DispatchResult, DispatchContext } from "./dispatch-service";
