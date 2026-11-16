/**
 * Implements: API Specification 02 - Authentication API (Login, Logout,
 * Forgot Password, Reset Password, Permissions, Session Management);
 * Packages Specification Package 01.
 *
 * Response shape mirrors 01 - API Standards' envelope ({ data, error, meta })
 * even though these are called as Server Actions rather than Route
 * Handlers, per Backend Development Rules 06: "must produce identical
 * validation/response behavior either way."
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createRequestScopedClient, type CookieAdapter } from "./supabase-client";
import { getSessionForClient } from "./session";
import { writeActivityLog, writeFailedLoginAttempt } from "./activity-log";
import { getCapabilities } from "./roles";

export interface ApiResult<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

function fail<T>(code: string, message: string): ApiResult<T> {
  return { data: null, error: { code, message } };
}

/** Implements: API Specification 02 - Authentication API, "Login." */
export async function signIn(
  cookies: CookieAdapter,
  input: { email: string; password: string },
): Promise<ApiResult<{ sessionEstablished: true }>> {
  const supabase = createRequestScopedClient(cookies);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    // Generic message regardless of cause — never reveal whether the email
    // exists (Packages Specification Package 01 §15/§19).
    await writeFailedLoginAttempt(supabase, {});
    return fail("UNAUTHENTICATED", "Invalid credentials.");
  }

  const session = await getSessionForClient(supabase);
  if (!session.authenticated) {
    // Supabase Auth succeeded but platform_user resolution failed — a
    // provisioning error (Packages Specification Package 01 §18). Sign the
    // Supabase session back out immediately rather than leaving a
    // half-authenticated auth.users session with no platform_user identity.
    await supabase.auth.signOut();
    return fail(
      "UNAUTHENTICATED",
      "Unable to sign in right now. Please contact the platform owner.",
    );
  }

  await writeActivityLog(supabase, {
    actorId: session.platformUserId,
    action: "login",
  });

  return ok({ sessionEstablished: true });
}

/** Implements: API Specification 02 - Authentication API, "Logout." */
export async function signOut(cookies: CookieAdapter): Promise<ApiResult<{ signedOut: true }>> {
  const supabase = createRequestScopedClient(cookies);
  const session = await getSessionForClient(supabase);

  await supabase.auth.signOut();

  if (session.authenticated) {
    await writeActivityLog(supabase, {
      actorId: session.platformUserId,
      action: "logout",
    });
  }

  return ok({ signedOut: true });
}

/** Implements: API Specification 02 - Authentication API, "Forgot Password." */
export async function requestPasswordReset(
  cookies: CookieAdapter,
  input: { email: string },
): Promise<ApiResult<{ requested: true }>> {
  const supabase = createRequestScopedClient(cookies);

  // Result is intentionally ignored beyond logging server-side — the
  // response is always { requested: true }, regardless of whether the
  // email matches an account (Packages Specification Package 01 §15).
  const { error } = await supabase.auth.resetPasswordForEmail(input.email);
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[auth] resetPasswordForEmail error (not surfaced to client):", error.message);
  }

  return ok({ requested: true });
}

/** Implements: API Specification 02 - Authentication API, "Reset Password." */
export async function resetPassword(
  cookies: CookieAdapter,
  input: { newPassword: string },
): Promise<ApiResult<{ passwordUpdated: true }>> {
  const supabase = createRequestScopedClient(cookies);

  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) {
    return fail("VALIDATION_ERROR", "Unable to reset password. The link may have expired.");
  }

  return ok({ passwordUpdated: true });
}

/** Implements: API Specification 02 - Authentication API, "Session Management." */
export async function checkSession(
  cookies: CookieAdapter,
): Promise<ApiResult<{ authenticated: boolean; role?: string }>> {
  const supabase = createRequestScopedClient(cookies);
  const session = await getSessionForClient(supabase);

  if (!session.authenticated) {
    return ok({ authenticated: false });
  }
  return ok({ authenticated: true, role: session.role });
}

/** Implements: API Specification 02 - Authentication API, "Permissions." */
export async function getPermissions(
  cookies: CookieAdapter,
): Promise<ApiResult<{ role: string; capabilities: readonly string[] }>> {
  const supabase = createRequestScopedClient(cookies);
  const session = await getSessionForClient(supabase);

  if (!session.authenticated) {
    return fail("UNAUTHENTICATED", "Not signed in.");
  }

  return ok({ role: session.role, capabilities: getCapabilities(session.role) });
}

/** Implements: API Specification 02 - Authentication API, "Profile" (read-only — flagged gap). */
export async function getProfile(
  cookies: CookieAdapter,
): Promise<ApiResult<{ personId: string; role: string }>> {
  const supabase = createRequestScopedClient(cookies);
  const session = await getSessionForClient(supabase);

  if (!session.authenticated) {
    return fail("UNAUTHENTICATED", "Not signed in.");
  }

  // Deliberately minimal — see API Specification 02 §"Profile": there is no
  // Profile Management screen or editable-profile data model approved for
  // V1 (UI/UX Specification, User Flows 05 §11). name_ar/name_en are read
  // from `person` by the caller (packages/content), not duplicated here —
  // this function returns only what identity resolution itself produces.
  return ok({ personId: session.personId, role: session.role });
}

// Re-exported for callers that already hold a client (e.g. tests, or code
// running after a client was created for another reason in the same request).
export type { SupabaseClient };
