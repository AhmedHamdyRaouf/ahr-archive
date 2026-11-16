/**
 * Implements: API Specification 08 - Dashboard API, "List Moderation
 * Reports" / "Get Moderation Report." Read-side queries — never
 * implemented until now (Milestone 3 only ever read the open COUNT for
 * the Top Bar badge, via a separate ad hoc query in apps/web).
 */

import {
  normalizePagination,
  buildPaginationMeta,
  type SupabaseLikeClient,
  type QueryBuilderLike,
} from "@ahr/cms-core";
import type { ModerationReportRecord, ModerationStatus } from "./types";

export interface ModerationListResult {
  data: ModerationReportRecord[];
  meta: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

export async function listModerationReports(
  client: SupabaseLikeClient,
  params: { pagination: { page: number; pageSize: number }; status?: ModerationStatus },
): Promise<ModerationListResult> {
  const pagination = normalizePagination(params.pagination);

  let builder = client
    .from("moderation_report")
    .select("*", { count: "exact" }) as unknown as QueryBuilderLike;
  if (params.status) {
    builder = builder.eq("status", params.status);
  }
  builder = builder.range(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize - 1,
  );

  const { data, count, error } = await builder;
  if (error) {
    throw new Error(`Failed to list moderation reports: ${error.message}`);
  }

  return {
    data: (data ?? []) as ModerationReportRecord[],
    meta: buildPaginationMeta(pagination, count ?? 0),
  };
}

/** `select().eq("id", id)` — @ahr/cms-core's QueryBuilderLike has no `.maybeSingle()`; take the first (only) row from the array result instead. */
export async function getModerationReport(
  client: SupabaseLikeClient,
  id: string,
): Promise<ModerationReportRecord | null> {
  const builder = client.from("moderation_report").select("*") as unknown as QueryBuilderLike;
  const { data, error } = await builder.eq("id", id);
  if (error) {
    throw new Error(`Failed to get moderation report "${id}": ${error.message}`);
  }
  const rows = (data ?? []) as ModerationReportRecord[];
  return rows[0] ?? null;
}
