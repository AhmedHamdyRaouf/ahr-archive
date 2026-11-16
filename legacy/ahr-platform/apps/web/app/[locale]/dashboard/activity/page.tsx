import { requireCapability, listActivityLog } from "@ahr/auth";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EmptyState } from "@/components/cms";

/**
 * Implements: 06-Dashboard.md §4 — Activity Log Viewer ("read-only,
 * paginated, filterable by actor/action/date"). Added: Phase 3 CTO Audit
 * (Admin Dashboard Verification) — the Sidebar already linked here, and
 * the underlying activity_log table + write path have existed since
 * Milestone 3, but no page ever consumed them (the read query itself,
 * listActivityLog, was also added as part of this same fix — see
 * packages/auth/src/activity-log.ts).
 *
 * Read-only by construction: this page renders data and offers filter
 * links only — it contains no form, button, or action that writes to
 * activity_log, matching the append-only guarantee enforced independently
 * at the RLS layer (10-Security.md §7).
 */
export default async function ActivityLogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string; action?: string; actorId?: string };
}) {
  const supabase = createRouteHandlerSupabaseClient();
  await requireCapability(nextCookieAdapter(), "activity-log:read");
  const page = Number(searchParams.page ?? "1") || 1;

  const result = await listActivityLog(supabase, {
    page,
    pageSize: 20,
    filters: {
      action: searchParams.action || undefined,
      actorId: searchParams.actorId || undefined,
    },
  });

  const totalPages = Math.max(1, Math.ceil(result.totalItems / result.pageSize));

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Activity Log" }]} />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">Activity Log</h1>

        {result.data.length === 0 ? (
          <EmptyState label="No activity recorded yet." />
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">When</th>
                  <th className="p-2">Actor</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Entity</th>
                  <th className="p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-2 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString(params.locale)}
                    </td>
                    <td className="p-2">{row.actor_id ?? "—"}</td>
                    <td className="p-2">
                      <span className="rounded-full bg-neutral/20 px-2 py-0.5 text-xs">
                        {row.action}
                      </span>
                    </td>
                    <td className="p-2">
                      {row.entity_type ? `${row.entity_type} / ${row.entity_id ?? ""}` : "—"}
                    </td>
                    <td className="p-2 text-xs text-neutral">
                      {row.metadata ? JSON.stringify(row.metadata) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between text-sm text-neutral">
              <span>
                Page {result.page} of {totalPages} ({result.totalItems} total)
              </span>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <a
                    className="rounded-md border px-2 py-1"
                    href={`?page=${result.page - 1}${searchParams.action ? `&action=${searchParams.action}` : ""}`}
                  >
                    Previous
                  </a>
                ) : null}
                {result.page < totalPages ? (
                  <a
                    className="rounded-md border px-2 py-1"
                    href={`?page=${result.page + 1}${searchParams.action ? `&action=${searchParams.action}` : ""}`}
                  >
                    Next
                  </a>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
