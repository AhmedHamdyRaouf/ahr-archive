/**
 * Implements: Database Architecture (Frozen v1) §7 — Roles & Permissions;
 * API Specification 14 - Permissions Matrix.
 *
 * IMPORTANT — read before touching this file:
 * Database Architecture §7 constrains `platform_user.role` to exactly one
 * value in Version 1: 'administrator'. This is a real, tested database
 * `check` constraint (chk_platform_user_role), not a placeholder.
 *
 * This module is written to be *role-aware* (capability lookups are keyed by
 * role, not hardcoded to a single branch everywhere) so that adding a role
 * later is a matter of extending the two lists below plus one database
 * constraint update — never a rewrite of the callers. It is NOT
 * multi-role-enabled: `ACTIVE_ROLES` below contains only what the frozen
 * schema actually allows today. Do not add 'editor', 'moderator',
 * 'contributor', 'viewer', or any other role here without an official
 * Architecture Revision that also updates the database constraint and the
 * frozen specifications first.
 */

/** Every role value the database will currently accept (Database Architecture §7). */
export const ACTIVE_ROLES = ["administrator"] as const;

/**
 * Roles reserved for a future release (Database Architecture §7, §15).
 * Listed here only so future work has one place to extend from — none of
 * these are valid today, and none of them appear in ACTIVE_ROLES.
 */
export const RESERVED_FUTURE_ROLES = ["trainer", "student", "creative_member"] as const;

export type ActiveRole = (typeof ACTIVE_ROLES)[number];

/**
 * Capability keys, matching the capability list shape returned by
 * GET /api/auth/permissions (API Specification, Authentication API).
 */
export type Capability =
  | "content:read"
  | "content:write"
  | "content:publish"
  | "moderation:manage"
  | "settings:manage"
  | "settings:manage:public-subset"
  | "media:manage"
  | "organizations:manage"
  | "activity-log:read"
  // Added: Development Audit (Development track) — matches the Permissions
  // Matrix row already frozen in 08-Authentication-and-Authorization.md §5
  // ("AI | ... | Administrator (suggestion requests only)") — the AI
  // package itself was simply never built yet, so no capability value for
  // it existed until now.
  | "ai:suggest"
  // Added 2026-07-24: @ahr/media-library (Asset Library) is a new package,
  // same situation as "ai:suggest" above — no capability value existed
  // for it until the package did. Kept distinct from "media:manage"
  // (media_asset) since the two are separate, independently-governed
  // resources (see packages/media-library/README.md).
  | "media-library:manage"
  // Added 2026-07-25: data owner decision — a genuine, irreversible
  // "Delete Permanently" action (@ahr/cms-core's genericForceDelete),
  // available on every table. Deliberately a SEPARATE, narrower
  // capability from "content:write"/"media:manage"/"media-library:manage"
  // — every ordinary CRUD action only ever needs those; this one alone
  // gates the action that breaks the platform's own "No Hard Delete"
  // principle, so a future role split can grant ordinary content editing
  // without also granting this.
  | "database:force-delete";

/**
 * Capability table, keyed by role. In V1 there is exactly one row, but the
 * lookup itself is role-driven — adding a role later means adding a row
 * here, not introducing a new code path at every call site.
 */
const ROLE_CAPABILITIES: Record<ActiveRole, readonly Capability[]> = {
  administrator: [
    "content:read",
    "content:write",
    "content:publish",
    "moderation:manage",
    "settings:manage",
    "settings:manage:public-subset",
    "media:manage",
    "organizations:manage",
    "activity-log:read",
    "ai:suggest",
    "media-library:manage",
    "database:force-delete",
  ],
};

/** Type guard: is this string one of the roles the database currently accepts? */
export function isActiveRole(value: string): value is ActiveRole {
  return (ACTIVE_ROLES as readonly string[]).includes(value);
}

/**
 * Returns the capability list for a role. Throws for any role outside
 * ACTIVE_ROLES — this is deliberate: a caller asking about a role the
 * database itself would reject is a bug, not a case to handle gracefully.
 */
export function getCapabilities(role: string): readonly Capability[] {
  if (!isActiveRole(role)) {
    throw new Error(
      `getCapabilities called with a role ("${role}") that is not active in Version 1. ` +
        `See Database Architecture §7 and packages/auth/src/roles.ts.`,
    );
  }
  return ROLE_CAPABILITIES[role];
}

/** Convenience check used by guards/policies (policy.ts) and UI permission hooks. */
export function roleHasCapability(role: string, capability: Capability): boolean {
  if (!isActiveRole(role)) return false;
  return ROLE_CAPABILITIES[role].includes(capability);
}
