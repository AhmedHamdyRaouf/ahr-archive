"use client";

/**
 * Implements: Development Specification 10 - Error Handling Strategy —
 * "No stack trace, database error string, or third-party provider error
 * message ever reaches the client directly." This boundary catches any
 * unhandled rendering/runtime error and shows a generic message only; the
 * actual error is available to `error` for server-side logging integration
 * (11 - Logging Strategy) but is never rendered to the user.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // eslint-disable-next-line no-console
  console.error("[error boundary]", error.digest ?? error.message);

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-neutral">
        Please try again. If this keeps happening, contact the platform owner.
      </p>
      <button type="button" onClick={reset} className="rounded-md bg-primary p-2">
        Try again
      </button>
    </main>
  );
}
