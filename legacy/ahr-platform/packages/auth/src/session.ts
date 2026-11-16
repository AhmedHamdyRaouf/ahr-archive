/**
 * Implements: Authentication Rules (API Specification 13) — the full
 * Identity Resolution Chain, steps ①–⑤.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createRequestScopedClient, type CookieAdapter } from "./supabase-client";
import { resolvePlatformUser, PlatformUserProvisioningError } from "./sync";
import type { ActiveRole } from "./roles";
import { isActiveRole } from "./roles";

export interface Session {
  authenticated: true;
  authUserId: string;
  platformUserId: string;
  personId: string;
  role: ActiveRole;
}

export interface NoSession {
  authenticated: false;
}

export type SessionResult = Session | NoSession;

/**
 * Resolves the current request's session, following the full chain:
 * cookie → Supabase Auth → platform_user → role.
 *
 * Returns { authenticated: false } for any failure at any step — per
 * Authentication Rules §"Resolution Chain": "Any failure... results in
 * UNAUTHENTICATED, never a silent fallback to an anonymous/Visitor context
 * for an endpoint that required authentication." Callers that need to
 * distinguish *why* authentication failed (e.g. to log a provisioning
 * error) should catch PlatformUserProvisioningError themselves by calling
 * resolvePlatformUser directly instead of this convenience wrapper.
 */
export async function getSession(cookies: CookieAdapter): Promise<SessionResult> {
  const supabase = createRequestScopedClient(cookies);
  return getSessionForClient(supabase);
}

/** Same as getSession, but for callers that already hold a Supabase client (e.g. tests). */
export async function getSessionForClient(supabase: SupabaseClient): Promise<SessionResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authenticated: false };
  }

  try {
    const identity = await resolvePlatformUser(supabase, user.id);

    if (!isActiveRole(identity.role)) {
      // A role value exists in the row but isn't one Version 1 recognizes as
      // active (roles.ts) — treated as unauthenticated per the "no silent
      // fallback" rule, not granted default/lowest-privilege access.
      return { authenticated: false };
    }

    return {
      authenticated: true,
      authUserId: user.id,
      platformUserId: identity.platformUserId,
      personId: identity.personId,
      role: identity.role,
    };
  } catch (err) {
    if (err instanceof PlatformUserProvisioningError) {
      return { authenticated: false };
    }
    throw err;
  }
}
