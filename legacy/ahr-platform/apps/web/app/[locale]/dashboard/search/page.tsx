import Link from "next/link";
import { requireSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { performGlobalSearch } from "@/lib/global-search";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EmptyState } from "@/components/cms";

/**
 * Implements: Dashboard UX Enhancement Backlog #10 — "Global Search."
 * Results grouped by entity type, each linking straight to that record's
 * edit screen.
 */
export default async function GlobalSearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  await requireSession(nextCookieAdapter());
  const supabase = createRouteHandlerSupabaseClient();

  const query = searchParams.q ?? "";
  const groups = query.trim() ? await performGlobalSearch(supabase, query) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Search" }]} />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        {!query.trim() ? (
          <p className="text-sm text-neutral">Type something in the search box above.</p>
        ) : groups.length === 0 ? (
          <EmptyState label={`No matches for "${query}" in any entity type.`} />
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.entityType}>
                <p className="mb-2 text-sm font-semibold">
                  {group.label} ({group.totalMatches})
                </p>
                <ul className="space-y-1 text-sm">
                  {group.results.map((result) => (
                    <li key={result.id}>
                      <Link
                        href={`/${params.locale}/dashboard/cms/${group.entityType}/${result.id}`}
                        className="text-primary underline"
                      >
                        {result.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {group.totalMatches > group.results.length ? (
                  <Link
                    href={`/${params.locale}/dashboard/cms/${group.entityType}?q=${encodeURIComponent(query)}`}
                    className="mt-1 inline-block text-xs text-primary underline"
                  >
                    View all {group.totalMatches} in {group.label} →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
