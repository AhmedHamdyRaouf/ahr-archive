/**
 * Implements: Authentication Rules (API Specification 13) — "Every
 * authenticated request carries a Supabase Auth session cookie... read
 * server-side via the Supabase server client."
 *
 * This module does not depend on `next/headers` directly, so it stays
 * testable without a Next.js request context. Callers (apps/web) supply a
 * small cookie adapter; in production that adapter wraps Next.js's cookies().
 */

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// A type alias, not an empty `interface extends`, so it carries no members
// of its own beyond CookieMethodsServer (lint-clean; identical usage at
// every call site — TypeScript type aliases and single-member-less
// interfaces are structurally interchangeable here).
export type CookieAdapter = CookieMethodsServer;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". See .env.example. ` +
        `(Database Architecture / Build Manifest item B4 — Supabase project must be provisioned.)`,
    );
  }
  return value;
}

/**
 * Server client scoped to the current request's session — respects Row
 * Level Security as that session (Database Architecture §8). This is what
 * every normal Route Handler/Server Action should use.
 */
export function createRequestScopedClient(cookies: CookieAdapter): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createServerClient(url, anonKey, { cookies });
}

/**
 * Service-role client — bypasses Row Level Security entirely.
 *
 * Security Implementation Rules (Development Specification 14): "the
 * Supabase service role... is never used in normal request-handling code
 * paths." This client exists ONLY for the sanctioned migration-script
 * exception (Database Architecture §8) and for the one narrow case in this
 * milestone where it is unavoidable: creating the platform_user row the
 * very first time a person signs in, before any session-scoped policy could
 * apply to a row that doesn't exist yet (sync.ts). Do not import this
 * function from any Route Handler or Server Action that handles ordinary
 * user requests.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
