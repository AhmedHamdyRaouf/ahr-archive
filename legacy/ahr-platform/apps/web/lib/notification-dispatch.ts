import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dispatchNotificationEvent,
  HttpEmailProvider,
  FixedNotificationPreferenceProvider,
  type NotificationEventType,
  type DispatchResult,
} from "@ahr/notifications";
import { readEmailConfiguration } from "./notification-config";
import { createNotification } from "./notification-inbox";

/**
 * Implements: Milestone 11 §"Event-driven notification dispatch." The one
 * place apps/web actually triggers a notification.
 *
 * Updated: Database Architecture Review Round item E4, activated
 * 2026-07-21 — every dispatched event is now ALSO written to the
 * persisted `notification` table (apps/web/lib/notification-inbox.ts),
 * so the Administrator has a real inbox to revisit, not just an
 * immediate email. Email dispatch is unchanged; the persisted write is a
 * second, independent effect and never blocks or fails this function if
 * it errors (see createNotification's own doc comment). `in_app` is
 * still never registered as a dispatch *provider* here — the persisted
 * write below is a separate, additive path, not a new provider — so
 * live, derived indicators (e.g. the Moderation Badge) remain exactly as
 * they were.
 */
export async function notifyEvent(input: {
  type: NotificationEventType;
  recipientPlatformUserId: string;
  recipientEmail?: string;
  data: Record<string, string>;
  locale?: "ar" | "en";
  supabase?: SupabaseClient;
}): Promise<DispatchResult[]> {
  const emailConfig = await readEmailConfiguration();

  const results = await dispatchNotificationEvent(
    {
      preferenceProvider: new FixedNotificationPreferenceProvider(),
      providers: emailConfig ? { email: new HttpEmailProvider(emailConfig) } : {},
      locale: input.locale ?? "en",
    },
    {
      type: input.type,
      recipient: { platformUserId: input.recipientPlatformUserId, email: input.recipientEmail },
      data: input.data,
    },
  );

  for (const result of results) {
    if (result.status === "failed") {
      // eslint-disable-next-line no-console
      console.error(
        `[notifications] ${input.type} delivery failed on ${result.channel}: ${result.error}`,
      );
    }
  }

  if (input.supabase) {
    await createNotification(input.supabase, {
      recipientId: input.recipientPlatformUserId,
      type: input.type,
      entityTable: input.data.entityTable,
      entityId: input.data.entityId ?? input.data.reportId,
      data: input.data,
    });
  }

  return results;
}
