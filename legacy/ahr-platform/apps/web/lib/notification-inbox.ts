import type { SupabaseClient } from "@supabase/supabase-js";
import { createRequestScopedClient, type CookieAdapter } from "@ahr/auth";
import { NOTIFICATION_TEMPLATES, renderTemplate, type NotificationEventType } from "@ahr/notifications";

/**
 * Implements: Database Architecture Review Round item E4, activated
 * 2026-07-21 (docs/Program-Status/Decision-Log.md). Lives here
 * (apps/web/lib), not inside @ahr/notifications, for the same reason
 * apps/web/lib/settings-admin.ts and ai-recommendation-log.ts do:
 * @ahr/notifications has no database access of its own (its own README:
 * "this package has no direct database dependency of its own" — see
 * in-app-indicator.ts's DerivedCountIndicator, which takes an injected
 * query function for the exact same reason).
 */

export interface NotificationRow {
  id: string;
  recipient_id: string;
  type: NotificationEventType;
  entity_table: string | null;
  entity_id: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
}

/**
 * Writes one row to the persisted inbox. Called from the same call sites
 * that already call `notifyEvent` (email dispatch) — this is a second,
 * independent effect of the same event, not a replacement for email.
 * Never throws: a failed insert here must not turn an otherwise-successful
 * moderation transition / content publish into an error response.
 */
export async function createNotification(
  supabase: SupabaseClient,
  input: {
    recipientId: string;
    type: NotificationEventType;
    entityTable?: string;
    entityId?: string;
    data: Record<string, string>;
  },
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES[input.type];
  const { body } = renderTemplate(template, "en", input.data);

  const { error } = await supabase.from("notification").insert({
    recipient_id: input.recipientId,
    type: input.type,
    entity_table: input.entityTable ?? null,
    entity_id: input.entityId ?? null,
    message: body,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[notification-inbox] failed to write notification row:", error.message);
  }
}

/** Lists the current session's own notifications, newest first (RLS already restricts to `recipient_id = auth.uid()`). */
export async function listNotifications(
  supabase: SupabaseClient,
  options: { onlyUnread?: boolean; limit?: number } = {},
): Promise<NotificationRow[]> {
  let query = supabase
    .from("notification")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);

  if (options.onlyUnread) {
    query = query.is("read_at", null);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list notifications: ${error.message}`);
  }
  return (data ?? []) as NotificationRow[];
}

export async function getUnreadNotificationCount(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("notification")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[notification-inbox] unread count query failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function markNotificationRead(supabase: SupabaseClient, notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notification")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    throw new Error(`Failed to mark notification read: ${error.message}`);
  }
}

/**
 * Session-scoped convenience wrapper for use in Server Components (e.g.
 * the Dashboard layout's TopBar), matching apps/web/lib/moderation.ts's
 * `getOpenModerationCount` pattern exactly — a request-scoped client
 * built from the current request's cookies, not the Route Handler client.
 */
export async function getUnreadNotificationCountForSession(cookies: CookieAdapter): Promise<number> {
  const supabase = createRequestScopedClient(cookies);
  return getUnreadNotificationCount(supabase);
}
