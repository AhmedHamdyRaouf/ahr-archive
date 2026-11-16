import { createServerClient } from "@supabase/ssr";
import { nextCookieAdapter } from "./cookies";

/**
 * Real Supabase server client for Route Handlers — satisfies both
 * `@ahr/cms-core`'s structural `SupabaseLikeClient` and the concrete
 * `@supabase/supabase-js` `SupabaseClient` type `createActivityLogger`
 * needs, since it IS the real client (not a mock). Route Handlers use this
 * one function rather than constructing a client inline (Coding
 * Standards, Backend Development Rules).
 */
export function createRouteHandlerSupabaseClient() {
  const adapter = nextCookieAdapter();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    { cookies: adapter },
  );
}
