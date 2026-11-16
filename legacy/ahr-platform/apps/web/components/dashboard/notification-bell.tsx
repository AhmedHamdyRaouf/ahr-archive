import Link from "next/link";
import { Bell } from "lucide-react";

/**
 * Implements: Database Architecture Review Round item E4, activated
 * 2026-07-21 (docs/Program-Status/Decision-Log.md). Links to the real
 * notification inbox (`/dashboard/notifications`) — distinct from
 * `ModerationBadge`, which stays a live "open reports" count, not a
 * personal inbox. Uses `lucide-react` per the ratified icon decision
 * (Decision Log item C4).
 */
export function NotificationBell({ locale, unreadCount }: { locale: string; unreadCount: number }) {
  return (
    <Link
      href={`/${locale}/dashboard/notifications`}
      className="relative flex items-center"
      aria-label={
        unreadCount > 0 ? `Notifications — ${unreadCount} unread` : "Notifications — none unread"
      }
    >
      <Bell size={20} strokeWidth={2} />
      {unreadCount > 0 ? (
        <span
          role="status"
          className="absolute -right-1.5 -top-1.5 rounded-full bg-danger px-1.5 py-0.5 text-[10px] leading-none text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
