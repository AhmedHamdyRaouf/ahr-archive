/**
 * Implements: Milestone 4 — Empty States, Loading States, Error States.
 * Generic — no entity-specific copy lives here; callers pass their own
 * label (e.g. "No Works yet"), this module only supplies the consistent
 * layout/structure (UX Guidelines, doc 18: "every list/grid has a designed
 * empty state... never just a blank area").
 */

export function EmptyState({
  label,
  action,
}: {
  label: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-neutral">
      <p>{label}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-md bg-primary p-2 text-white"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="space-y-2 p-4">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-8 animate-pulse rounded-md bg-neutral/20" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 p-12 text-center">
      <p className="text-danger">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="rounded-md border p-2">
          Try again
        </button>
      ) : null}
    </div>
  );
}
