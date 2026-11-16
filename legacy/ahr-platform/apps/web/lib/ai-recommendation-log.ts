import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Implements: Database Architecture Review Round item E3, activated
 * 2026-07-21 (docs/Program-Status/Decision-Log.md). Lives here
 * (apps/web/lib), not inside @ahr/ai, for the same reason
 * apps/web/lib/settings-admin.ts does: @ahr/ai deliberately has no
 * database access of its own (packages/ai/src/suggestion-service.ts's own
 * doc comment), and this table has exactly one consumer — the Dashboard's
 * AI Suggestion Panel and its two Route Handlers
 * (app/api/ai/suggest/route.ts, app/api/ai/suggest/[logId]/resolve/route.ts).
 */

export type AiRecommendationOutcome = "pending" | "accepted" | "edited" | "rejected";

export type AiRecommendationKind =
  | "category-tag-suggestion"
  | "summary-suggestion"
  | "translation-suggestion"
  | "article-summary-suggestion"
  | "contribution-role-suggestion";

/** CMS entity type slug (persons, works, …) or legacy work/project for existing rows. */
export type AiRecommendationEntityType =
  | "work"
  | "project"
  | "persons"
  | "organizations"
  | "works"
  | "projects"
  | "events"
  | "awards"
  | "categories"
  | "tags"
  | "press-mentions"
  | "contributions";

export interface AiRecommendationLogRow {
  id: string;
  entity_type: AiRecommendationEntityType;
  entity_id: string;
  kind: AiRecommendationKind;
  suggested_content: unknown;
  rationale: string | null;
  confidence_level: "low" | "medium" | "high";
  provider: string;
  outcome: AiRecommendationOutcome;
  actor_id: string | null;
  created_at: string;
  resolved_at: string | null;
}

/**
 * Records a suggestion the moment it is generated, as `pending`. Never
 * blocks or fails the suggestion response itself if logging fails — an
 * Administrator getting a suggestion is the important path; losing one
 * history row is not worth turning a successful suggestion into an error
 * (same "don't let a secondary write break the primary action" principle
 * already used for writeActivityLog elsewhere in this codebase).
 */
export async function logAiRecommendation(
  supabase: SupabaseClient,
  input: {
    entityType: AiRecommendationEntityType;
    entityId: string;
    kind: AiRecommendationKind;
    suggestedContent: unknown;
    rationale: string;
    confidenceLevel: "low" | "medium" | "high";
    provider: string;
    actorId: string;
  },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("ai_recommendation_log")
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      kind: input.kind,
      suggested_content: input.suggestedContent,
      rationale: input.rationale,
      confidence_level: input.confidenceLevel,
      provider: input.provider,
      actor_id: input.actorId,
    })
    .select("id")
    .single();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error("[ai-recommendation-log] failed to write log row:", error?.message);
    return null;
  }

  return data.id as string;
}

/**
 * Records what the Administrator did with a previously-logged suggestion.
 * Only ever sets `outcome` and `resolved_at` — matches the RLS policy's
 * comment on `ai_recommendation_log_admin_update` (this function is the
 * only code path allowed to reach that policy).
 */
export async function resolveAiRecommendation(
  supabase: SupabaseClient,
  input: { logId: string; outcome: Exclude<AiRecommendationOutcome, "pending"> },
): Promise<void> {
  const { error } = await supabase
    .from("ai_recommendation_log")
    .update({ outcome: input.outcome, resolved_at: new Date().toISOString() })
    .eq("id", input.logId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[ai-recommendation-log] failed to record outcome:", error.message);
  }
}
