import Link from "next/link";
import { requireSession, listActivityLog } from "@ahr/auth";
import { listModerationReports } from "@ahr/workflow";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { computeCompletenessReport } from "@/lib/completeness";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EmptyState } from "@/components/cms";

/**
 * Implements: Dashboard Designs/README.md — "Dashboard Home shows summary
 * cards (open reports count, recent activity snippet)." Gap Analysis &
 * Remaining Work Report A3 — the previous version of this page was a
 * static links list; this is the real screen Design specified, built
 * against the already-existing listModerationReports (packages/workflow)
 * and listActivityLog (packages/auth) query functions — no new backend
 * was needed, only the screen consuming them.
 *
 * State Coverage Required (Dashboard Designs/README.md): "Empty (zero
 * activity/zero open reports -> explicitly positive framing: 'No open
 * reports -- all clear,' since this is good news for the Administrator)."
 */
export default async function DashboardHome({ params }: { params: { locale: string } }) {
  await requireSession(nextCookieAdapter());
  const supabase = createRouteHandlerSupabaseClient();

  const [openReports, recentActivity, completenessReports] = await Promise.all([
    listModerationReports(supabase as never, {
      pagination: { page: 1, pageSize: 1 },
      status: "open",
    }),
    listActivityLog(supabase, { page: 1, pageSize: 5 }),
    computeCompletenessReport(supabase),
  ]);

  const openReportsCount = openReports.meta.totalItems;
  const totalIncomplete = completenessReports.reduce(
    (sum, report) => sum + report.missingTranslation.length + report.missingPhoto.length,
    0,
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs locale={params.locale} segments={[]} />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">Dashboard</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`/${params.locale}/dashboard/moderation`}
            className="rounded-md border p-4 hover:bg-neutral/5"
          >
            <p className="text-xs text-neutral">Moderation Queue</p>
            {openReportsCount === 0 ? (
              <p className="mt-1 text-sm font-medium text-success">No open reports — all clear</p>
            ) : (
              <p
                role="status"
                aria-label={`${openReportsCount} open moderation reports`}
                className="mt-1 text-2xl font-semibold"
              >
                {openReportsCount} <span className="text-sm font-normal text-neutral">open</span>
              </p>
            )}
          </Link>

          <Link
            href={`/${params.locale}/dashboard/completeness`}
            className="rounded-md border p-4 hover:bg-neutral/5"
          >
            <p className="text-xs text-neutral">Completeness</p>
            {totalIncomplete === 0 ? (
              <p className="mt-1 text-sm font-medium text-success">Nothing missing</p>
            ) : (
              <p
                role="status"
                aria-label={`${totalIncomplete} records missing a translation or photo`}
                className="mt-1 text-2xl font-semibold"
              >
                {totalIncomplete}{" "}
                <span className="text-sm font-normal text-neutral">to complete</span>
              </p>
            )}
          </Link>

          <div className="rounded-md border p-4">
            <p className="mb-2 text-xs text-neutral">Recent Activity</p>
            {recentActivity.data.length === 0 ? (
              <EmptyState label="No activity recorded yet." />
            ) : (
              <ul className="space-y-1 text-sm">
                {recentActivity.data.map((entry) => (
                  <li key={String(entry.id)} className="flex justify-between gap-2">
                    <span>{String(entry.action)}</span>
                    <span className="text-xs text-neutral">
                      {new Date(String(entry.created_at)).toLocaleString(params.locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/${params.locale}/dashboard/activity`}
              className="mt-2 inline-block text-xs text-primary underline"
            >
              View full Activity Log
            </Link>
          </div>
        </div>

        {/* Dashboard UX Enhancement Backlog #14 — "Dashboard home stats
            widgets." Counts by entity type — reuses `completenessReports`,
            already fetched above for the Completeness card, so this adds
            zero extra queries. */}
        <h2 className="mb-2 mt-8 text-sm font-semibold text-neutral">Content by type</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {completenessReports.map((report) => (
            <Link
              key={report.entityType}
              href={`/${params.locale}/dashboard/cms/${report.entityType}`}
              className="rounded-md border p-3 hover:bg-neutral/5"
            >
              <p className="text-xs text-neutral">{report.label}</p>
              <p className="text-xl font-semibold">{report.totalRecords}</p>
            </Link>
          ))}
        </div>

        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm">
          <li>
            <Link href={`/${params.locale}/dashboard/media`}>Media Library</Link>
          </li>
          <li>
            <Link href={`/${params.locale}/dashboard/settings`}>Settings</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
