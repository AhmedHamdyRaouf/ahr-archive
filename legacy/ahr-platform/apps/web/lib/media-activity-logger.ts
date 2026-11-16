import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaActivityLogger } from "@ahr/media";

/**
 * Implements the `MediaActivityLogger` interface `@ahr/media`'s service
 * layer depends on. A separate file from Milestone 5's
 * `lib/activity-logger.ts` (rather than widening that one's `entityType`
 * union to include `"media_asset"`) — per this milestone's "do not modify
 * Milestones 1–5 unless fixing a real bug" rule. Both write the identical
 * row shape to the same `activity_log` table; only the TypeScript type
 * differs by package.
 */
export function createMediaActivityLogger(supabase: SupabaseClient): MediaActivityLogger {
  return {
    async log(input) {
      const { error } = await supabase.from("activity_log").insert({
        actor_id: input.actorId,
        action: input.action,
        metadata: { entityType: input.entityType, entityId: input.entityId },
      });
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[activity_log] failed to write entry:", error.message, input);
      }
    },
  };
}
