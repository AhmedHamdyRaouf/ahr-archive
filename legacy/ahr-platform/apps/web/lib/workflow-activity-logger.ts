import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowActivityLogger } from "@ahr/workflow";

/**
 * Implements the `WorkflowActivityLogger` interface `@ahr/workflow`'s
 * moderation service depends on. A separate file from the content/media
 * activity loggers (same rationale as Milestone 6's `media-activity-
 * logger.ts`) — per "do not modify Milestones 1–9 unless fixing a real
 * bug."
 */
export function createWorkflowActivityLogger(supabase: SupabaseClient): WorkflowActivityLogger {
  return {
    async log(input) {
      const { error } = await supabase.from("activity_log").insert({
        actor_id: input.actorId,
        action: input.action,
        metadata: { entityType: input.entityType, entityId: input.entityId, ...input.metadata },
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[activity_log] failed to write entry:", error.message, input);
      }
    },
  };
}
