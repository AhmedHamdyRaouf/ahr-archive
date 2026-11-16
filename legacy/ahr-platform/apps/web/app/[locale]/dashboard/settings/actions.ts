"use server";

import { revalidatePath } from "next/cache";
import { requireCapability } from "@ahr/auth";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { nextCookieAdapter } from "@/lib/cookies";
import { updateSetting, InvalidSettingValueError } from "@/lib/settings-admin";

/**
 * Implements: 06-Dashboard.md §3 — Settings Editor ("Write access to
 * every key is Administrator-only"). Added: Phase 3 CTO Audit.
 * A Server Action, not a new Route Handler: this is a Dashboard-internal
 * form submission, not an external API contract 07-API.md needs to
 * document (that document's endpoint-family table lists Auth, CMS,
 * Website, Media, Search, Moderation, AI — Settings admin CRUD was never
 * one of them, and this keeps it that way rather than inventing an
 * undocumented endpoint family).
 */
export async function updateSettingAction(
  locale: string,
  key: string,
  rawValue: string,
): Promise<{ error: string | null }> {
  const session = await requireCapability(nextCookieAdapter(), "settings:manage");

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    return { error: 'Value must be valid JSON (e.g. "text", 123, true, {}, []).' };
  }

  const supabase = createRouteHandlerSupabaseClient();

  try {
    await updateSetting(supabase, { key, value: parsedValue, actorId: session.platformUserId });
  } catch (error) {
    if (error instanceof InvalidSettingValueError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/${locale}/dashboard/settings`);
  return { error: null };
}
