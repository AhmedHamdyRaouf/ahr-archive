import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpEmailProvider, EmailDeliveryError } from "../src/email-provider";
import type { EmailConfiguration } from "../src/email-config";
import type { RenderedNotification } from "../src/types";

const config: EmailConfiguration = {
  endpoint: "https://api.resend.com/emails",
  apiKeyEnvVar: "TEST_EMAIL_API_KEY",
  fromAddress: "noreply@example.com",
  fromName: "AHR Platform",
};

const notification: RenderedNotification = {
  channel: "email",
  recipient: { platformUserId: "admin-1", email: "admin@example.com" },
  subject: "Test Subject",
  body: "Test Body",
};

describe("HttpEmailProvider — real email delivery via a configurable HTTP API (Milestone 11)", () => {
  beforeEach(() => {
    process.env.TEST_EMAIL_API_KEY = "test-api-key-123";
  });

  afterEach(() => {
    delete process.env.TEST_EMAIL_API_KEY;
  });

  it("sends a POST request with the correct auth header and body", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "" });
    const provider = new HttpEmailProvider(config, fetchFn);

    await provider.send(notification);

    expect(fetchFn).toHaveBeenCalledWith(
      config.endpoint,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-api-key-123" }),
      }),
    );
    const body = JSON.parse(fetchFn.mock.calls[0]?.[1]?.body);
    expect(body.to).toBe("admin@example.com");
    expect(body.subject).toBe("Test Subject");
    expect(body.from).toBe("AHR Platform <noreply@example.com>");
  });

  it("throws EmailDeliveryError if the recipient has no resolved email address", async () => {
    const fetchFn = vi.fn();
    const provider = new HttpEmailProvider(config, fetchFn);

    await expect(
      provider.send({ ...notification, recipient: { platformUserId: "admin-1" } }),
    ).rejects.toThrow(EmailDeliveryError);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("throws EmailDeliveryError if the API key env var is not set", async () => {
    delete process.env.TEST_EMAIL_API_KEY;
    const fetchFn = vi.fn();
    const provider = new HttpEmailProvider(config, fetchFn);

    await expect(provider.send(notification)).rejects.toThrow(/TEST_EMAIL_API_KEY/);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("throws EmailDeliveryError when the API responds with a non-ok status", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 401, text: async () => "Unauthorized" });
    const provider = new HttpEmailProvider(config, fetchFn);

    await expect(provider.send(notification)).rejects.toThrow(/401/);
  });

  it("has channel = 'email'", () => {
    const provider = new HttpEmailProvider(config, vi.fn());
    expect(provider.channel).toBe("email");
  });
});
