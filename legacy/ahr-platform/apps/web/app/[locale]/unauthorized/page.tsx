import Link from "next/link";

/**
 * Implements: API Specification 12 - Error Codes (UNAUTHENTICATED, 401) —
 * the UI-level equivalent, shown when a Dashboard page is reached without a
 * valid session (defense in depth alongside middleware.ts's redirect).
 */
export default function UnauthorizedPage({ params }: { params: { locale: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Sign in required</h1>
      <p className="text-neutral">You need to sign in to view this page.</p>
      <Link href={`/${params.locale}/login`} className="rounded-md bg-primary p-2">
        Go to Sign In
      </Link>
    </main>
  );
}
