import { describe, it, expect } from "vitest";
import { parseEmailConfiguration, EmailConfigurationError } from "../src/email-config";

describe("email-config — parsing platform_settings.email_configuration (Milestone 11)", () => {
  it("parses a fully-populated configuration", () => {
    const result = parseEmailConfiguration({
      endpoint: "https://api.resend.com/emails",
      apiKeyEnvVar: "RESEND_API_KEY",
      fromAddress: "noreply@example.com",
      fromName: "AHR Platform",
    });
    expect(result.endpoint).toBe("https://api.resend.com/emails");
    expect(result.fromName).toBe("AHR Platform");
  });

  it("throws when email_configuration is unset (still the empty {} seeded in Milestone 2)", () => {
    expect(() => parseEmailConfiguration({})).toThrow(EmailConfigurationError);
  });

  it("throws when email_configuration is null/not an object", () => {
    expect(() => parseEmailConfiguration(null)).toThrow(EmailConfigurationError);
    expect(() => parseEmailConfiguration("not an object")).toThrow(EmailConfigurationError);
  });

  it("requires a non-empty endpoint", () => {
    expect(() =>
      parseEmailConfiguration({ endpoint: "", apiKeyEnvVar: "X", fromAddress: "a@b.com" }),
    ).toThrow(/endpoint/);
  });

  it("requires apiKeyEnvVar — never the API key itself", () => {
    expect(() =>
      parseEmailConfiguration({ endpoint: "https://x.com", fromAddress: "a@b.com" }),
    ).toThrow(/apiKeyEnvVar/);
  });

  it("validates fromAddress looks like an email address", () => {
    expect(() =>
      parseEmailConfiguration({
        endpoint: "https://x.com",
        apiKeyEnvVar: "X",
        fromAddress: "not-an-email",
      }),
    ).toThrow(/fromAddress/);
  });

  it("fromName is optional", () => {
    const result = parseEmailConfiguration({
      endpoint: "https://x.com",
      apiKeyEnvVar: "X",
      fromAddress: "a@b.com",
    });
    expect(result.fromName).toBeUndefined();
  });
});
