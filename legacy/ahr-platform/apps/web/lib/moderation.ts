import { createRequestScopedClient, type CookieAdapter } from "@ahr/auth";
import { DerivedCountIndicator } from "@ahr/notifications";

/**
 * Implements: API Specification 11 - Notifications API, "Get Moderation
 * Count." Originally a direct, standalone query (Milestone 3); now
 * formalized through `@ahr/notifications`' `DerivedCountIndicator`
 * (Milestone 11 §"In-app notifications may only be implemented as live,
 * derived indicators") — the exact move this file's own comment
 * anticipated ("moves into a dedicated package... when that milestone
 * begins"). Public signature is unchanged; nothing calling
 * `getOpenModerationCount` needed to change.
 */
export async function getOpenModerationCount(cookies: CookieAdapter): Promise<number> {
  const supabase = createRequestScopedClient(cookies);

  const indicator = new DerivedCountIndicator("moderation_open_count", async () => {
    const { count, error } = await supabase
      .from("moderation_report")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "escalated"]);

    if (error) {
      // Per Notifications UI (15) §19: omit rather than show a broken badge.
      // eslint-disable-next-line no-console
      console.error("[moderation-count] query failed:", error.message);
      return 0;
    }
    return count ?? 0;
  });

  return indicator.getCount();
}
