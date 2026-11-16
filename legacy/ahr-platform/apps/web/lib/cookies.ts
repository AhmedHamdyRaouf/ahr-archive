import { cookies } from "next/headers";
import type { CookieAdapter } from "@ahr/auth";

/**
 * The one place Next.js's cookies() is adapted to @ahr/auth's
 * framework-agnostic CookieAdapter interface (packages/auth/src/supabase-client.ts).
 * Every Server Action/Route Handler in this app uses this function rather
 * than constructing the adapter inline.
 */
export function nextCookieAdapter(): CookieAdapter {
  const store = cookies();
  return {
    getAll: () => store.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        try {
          store.set(name, value, options);
        } catch {
          // Setting cookies from a Server Component (as opposed to a
          // Server Action or Route Handler) throws — safe to ignore here,
          // since middleware.ts already refreshes the session cookie for
          // any request that needs it (Next.js's own documented pattern
          // for @supabase/ssr).
        }
      }
    },
  };
}
