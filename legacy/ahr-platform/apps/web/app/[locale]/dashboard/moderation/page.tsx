import Link from "next/link";
import { requireCapability } from "@ahr/auth";
import { listModerationReports, isModerationStatus, MODERATION_STATUS_VALUES } from "@ahr/workflow";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EmptyState } from "@/components/cms";

/**
 * Implements: 06-Dashboard.md §5 — Moderation Queue ("List view: filterable
 * by status..."). Added: Phase 3 CTO Audit (Admin Dashboard Verification)
 * — @ahr/workflow's full backend (listModerationReports,
 * transitionModerationReport, assignModerationReport) and the matching
 * /api/moderation-reports Route Handlers have existed since Milestone 10,
 * but the Sidebar's "Moderation Queue" link had no page to land on.
 * Calls listModerationReports directly (Server Component, in-process —
 * API Integration Rules doc 08) rather than round-tripping through the
 * Route Handler that also exists for external callers.
 */
export default async function ModerationQueuePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string; status?: string };
}) {
  const supabase = createRouteHandlerSupabaseClient();
  await requireCapability(nextCookieAdapter(), "moderation:manage");
  const page = Number(searchParams.page ?? "1") || 1;
  const status =
    searchParams.status && isModerationStatus(searchParams.status)
      ? searchParams.status
      : undefined;

  const result = await listModerationReports(supabase as never, {
    pagination: { page, pageSize: 20 },
    status,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Moderation Queue" }]} />
      <div className="p-4">
        <h1 className="mb-4 text-xl font-semibold">Moderation Queue</h1>

        <div className="mb-4 flex gap-2 text-sm">
          <Link
            href="?"
            className={`rounded-full px-3 py-1 ${!status ? "bg-primary text-white" : "border"}`}
          >
            All
          </Link>
          {MODERATION_STATUS_VALUES.map((value) => (
            <Link
              key={value}
              href={`?status=${value}`}
              className={`rounded-full px-3 py-1 ${status === value ? "bg-primary text-white" : "border"}`}
            >
              {value}
            </Link>
          ))}
        </div>

        {result.data.length === 0 ? (
          <EmptyState label="No moderation reports match this filter." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">Status</th>
                <th className="p-2">Entity</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Opened</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((report) => (
                <tr key={report.id} className="border-b">
                  <td className="p-2">
                    <span className="rounded-full bg-neutral/20 px-2 py-0.5 text-xs">
                      {report.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {report.entity_table} / {report.entity_id}
                  </td>
                  <td className="p-2">{report.reason}</td>
                  <td className="p-2 whitespace-nowrap">
                    {new Date(report.created_at).toLocaleDateString(params.locale)}
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/${params.locale}/dashboard/moderation/${report.id}`}
                      className="text-primary underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-4 text-xs text-neutral">
          Page {result.meta.page} of {result.meta.totalPages} ({result.meta.totalItems} total)
        </p>
      </div>
    </div>
  );
}
