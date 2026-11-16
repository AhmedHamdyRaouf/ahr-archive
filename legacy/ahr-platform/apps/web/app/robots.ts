import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Implements: Milestone 8 §"SEO foundation" — robots.txt. Disallows
 * `/dashboard` and `/api` (never meant to be indexed — those are the
 * Administrator-only and machine-to-machine surfaces respectively).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/*/dashboard", "/api"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
