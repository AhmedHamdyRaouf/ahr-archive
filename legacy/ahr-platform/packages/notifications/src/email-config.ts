/**
 * Implements: Database Architecture (Frozen v1) §2.3/§8 —
 * `platform_settings.email_configuration` ("Administrator-only: outbound
 * email configuration... never publicly readable"), seeded empty in
 * Milestone 2, never actually used until now.
 *
 * Only NON-secret operational configuration lives in this JSON value
 * (endpoint URL, sender identity, which env var holds the API key) — the
 * API key itself is never stored in `platform_settings` or anywhere in
 * the database. It lives only in server-side environment configuration
 * (Development Specification 14 - Security Implementation Rules:
 * "secrets live only in server-side environment configuration... never
 * logged"). This mirrors exactly how `SUPABASE_SERVICE_ROLE_KEY` is
 * already handled in this project.
 */

export interface EmailConfiguration {
  /** Which HTTP email API this deployment uses — generic enough to cover Resend/SendGrid/Postmark/etc. without hardcoding one vendor. */
  endpoint: string;
  /** The environment variable name holding the API key/bearer token — NOT the key itself. */
  apiKeyEnvVar: string;
  fromAddress: string;
  fromName?: string;
}

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

/**
 * Parses the raw `platform_settings.email_configuration` JSON value.
 * Throws a clear, specific error if required fields are missing —
 * silently sending with a malformed config would be worse than refusing.
 */
export function parseEmailConfiguration(raw: unknown): EmailConfiguration {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new EmailConfigurationError(
      "email_configuration is not set (or is malformed) in platform_settings. " +
        "An Administrator must configure it before email notifications can be sent.",
    );
  }

  const value = raw as Record<string, unknown>;
  const { endpoint, apiKeyEnvVar, fromAddress, fromName } = value;

  if (typeof endpoint !== "string" || endpoint.length === 0) {
    throw new EmailConfigurationError(
      "email_configuration.endpoint is required and must be a non-empty string.",
    );
  }
  if (typeof apiKeyEnvVar !== "string" || apiKeyEnvVar.length === 0) {
    throw new EmailConfigurationError(
      "email_configuration.apiKeyEnvVar is required and must be a non-empty string.",
    );
  }
  if (typeof fromAddress !== "string" || !fromAddress.includes("@")) {
    throw new EmailConfigurationError(
      "email_configuration.fromAddress must be a valid-looking email address.",
    );
  }

  return {
    endpoint,
    apiKeyEnvVar,
    fromAddress,
    fromName: typeof fromName === "string" ? fromName : undefined,
  };
}
