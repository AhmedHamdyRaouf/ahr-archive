import { createRequestScopedClient } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { listNotifications } from "@/lib/notification-inbox";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { NotificationList } from "./notification-list";

/**
 * Implements: Database Architecture Review Round item E4, activated
 * 2026-07-21 (docs/Program-Status/Decision-Log.md). The real notification
 * inbox this platform previously didn't have — see
 * packages/notifications/docs/blocked-notifications.md §1 (now resolved).
 * Authentication is already enforced by the Dashboard layout (redirect on
 * no session) — this page doesn't repeat that check.
 */
export default async function NotificationsPage({ params }: { params: { locale: string } }) {
  const supabase = createRequestScopedClient(nextCookieAdapter());
  const notifications = await listNotifications(supabase);

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Notifications" }]} />
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <NotificationList initialNotifications={notifications} />
      </div>
    </div>
  );
}
