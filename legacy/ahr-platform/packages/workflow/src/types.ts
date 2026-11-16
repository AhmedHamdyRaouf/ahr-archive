/**
 * Implements: Milestone 10 — Workflow Engine. `moderation_report` shape,
 * exactly as migrated (Milestone 2) — no field invented.
 */

import type { SupabaseLikeClient } from "@ahr/cms-core";
import type { CookieAdapter } from "@ahr/auth";

export const MODERATION_STATUS_VALUES = ["open", "in_review", "escalated", "resolved"] as const;
export type ModerationStatus = (typeof MODERATION_STATUS_VALUES)[number];

export interface ModerationReportRecord {
  id: string;
  entity_table: string;
  entity_id: string;
  reason: string;
  status: ModerationStatus;
  reported_by: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface WorkflowActivityLogger {
  log(input: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}

export interface WorkflowContext {
  cookies: CookieAdapter;
  db: SupabaseLikeClient;
  activityLogger: WorkflowActivityLogger;
}
