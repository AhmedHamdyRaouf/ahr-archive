/**
 * Implements: Packages Specification Package 01 §11/§16/§18 — User
 * Synchronization. "The Administrator is seeded directly, never
 * self-registered, in V1." A successful Supabase Auth sign-in with no
 * matching platform_user row is a provisioning error, not a case to paper
 * over by creating one on the fly.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export class PlatformUserProvisioningError extends Error {
  constructor(authUserId: string) {
    super(
      `No platform_user row exists for auth.users.id="${authUserId}". ` +
        `Administrators are seeded directly (Packages Specification Package 01 §16), ` +
        `never self-registered — this session must be signed out. ` +
        `(Packages Specification Package 01 §18/§19.)`,
    );
    this.name = "PlatformUserProvisioningError";
  }
}

export interface ResolvedIdentity {
  platformUserId: string;
  personId: string;
  role: string;
}

/**
 * Resolves the Identity Resolution Chain (Authentication Rules, API
 * Specification 13, steps ③–⑤): platform_user, by id = auth.users.id, then
 * its person_id and role.
 *
 * Deliberately does NOT create a platform_user row if one is missing —
 * see PlatformUserProvisioningError above.
 */
export async function resolvePlatformUser(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<ResolvedIdentity> {
  const { data, error } = await supabase
    .from("platform_user")
    .select("id, person_id, role")
    .eq("id", authUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve platform_user: ${error.message}`);
  }

  if (!data) {
    throw new PlatformUserProvisioningError(authUserId);
  }

  return {
    platformUserId: data.id as string,
    personId: data.person_id as string,
    role: data.role as string,
  };
}
