/**
 * Implements: Database Architecture (Frozen v1) §2.4 — activity_log;
 * Development Specification 11 - Logging Strategy ("no code path writes
 * technical/operational logs into activity_log, and vice versa").
 *
 * One shared writer function — every authentication event (login, logout,
 * failed login, password reset, session expired) goes through this, never
 * a direct ad hoc insert per call site (Coding Standards, "one place for a
 * rule").
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The subset of activity_log actions this milestone (Identity & Access) is
 * responsible for writing. `create`/`update`/`delete`/`publish`/`archive`/
 * `restore`/`permission_change`/`settings_change` belong to later
 * milestones (CMS, Dashboard) — not written from packages/auth.
 */
export type AuthActivityAction = "login" | "logout" | "settings_change";

/**
 * Failed logins and session-expiry are NOT valid `activity_log.action`
 * values per the frozen check constraint (chk_activity_log_action) — only
 * `login`/`logout`/... are. A failed attempt or an expiry is recorded as
 * `metadata` context on a `login`/`logout` row where one can be attributed
 * (see writeAuthFailure below), never as an invented action value that
 * would violate the database constraint.
 */
export interface WriteActivityLogInput {
  actorId: string | null;
  action: AuthActivityAction;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeActivityLog(
  supabase: SupabaseClient,
  input: WriteActivityLogInput,
): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    actor_id: input.actorId,
    action: input.action,
    metadata: input.metadata ?? null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  });

  if (error) {
    // Per Observability principle (Phase 8): logging must never block or
    // alter the outcome of the request it's attached to. Log the failure
    // to the technical log stream (11 - Logging Strategy) and continue.
    // eslint-disable-next-line no-console
    console.error("[activity_log] failed to write entry:", error.message, input);
  }
}

/**
 * Records a failed sign-in attempt. Because chk_activity_log_action does
 * not include a 'failed_login' value, and because the actor is frequently
 * not resolvable at all for a failed attempt (wrong email entirely), this
 * is written as a 'login' row with actorId=null and metadata capturing the
 * failure — matching Packages Specification Package 01 §16's "never reveal
 * whether the email exists" rule (the row itself carries no email either).
 */
export async function writeFailedLoginAttempt(
  supabase: SupabaseClient,
  context: { ipAddress?: string | null; userAgent?: string | null },
): Promise<void> {
  await writeActivityLog(supabase, {
    actorId: null,
    action: "login",
    metadata: { outcome: "failed" },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });
}

/**
 * Records a session that ended because it expired, rather than an explicit
 * sign-out. Written as a 'logout' row with metadata distinguishing the two,
 * again because the check constraint has no separate 'session_expired'
 * value (Database Architecture §2.4) — inventing one would require a schema
 * change, which this milestone is explicitly not allowed to make.
 */
export async function writeSessionExpired(
  supabase: SupabaseClient,
  actorId: string | null,
): Promise<void> {
  await writeActivityLog(supabase, {
    actorId,
    action: "logout",
    metadata: { outcome: "session_expired" },
  });
}

/**
 * Added: Phase 3 CTO Audit (Admin Dashboard Verification) — the read side
 * of activity_log, paired with writeActivityLog above. Dashboard's
 * Activity Log viewer (06-Dashboard.md §4) is documented as "read-only,
 * paginated, filterable by actor/action/date" — this is the query
 * function that page was missing. Read-only: this module still never
 * issues an UPDATE or DELETE against activity_log anywhere (matches
 * 10-Security.md §7 — enforced independently at the RLS layer regardless
 * of this function's own behavior).
 */
export interface ActivityLogRecord {
  id: string;
  actor_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ListActivityLogFilters {
  actorId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListActivityLogResult {
  data: ActivityLogRecord[];
  totalItems: number;
  page: number;
  pageSize: number;
}

export async function listActivityLog(
  supabase: SupabaseClient,
  options: {
    page?: number;
    pageSize?: number;
    filters?: ListActivityLogFilters;
  } = {},
): Promise<ListActivityLogResult> {
  const page = options.page && options.page > 0 ? options.page : 1;
  const pageSize = options.pageSize && options.pageSize > 0 ? Math.min(options.pageSize, 100) : 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("activity_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const filters = options.filters;
  if (filters?.actorId) {
    query = query.eq("actor_id", filters.actorId);
  }
  if (filters?.action) {
    query = query.eq("action", filters.action);
  }
  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to list activity_log: ${error.message}`);
  }

  return {
    data: (data ?? []) as ActivityLogRecord[],
    totalItems: count ?? 0,
    page,
    pageSize,
  };
}
