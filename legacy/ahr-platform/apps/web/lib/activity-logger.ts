import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityLogger } from "@ahr/content";

/**
 * Implements the `ActivityLogger` interface `@ahr/content`'s service layer
 * depends on (dependency-injected, per that package's own documentation,
 * to avoid a client-type mismatch).
 *
 * This writes directly to `activity_log` rather than calling
 * `@ahr/auth.writeActivityLog` — that Milestone 3 helper's TypeScript type
 * (`AuthActivityAction`) only covers `login`/`logout`/`settings_change`,
 * the three actions Milestone 3 needed. The database's own
 * `chk_activity_log_action` constraint (Database Architecture §2.4) always
 * allowed the fuller set (`create`/`update`/`publish`/`archive`/
 * `restore`/...) — Milestone 5 needs those. Rather than widening Milestone
 * 3's type (out of scope: "DO NOT modify previously approved
 * milestones"), this writes the same row shape directly here, in the
 * milestone that actually needs the wider action set.
 */
export function createActivityLogger(supabase: SupabaseClient): ActivityLogger {
  return {
    async log(input) {
      const { error } = await supabase.from("activity_log").insert({
        actor_id: input.actorId,
        action: input.action,
        metadata: { entityType: input.entityType, entityId: input.entityId },
      });
      if (error) {
        // Observability principle (Phase 8): must never block the request.
        // eslint-disable-next-line no-console
        console.error("[activity_log] failed to write entry:", error.message, input);
      }
    },
  };
}
