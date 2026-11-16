import Link from "next/link";
import { requireSession } from "@ahr/auth";
import { nextCookieAdapter } from "@/lib/cookies";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { computeCompletenessReport } from "@/lib/completeness";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";

/**
 * Implements: Dashboard UX Enhancement Backlog #5 — "Completeness
 * Dashboard." Surfaces exactly which records are missing a required
 * translation or a photo, with a direct link to each one's edit screen —
 * so Ahmed can see at a glance where to focus the remaining real-content
 * work (see AHR-Platform-Handoff.md §2's still-open photo upload item),
 * instead of clicking through every entity list looking for gaps.
 */
export default async function CompletenessPage({ params }: { params: { locale: string } }) {
  await requireSession(nextCookieAdapter());
  const supabase = createRouteHandlerSupabaseClient();

  const reports = await computeCompletenessReport(supabase);
  const reportsWithIssues = reports.filter(
    (report) => report.missingTranslation.length > 0 || report.missingPhoto.length > 0,
  );
  const totalMissingTranslation = reports.reduce(
    (sum, report) => sum + report.missingTranslation.length,
    0,
  );
  const totalMissingPhoto = reports.reduce((sum, report) => sum + report.missingPhoto.length, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <Breadcrumbs locale={params.locale} segments={[{ label: "Completeness" }]} />
      <div className="p-4">
        <h1 className="mb-1 text-xl font-semibold">Completeness</h1>
        <p className="mb-4 text-sm text-neutral">
          Records missing a required translation or a photo, across every entity type.
        </p>

        {reportsWithIssues.length === 0 ? (
          <p role="status" className="text-sm font-medium text-success">
            Nothing missing — every record has its required translations and photos.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm">
              <strong>{totalMissingTranslation}</strong> record(s) missing a translation,{" "}
              <strong>{totalMissingPhoto}</strong> missing a photo.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reportsWithIssues.map((report) => (
              <div key={report.entityType} className="rounded-md border p-4">
                <p className="text-sm font-semibold">{report.label}</p>
                <p className="text-xs text-neutral">{report.totalRecords} total</p>

                {report.missingTranslation.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs text-neutral">
                      Missing translation ({report.missingTranslation.length})
                    </p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {report.missingTranslation.slice(0, 5).map((issue) => (
                        <li key={issue.id}>
                          <Link
                            href={`/${params.locale}/dashboard/cms/${report.entityType}/${issue.id}`}
                            className="text-primary underline"
                          >
                            {issue.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {report.missingTranslation.length > 5 ? (
                      <p className="mt-1 text-xs text-neutral">
                        +{report.missingTranslation.length - 5} more
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {report.missingPhoto.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs text-neutral">
                      Missing photo ({report.missingPhoto.length})
                    </p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {report.missingPhoto.slice(0, 5).map((issue) => (
                        <li key={issue.id}>
                          <Link
                            href={`/${params.locale}/dashboard/cms/${report.entityType}/${issue.id}`}
                            className="text-primary underline"
                          >
                            {issue.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {report.missingPhoto.length > 5 ? (
                      <p className="mt-1 text-xs text-neutral">
                        +{report.missingPhoto.length - 5} more
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
