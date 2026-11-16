import Link from "next/link";

/**
 * Implements: API Specification 12 - Error Codes (FORBIDDEN, 403) — the
 * UI-level equivalent, shown when an authenticated session lacks the
 * capability a page requires (14 - Permissions Matrix). In V1, with exactly
 * one active role holding every capability (Database Architecture §7), this
 * page is unreachable in practice for the single Administrator — it exists
 * now so the shell is ready for Release 2's additional roles without a
 * rewrite (Milestone 3 objective: "role-aware, not multi-role-enabled").
 */
export default function ForbiddenPage({ params }: { params: { locale: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="text-neutral">Your account doesn&apos;t have permission to view this page.</p>
      <Link href={`/${params.locale}/dashboard`} className="rounded-md bg-primary p-2">
        Back to Dashboard
      </Link>
    </main>
  );
}
