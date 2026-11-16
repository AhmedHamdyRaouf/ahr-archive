import Link from "next/link";
import { ModerationBadge } from "./moderation-badge";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { GlobalSearchBox } from "./global-search-box";

/**
 * Implements: UI/UX Specification, Dashboard UI (12) §9 — Top Bar: locale
 * switch, Moderation badge, account/sign-out.
 *
 * `openModerationCount` is passed in rather than fetched here, since the
 * Moderation Queue package (Package 07 backend) owns that query — this
 * component only renders what it's given (Coding Standards: one place per
 * rule; this is a presentation component, not a data-fetching one).
 *
 * Updated 2026-07-21: `unreadNotificationCount` added alongside the real
 * notification inbox (Database Architecture Review Round item E4) — same
 * "passed in, not fetched here" rule.
 */
export function TopBar({
  locale,
  personId,
  openModerationCount,
  unreadNotificationCount,
}: {
  locale: string;
  personId: string;
  openModerationCount: number;
  unreadNotificationCount: number;
}) {
  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link href={`/${locale}/dashboard/moderation`} className="flex items-center gap-2">
        <span>Moderation</span>
        <ModerationBadge openCount={openModerationCount} />
      </Link>

      <div className="flex items-center gap-4">
        <GlobalSearchBox locale={locale} />
        <NotificationBell locale={locale} unreadCount={unreadNotificationCount} />
        <Link href={`/${otherLocale}/dashboard`}>{otherLocale.toUpperCase()}</Link>
        <UserMenu locale={locale} personId={personId} />
      </div>
    </header>
  );
}
