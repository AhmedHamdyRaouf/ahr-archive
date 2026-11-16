import { parsePublicSiteSettings, PUBLIC_SETTINGS_KEYS, type PublicSiteSettings } from "@ahr/site";
import { createRouteHandlerSupabaseClient } from "./supabase-server";

/**
 * Implements: Database Architecture (Frozen v1) §8 — reads ONLY the
 * public-readable `platform_settings` keys (`@ahr/site`'s explicit
 * allowlist). Uses the request-scoped (RLS-respecting) Supabase client,
 * same as every other public read in this app — never the service-role
 * client (Security Implementation Rules, Development Specification 14).
 */
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const supabase = createRouteHandlerSupabaseClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", PUBLIC_SETTINGS_KEYS as unknown as string[]);

  if (error) {
    // Public pages must never break because of a settings read failure
    // (site-settings.ts's own "degrade gracefully" design) — log and fall
    // back to empty defaults.
    // eslint-disable-next-line no-console
    console.error("[site-settings] failed to read platform_settings:", error.message);
    return parsePublicSiteSettings([]);
  }

  return parsePublicSiteSettings((data ?? []) as Array<{ key: string; value: unknown }>);
}
