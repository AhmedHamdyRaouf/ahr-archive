/**
 * Implements: Milestone 8 §"Loading states" for the public Website —
 * distinct, lighter-weight treatment from the Dashboard's `LoadingState`
 * (Milestone 4), matching Design Principles §7 ("different registers").
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-md border bg-neutral/10" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function SiteEmptyState({ message }: { message: string }) {
  return <p className="mx-auto max-w-5xl p-8 text-center text-neutral">{message}</p>;
}
