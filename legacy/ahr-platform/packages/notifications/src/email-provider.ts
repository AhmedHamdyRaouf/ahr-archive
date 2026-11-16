/**
 * Implements: Milestone 11 §"Email notifications using the existing
 * platform_settings.email_configuration." One real, production-shaped
 * implementation of `NotificationProvider` — calls a configurable HTTP
 * email API (Resend/SendGrid/Postmark-style: POST a JSON body with an
 * Authorization bearer token). This is the "http" transport; a different
 * vendor's exact request/response shape may need a thin adapter later,
 * but the seam (`NotificationProvider`) does not need to change for that.
 *
 * The API key is read from `process.env[config.apiKeyEnvVar]` at send
 * time — never stored, logged, or passed through `platform_settings`
 * (see email-config.ts's own header comment).
 */

import type { NotificationProvider } from "./provider";
import type { RenderedNotification } from "./types";
import type { EmailConfiguration } from "./email-config";

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

type FetchLike = (
  input: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
}>;

export class HttpEmailProvider implements NotificationProvider {
  readonly channel = "email" as const;

  constructor(
    private readonly config: EmailConfiguration,
    private readonly fetchFn: FetchLike = globalThis.fetch as unknown as FetchLike,
  ) {}

  async send(notification: RenderedNotification): Promise<void> {
    if (!notification.recipient.email) {
      throw new EmailDeliveryError(
        `Cannot send an email notification to platformUserId "${notification.recipient.platformUserId}" — no email address was resolved for this recipient.`,
      );
    }

    const apiKey = process.env[this.config.apiKeyEnvVar];
    if (!apiKey) {
      throw new EmailDeliveryError(
        `Environment variable "${this.config.apiKeyEnvVar}" (named by email_configuration.apiKeyEnvVar) is not set.`,
      );
    }

    const response = await this.fetchFn(this.config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: this.config.fromName
          ? `${this.config.fromName} <${this.config.fromAddress}>`
          : this.config.fromAddress,
        to: notification.recipient.email,
        subject: notification.subject,
        html: notification.body,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      throw new EmailDeliveryError(
        `Email API responded with status ${response.status}: ${responseText}`,
      );
    }
  }
}
