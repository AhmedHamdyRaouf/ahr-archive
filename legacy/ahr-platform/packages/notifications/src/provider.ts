/**
 * Implements: Milestone 11 §"Notification provider abstraction... future
 * extensibility." Same abstraction discipline as Milestone 6's
 * `StorageAdapter` and Milestone 4's `MediaPickerAdapter`: no caller
 * depends on a concrete provider directly — only this interface. Adding a
 * new channel later (SMS, push) means writing one new provider, never
 * touching `dispatch-service.ts`.
 */

import type { RenderedNotification } from "./types";

export interface NotificationProvider {
  /** Which channel this provider delivers (matches one value in NOTIFICATION_CHANNELS). */
  readonly channel: "email" | "in_app";

  /** Delivers an already-rendered notification. Throws on delivery failure — the caller (dispatch-service.ts) decides how to handle that. */
  send(notification: RenderedNotification): Promise<void>;
}
