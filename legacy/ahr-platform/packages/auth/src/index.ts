/**
 * @ahr/auth — public exports only (Coding Standards: "no deep imports from
 * outside a package's public exports").
 */

export { createRequestScopedClient, createServiceRoleClient } from "./supabase-client";
export type { CookieAdapter } from "./supabase-client";

export { getSession, getSessionForClient } from "./session";
export type { Session, NoSession, SessionResult } from "./session";

export { resolvePlatformUser, PlatformUserProvisioningError } from "./sync";
export type { ResolvedIdentity } from "./sync";

export {
  ACTIVE_ROLES,
  RESERVED_FUTURE_ROLES,
  isActiveRole,
  getCapabilities,
  roleHasCapability,
} from "./roles";
export type { ActiveRole, Capability } from "./roles";

export {
  requireSession,
  requireCapability,
  isAuthenticatedForRouteProtection,
  UnauthenticatedError,
  ForbiddenError,
} from "./policy";

export { writeActivityLog, writeFailedLoginAttempt, writeSessionExpired } from "./activity-log";
export type { AuthActivityAction, WriteActivityLogInput } from "./activity-log";
export { listActivityLog } from "./activity-log";
export type {
  ActivityLogRecord,
  ListActivityLogFilters,
  ListActivityLogResult,
} from "./activity-log";

export {
  signIn,
  signOut,
  requestPasswordReset,
  resetPassword,
  checkSession,
  getPermissions,
  getProfile,
} from "./actions";
export type { ApiResult } from "./actions";
