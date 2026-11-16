/**
 * Implements: Packages Specification Package 01 §11 ("Any request to a
 * route under /dashboard/* without a valid session must redirect to
 * /{locale}/login"); Milestone 3 §4 — "Create centralized authorization
 * middleware. Avoid duplicated permission logic."
 *
 * This is the ONE place route protection is decided for the whole app —
 * individual dashboard pages do not re-check authentication themselves
 * (Development Specification 06 - Backend Development Rules).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

const PROTECTED_PREFIX = "/dashboard";
const LOCALE_PATTERN = /^\/(ar|en)(\/|$)/;

function getLocale(pathname: string): "ar" | "en" {
  const match = pathname.match(LOCALE_PATTERN);
  return (match?.[1] as "ar" | "en") ?? "ar";
}

/**
 * Every protected module named in Milestone 3 §3 (Dashboard, CMS, Archive,
 * AI, Media Library, Contacts & Organizations, Notifications) lives under
 * one route group, /dashboard/*, per Folder Structure (Development
 * Specification 03). Protecting that one prefix protects all seven —
 * this is deliberate: there is one route group to guard, not seven
 * separate checks.
 */
function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(LOCALE_PATTERN, "/");
  return withoutLocale.startsWith(PROTECTED_PREFIX);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    // Public Website (Package 03) remains fully public — no session check
    // performed, no cost paid, for any request outside /dashboard/*.
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const cookieMethods: CookieMethodsServer = {
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    { cookies: cookieMethods },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const locale = getLocale(pathname);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Note: middleware intentionally only checks "is there a valid Supabase
  // session," not the fuller platform_user/role resolution chain (that
  // full chain — including the PlatformUserProvisioningError case — lives
  // in @ahr/auth's session.ts/policy.ts and is checked again, in-process,
  // by each Server Component/Route Handler that actually resolves the
  // session server-side). This is deliberate defense in depth (Security
  // Implementation Rules, Development Specification 14): middleware is a
  // fast, edge-friendly first gate; the authoritative check happens closer
  // to the data.
  return response;
}

export const config = {
  matcher: ["/(ar|en)/dashboard/:path*"],
};
