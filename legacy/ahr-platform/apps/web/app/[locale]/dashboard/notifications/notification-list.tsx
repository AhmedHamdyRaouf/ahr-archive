"use client";

import { useState } from "react";
import type { NotificationRow } from "@/lib/notification-inbox";

/**
 * Implements: Database Architecture Review Round item E4, activated
 * 2026-07-21. Client component so "mark as read" can update the list
 * immediately without a full page reload — the same pattern already used
 * by SettingRow/AISuggestionPanel elsewhere in this Dashboard.
 */
export function NotificationList({ initialNotifications }: { initialNotifications: NotificationRow[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(id: string) {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
    );
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // The count badge in the TopBar will simply be one behind until the
      // next page load if this fails — not worth reverting the optimistic
      // update and confusing the Administrator over a background sync.
    }
  }

  if (notifications.length === 0) {
    return <p className="text-sm text-neutral">No notifications yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`rounded-md border p-3 text-sm ${
            notification.read_at ? "opacity-60" : "border-primary bg-primary/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{notification.message}</p>
            {!notification.read_at ? (
              <button
                type="button"
                onClick={() => markRead(notification.id)}
                className="shrink-0 whitespace-nowrap text-xs text-primary underline"
              >
                Mark read
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-neutral">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
