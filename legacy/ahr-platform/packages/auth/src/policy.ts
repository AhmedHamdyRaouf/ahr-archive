/**
 * Implements: Identity and Access Architecture (Phase 8) — "a Policy
 * Enforcement Point at the boundary of every service"; Development
 * Specification 06 - Backend Development Rules ("every protected Route
 * Handler/Server Action calls the shared session-resolution helper... never
 * reimplements session checking inline"); Development Specification 14 -
 * Security Implementation Rules ("least privilege").
 *
 * This is the ONE place authorization decisions are made. CMS, Contacts &
 * Organizations, Media Library, Dashboard, AI, and Notifications route
 * handlers all call these functions rather than checking `session.role`
 * themselves — so a future role addition changes capability tables
 * (roles.ts) and this file, not every call site across ten packages.
 */

import type { CookieAdapter } from "./supabase-client";
import { getSession, type Session } from "./session";
import { roleHasCapability, type Capability } from "./roles";

export class UnauthenticatedError extends Error {
  constructor() {
    super("UNAUTHENTICATED — no valid session (API Specification 12 - Error Codes).");
    this.name = "UnauthenticatedError";
  }
}

export class ForbiddenError extends Error {
  constructor(capability: Capability) {
    super(
      `FORBIDDEN — current role lacks capability "${capability}" ` +
        `(API Specification 12 - Error Codes; 14 - Permissions Matrix).`,
    );
    this.name = "ForbiddenError";
  }
}

/**
 * Requires an authenticated session. Throws UnauthenticatedError (→ 401)
 * otherwise. This is the base guard every protected Route Handler/Server
 * Action calls first.
 */
export async function requireSession(cookies: CookieAdapter): Promise<Session> {
  const result = await getSession(cookies);
  if (!result.authenticated) {
    throw new UnauthenticatedError();
  }
  return result;
}

/**
 * Requires an authenticated session that also holds a specific capability.
 * Throws ForbiddenError (→ 403) if the session's role lacks it.
 *
 * This is role-AWARE (looks the capability up per role) without being
 * multi-role-ENABLED (only 'administrator' can ever resolve successfully
 * in V1, since getSession only ever returns that role — see roles.ts and
 * session.ts).
 */
export async function requireCapability(
  cookies: CookieAdapter,
  capability: Capability,
): Promise<Session> {
  const session = await requireSession(cookies);
  if (!roleHasCapability(session.role, capability)) {
    throw new ForbiddenError(capability);
  }
  return session;
}

/**
 * Route-protection check used by middleware (apps/web/middleware.ts) for
 * an entire route group (e.g. everything under /dashboard), rather than a
 * single capability. Returns a boolean instead of throwing, since
 * middleware needs to redirect, not produce an API error response.
 */
export async function isAuthenticatedForRouteProtection(cookies: CookieAdapter): Promise<boolean> {
  const result = await getSession(cookies);
  return result.authenticated;
}
