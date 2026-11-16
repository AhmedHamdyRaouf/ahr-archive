/**
 * Implements: Packages Specification Package 10 §4/§13; UI/UX Specification,
 * Notifications UI (15). A live count of open moderation reports —
 * distinct from the persisted notification inbox (`notification-bell.tsx`),
 * added 2026-07-21 (Database Architecture Review Round item E4). This
 * badge answers "how many reports are open right now"; the bell answers
 * "what have I personally been told, and have I read it." Both exist
 * side by side deliberately, per notification.sql's own migration note.
 */
export function ModerationBadge({ openCount }: { openCount: number }) {
  if (openCount <= 0) {
    // Per Notifications UI (15) §17: quiet zero-state, not a distracting "0".
    return null;
  }

  return (
    <span
      role="status"
      aria-label={`${openCount} open moderation reports`}
      className="rounded-full bg-warning px-2 py-0.5 text-xs"
    >
      {openCount}
    </span>
  );
}
