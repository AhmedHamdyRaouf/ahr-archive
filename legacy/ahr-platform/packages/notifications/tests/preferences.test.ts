import { describe, it, expect } from "vitest";
import {
  DEFAULT_NOTIFICATION_POLICY,
  assertValidPreferenceSet,
  NotificationPreferenceValidationError,
  FixedNotificationPreferenceProvider,
  isChannelEnabled,
} from "../src/preferences";
import { NOTIFICATION_EVENT_TYPES, NOTIFICATION_CHANNELS } from "../src/types";

describe("preferences — notification preference domain model (Milestone 11)", () => {
  it("DEFAULT_NOTIFICATION_POLICY covers every event type with every channel enabled", () => {
    for (const eventType of NOTIFICATION_EVENT_TYPES) {
      for (const channel of NOTIFICATION_CHANNELS) {
        expect(DEFAULT_NOTIFICATION_POLICY[eventType][channel]).toBe(true);
      }
    }
  });

  it("assertValidPreferenceSet accepts a valid partial set", () => {
    expect(() =>
      assertValidPreferenceSet({ moderation_report_opened: { email: false } }),
    ).not.toThrow();
  });

  it("assertValidPreferenceSet rejects an unknown event type", () => {
    expect(() => assertValidPreferenceSet({ made_up_event: { email: true } })).toThrow(
      NotificationPreferenceValidationError,
    );
  });

  it("assertValidPreferenceSet rejects an unknown channel", () => {
    expect(() => assertValidPreferenceSet({ moderation_report_opened: { sms: true } })).toThrow(
      NotificationPreferenceValidationError,
    );
  });

  it("assertValidPreferenceSet rejects a non-boolean channel value", () => {
    expect(() => assertValidPreferenceSet({ moderation_report_opened: { email: "yes" } })).toThrow(
      NotificationPreferenceValidationError,
    );
  });

  it("FixedNotificationPreferenceProvider returns the same policy for any user (no per-user storage exists)", async () => {
    const provider = new FixedNotificationPreferenceProvider();
    const prefsForUserA = await provider.getPreferences("user-a");
    const prefsForUserB = await provider.getPreferences("user-b");
    expect(prefsForUserA).toEqual(DEFAULT_NOTIFICATION_POLICY);
    expect(prefsForUserB).toEqual(DEFAULT_NOTIFICATION_POLICY);
  });

  it("isChannelEnabled reflects the policy correctly", () => {
    expect(isChannelEnabled(DEFAULT_NOTIFICATION_POLICY, "content_published", "email")).toBe(true);
    expect(
      isChannelEnabled(
        { ...DEFAULT_NOTIFICATION_POLICY, content_published: {} },
        "content_published",
        "email",
      ),
    ).toBe(false);
  });
});
