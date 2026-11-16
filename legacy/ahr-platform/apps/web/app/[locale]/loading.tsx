/**
 * Implements: UI/UX Specification, UX Guidelines (18) — "Skeleton
 * placeholders for content that takes a moment to load... never a bare
 * spinner covering the whole screen for routine loads." This is the
 * fallback for route-level Suspense boundaries Next.js creates
 * automatically per route segment.
 */
export default function GlobalLoading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center p-8"
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-pulse rounded-full bg-neutral" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
