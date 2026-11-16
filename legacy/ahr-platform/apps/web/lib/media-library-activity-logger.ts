import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaLibraryActivityLogger } from "@ahr/media-library";

/**
 * Implements the `MediaLibraryActivityLogger` interface
 * `@ahr/media-library`'s service layer depends on. A separate file from
 * `lib/media-activity-logger.ts` (media_asset), same reasoning: both write
 * the identical row shape to the same `activity_log` table; only the
 * TypeScript type differs by package.
 */
export function createMediaLibraryActivityLogger(supabase: SupabaseClient): MediaLibraryActivityLogger {
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
