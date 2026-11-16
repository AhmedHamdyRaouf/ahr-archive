/**
 * Implements: Milestone 8 §"Error pages." A locale-aware 404 for the
 * public Website specifically — rendered WITHIN the (site) layout, so
 * SiteHeader/SiteFooter remain visible (distinct from the true global
 * `app/not-found.tsx`, which has no locale context to work with at all).
 *
 * Next.js's `not-found.tsx` convention does not receive route params
 * (a framework limitation, not a choice made here) — both languages are
 * shown together rather than guessing the visitor's locale.
 */
export default function SiteNotFound() {
  return (
    <div className="mx-auto max-w-3xl p-12 text-center">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-neutral">This page could not be found. / هذه الصفحة غير موجودة.</p>
    </div>
  );
}
