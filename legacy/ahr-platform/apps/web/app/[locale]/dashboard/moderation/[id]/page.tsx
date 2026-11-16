import { notFound } from "next/navigation";
import { requireCapability } from "@ahr/auth";
import { getModerationReport } from "@ahr/workflow";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { ModerationResolveForm } from "./resolve-form";

/**
 * Implements: 06-Dashboard.md §5 — Moderation Queue detail/resolve view
 * ("assign to an Administrator, add resolution_notes, transition status").
 * Added: Phase 3 CTO Audit (Admin Dashboard Verification).
 */
export default async function ModerationReportDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const supabase = createRouteHandlerSupabaseClient();
  await requireCapability(nextCookieAdapter(), "moderation:manage");
  const report = await getModerationReport(supabase as never, params.id);

  if (!report) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        locale={params.locale}
        segments={[
          { label: "Moderation Queue", href: `/${params.locale}/dashboard/moderation` },
          { label: report.id },
        ]}
      />
      <div className="p-4">
        <h1 className="mb-1 text-xl font-semibold">Moderation Report</h1>
        <p className="mb-4 text-sm text-neutral">
          {report.entity_table} / {report.entity_id}
        </p>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="font-medium">Status</dt>
          <dd>
            <span className="rounded-full bg-neutral/20 px-2 py-0.5 text-xs">{report.status}</span>
          </dd>
          <dt className="font-medium">Reason</dt>
          <dd>{report.reason}</dd>
          <dt className="font-medium">Reported by</dt>
          <dd>{report.reported_by}</dd>
          <dt className="font-medium">Assigned to</dt>
          <dd>{report.assigned_to ?? "— unassigned —"}</dd>
          <dt className="font-medium">Opened</dt>
          <dd>{new Date(report.created_at).toLocaleString(params.locale)}</dd>
          {report.resolution_notes ? (
            <>
              <dt className="font-medium">Resolution notes</dt>
              <dd>{report.resolution_notes}</dd>
            </>
          ) : null}
        </dl>

        <ModerationResolveForm reportId={report.id} currentStatus={report.status} />
      </div>
    </div>
  );
}
