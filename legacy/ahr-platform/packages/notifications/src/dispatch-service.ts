/**
 * Implements: Milestone 11 §"Event-driven notification dispatch." The
 * one place an event becomes an actual delivery attempt: render the
 * template → check the (fixed, V1) preference policy per channel → call
 * each enabled channel's provider. A delivery failure on one channel
 * never blocks another (Observability principle, Phase 8 — failures are
 * surfaced, not allowed to cascade).
 */

import { NOTIFICATION_TEMPLATES, renderTemplate } from "./templates";
import { isChannelEnabled, type NotificationPreferenceProvider } from "./preferences";
import type { NotificationProvider } from "./provider";
import type { NotificationChannel, NotificationEvent, RenderedNotification } from "./types";

export interface DispatchResult {
  channel: NotificationChannel;
  status: "sent" | "skipped" | "failed";
  error?: string;
}

export interface DispatchContext {
  preferenceProvider: NotificationPreferenceProvider;
  providers: Partial<Record<NotificationChannel, NotificationProvider>>;
  locale: "ar" | "en";
}

/**
 * Dispatches a single event across every channel the recipient's
 * preferences enable and a provider exists for. Returns one result per
 * channel actually considered — callers (e.g. Milestone 10's workflow
 * event triggers) can log/inspect these, but this function never throws
 * for a single channel's failure; it collects the outcome instead.
 */
export async function dispatchNotificationEvent(
  ctx: DispatchContext,
  event: NotificationEvent,
): Promise<DispatchResult[]> {
  const template = NOTIFICATION_TEMPLATES[event.type];
  const { subject, body } = renderTemplate(template, ctx.locale, event.data);

  const preferences = await ctx.preferenceProvider.getPreferences(event.recipient.platformUserId);
  const results: DispatchResult[] = [];

  for (const [channel, provider] of Object.entries(ctx.providers) as Array<
    [NotificationChannel, NotificationProvider]
  >) {
    if (!isChannelEnabled(preferences, event.type, channel)) {
      results.push({ channel, status: "skipped" });
      continue;
    }

    const rendered: RenderedNotification = { channel, recipient: event.recipient, subject, body };

    try {
      await provider.send(rendered);
      results.push({ channel, status: "sent" });
    } catch (error) {
      results.push({
        channel,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
