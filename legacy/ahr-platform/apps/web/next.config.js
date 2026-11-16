/** @type {import('next').NextConfig} */

// Fixed per Phase 3 CTO Audit (Security & Performance Final Review): no
// security response headers were previously configured anywhere in the
// project (no next.config.js headers(), no vercel.json). These are
// standard, additive HTTP response headers -- they change no route, no
// data shape, and no architecture decision; they only instruct the
// browser to behave more defensively. Values follow OWASP Secure Headers
// Project baseline recommendations for a server-rendered Next.js app.
const securityHeaders = [
  // Prevents the browser from MIME-sniffing a response away from its
  // declared Content-Type -- blocks a class of content-sniffing attacks.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // The platform has no legitimate reason to be framed by another site;
  // DENY blocks all framing, mitigating clickjacking.
  { key: "X-Frame-Options", value: "DENY" },
  // Only send the origin (not the full URL, which could carry a public_id
  // or other path detail) to a different origin on outbound navigation/
  // resource requests.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No browser feature this app doesn't use should be grantable to it
  // (or to anything it might embed, though embedding is already blocked
  // above) via Permissions Policy.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Forces HTTPS on every subsequent request for a year, including
  // subdomains -- safe because the platform is served exclusively over
  // HTTPS in every environment (Vercel), never plain HTTP.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Fixed per Phase 3 CTO Audit: don't advertise the framework in every
  // response header -- no functional effect, minor information-disclosure
  // hardening only.
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Every route, including API routes -- these headers are
        // response-shape hardening, not per-route business logic, so one
        // rule applying everywhere is correct (matches the "one place for
        // a rule" convention already used throughout the backend).
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Fixed per Phase 3 CTO Audit (Core Web Vitals): allows next/image to
  // optimize images served from the project's own Supabase Storage public
  // bucket (Database Architecture Frozen v1 §11's storage path convention)
  // instead of the raw <img> tag previously used on the public Media page.
  // Falls back to a syntactically valid placeholder hostname when the env
  // var isn't set (e.g. a CI build with no Supabase project configured
  // yet) so this never breaks a build that doesn't need image loading.
  //
  // Updated 2026-07-21: broadened the pathname from
  // "/storage/v1/object/public/**" to "/storage/v1/object/**" — Dashboard
  // screens (e.g. "My Account") legitimately preview not-yet-published
  // media too, which `getMediaAccessUrl` correctly serves as a *signed*
  // URL (`/storage/v1/object/sign/...`), not a public one. The narrower
  // pattern only ever matched the public-bucket case, so any restricted/
  // draft image crashed `next/image` with "Invalid src prop... hostname
  // not configured" the moment a Dashboard screen tried to show one.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: (() => {
          try {
            return new URL(
              process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
            ).hostname;
          } catch {
            return "placeholder.supabase.co";
          }
        })(),
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

module.exports = nextConfig;
