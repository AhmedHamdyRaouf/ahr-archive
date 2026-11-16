import type { SupabaseClient } from "@supabase/supabase-js";
import { writeActivityLog } from "@ahr/auth";

/**
 * Added: Phase 3 CTO Audit (Admin Dashboard Verification). No read/write
 * service existed for the full `platform_settings` table from the
 * Dashboard side — only narrow, public-facing readers existed
 * (@ahr/site's site-settings.ts, this app's public-site-settings.ts,
 * @ahr/notifications' email-config.ts). 06-Dashboard.md §3 documents a
 * full Settings editor as part of the Administrator Dashboard; this is
 * the service function that page was missing.
 *
 * Lives here (apps/web/lib), not inside a shared package: no existing
 * package's declared Milestone scope (03-Backend.md §1) claims ownership
 * of platform_settings admin CRUD, and this function has exactly one
 * consumer (the Dashboard Settings page) — adding it to an existing
 * package would expand that package's scope beyond what its own
 * Milestone description says it does, which 03-Backend.md §2 treats as
 * requiring a real decision, not a routine addition. Matches the existing
 * apps/web/lib/moderation.ts precedent for exactly this kind of
 * single-consumer, app-level helper.
 */

export interface PlatformSettingRow {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export async function listAllSettings(supabase: SupabaseClient): Promise<PlatformSettingRow[]> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    throw new Error(`Failed to list platform_settings: ${error.message}`);
  }

  return (data ?? []) as PlatformSettingRow[];
}

export class InvalidSettingValueError extends Error {
  constructor(key: string, reason: string) {
    super(`Invalid value for setting "${key}": ${reason}`);
    this.name = "InvalidSettingValueError";
  }
}

/**
 * Updates one setting's value. `value` must already be a valid JSON value
 * (parsed by the caller, e.g. from a form's textarea) — this function
 * does not attempt to interpret or repair malformed input, matching
 * 03-Backend.md §5's "validate before it reaches the database" rule.
 * Writes a `settings_change` activity_log row (already a valid
 * chk_activity_log_action value — no schema change needed).
 */
export async function updateSetting(
  supabase: SupabaseClient,
  input: { key: string; value: unknown; actorId: string },
): Promise<PlatformSettingRow> {
  const { data, error } = await supabase
    .from("platform_settings")
    .update({ value: input.value, updated_by: input.actorId })
    .eq("key", input.key)
    .select("*")
    .single();

  if (error || !data) {
    throw new InvalidSettingValueError(input.key, error?.message ?? "update failed");
  }

  await writeActivityLog(supabase, {
    actorId: input.actorId,
    action: "settings_change",
    metadata: { key: input.key },
  });

  return data as PlatformSettingRow;
}
