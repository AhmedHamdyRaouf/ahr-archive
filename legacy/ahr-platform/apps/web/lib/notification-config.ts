import { parseEmailConfiguration, type EmailConfiguration } from "@ahr/notifications";
import { createRouteHandlerSupabaseClient } from "./supabase-server";

/**
 * Implements: Milestone 11 — reads `platform_settings.email_configuration`
 * (Database Architecture §2.3/§8, seeded empty in Milestone 2). Returns
 * `null` rather than throwing when unconfigured — an Administrator simply
 * hasn't set it up yet, which must degrade gracefully (no email sending
 * available), not 500 the whole request (same posture as Milestone 8's
 * `getPublicSiteSettings`).
 */
export async function readEmailConfiguration(): Promise<EmailConfiguration | null> {
  const supabase = createRouteHandlerSupabaseClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "email_configuration")
    .maybeSingle();

  if (error || !data) return null;

  try {
    return parseEmailConfiguration(data.value);
  } catch {
    // Malformed/unset configuration — same graceful-degradation posture.
    return null;
  }
}
