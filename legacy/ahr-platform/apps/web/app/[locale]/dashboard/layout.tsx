import { redirect } from "next/navigation";
import { getSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { getOpenModerationCount } from "@/lib/moderation";
import { getUnreadNotificationCountForSession } from "@/lib/notification-inbox";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProvider } from "@/components/cms";

/**
 * Implements: Milestone 3 §6 — Initial Platform Shell. Reusable by every
 * future dashboard module (CMS, Contacts & Organizations, Media Library,
 * Moderation Queue, Activity Log, Settings) via this one layout — no
 * module reimplements the Sidebar/TopBar/session check itself.
 *
 * Session enforcement here is deliberate defense in depth alongside
 * middleware.ts (Security Implementation Rules, Development Specification
 * 14): middleware performs a fast Supabase-session-only check; this layout
 * performs the FULL Identity Resolution Chain (platform_user → role),
 * including the PlatformUserProvisioningError case middleware can't see.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getSession(nextCookieAdapter());

  if (!session.authenticated) {
    redirect(`/${params.locale}/unauthorized`);
  }

  const openModerationCount = await getOpenModerationCount(nextCookieAdapter());
  const unreadNotificationCount = await getUnreadNotificationCountForSession(nextCookieAdapter());

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="dashboard-theme flex min-h-screen">
          <Sidebar locale={params.locale} />
          <div className="flex-1">
            <TopBar
              locale={params.locale}
              personId={session.personId}
              openModerationCount={openModerationCount}
              unreadNotificationCount={unreadNotificationCount}
            />
            <main className="p-4">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
