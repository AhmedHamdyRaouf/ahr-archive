import { describe, it, expect } from "vitest";
import { dispatchNotificationEvent, type DispatchContext } from "../src/dispatch-service";
import {
  FixedNotificationPreferenceProvider,
  DEFAULT_NOTIFICATION_POLICY,
} from "../src/preferences";
import type { NotificationEvent } from "../src/types";
import type { NotificationProvider } from "../src/provider";

function createMockProvider(
  channel: "email" | "in_app",
  shouldFail = false,
): NotificationProvider & { calls: unknown[] } {
  const calls: unknown[] = [];
  return {
    channel,
    calls,
    send: async (notification) => {
      calls.push(notification);
      if (shouldFail) throw new Error(`${channel} delivery failed`);
    },
  };
}

const sampleEvent: NotificationEvent = {
  type: "moderation_report_opened",
  recipient: { platformUserId: "admin-1", email: "admin@example.com" },
  data: { entityTable: "work", entityId: "w1", reason: "Copyright concern" },
};

describe("dispatch-service — event-driven notification dispatch (Milestone 11)", () => {
  it("dispatches to every enabled channel with a registered provider", async () => {
    const emailProvider = createMockProvider("email");
    const inAppProvider = createMockProvider("in_app");
    const ctx: DispatchContext = {
      preferenceProvider: new FixedNotificationPreferenceProvider(),
      providers: { email: emailProvider, in_app: inAppProvider },
      locale: "en",
    };

    const results = await dispatchNotificationEvent(ctx, sampleEvent);

    expect(results).toEqual(
      expect.arrayContaining([
        { channel: "email", status: "sent" },
        { channel: "in_app", status: "sent" },
      ]),
    );
    expect(emailProvider.calls).toHaveLength(1);
    expect(inAppProvider.calls).toHaveLength(1);
  });

  it("renders the correct subject/body onto the notification passed to the provider", async () => {
    const emailProvider = createMockProvider("email");
    const ctx: DispatchContext = {
      preferenceProvider: new FixedNotificationPreferenceProvider(),
      providers: { email: emailProvider },
      locale: "en",
    };

    await dispatchNotificationEvent(ctx, sampleEvent);

    expect(emailProvider.calls[0]).toMatchObject({
      subject: "A new moderation report was opened",
      body: "A moderation report was opened on work (w1). Reason: Copyright concern",
    });
  });

  it("skips a channel the preference policy disables, without calling its provider", async () => {
    const emailProvider = createMockProvider("email");
    const ctx: DispatchContext = {
      preferenceProvider: {
        getPreferences: async () => ({
          ...DEFAULT_NOTIFICATION_POLICY,
          moderation_report_opened: { email: false, in_app: true },
        }),
      },
      providers: { email: emailProvider },
      locale: "en",
    };

    const results = await dispatchNotificationEvent(ctx, sampleEvent);

    expect(results).toEqual([{ channel: "email", status: "skipped" }]);
    expect(emailProvider.calls).toHaveLength(0);
  });

  it("records a 'failed' result when a provider throws, without throwing itself", async () => {
    const failingProvider = createMockProvider("email", true);
    const ctx: DispatchContext = {
      preferenceProvider: new FixedNotificationPreferenceProvider(),
      providers: { email: failingProvider },
      locale: "en",
    };

    const results = await dispatchNotificationEvent(ctx, sampleEvent);

    expect(results).toEqual([
      { channel: "email", status: "failed", error: "email delivery failed" },
    ]);
  });

  it("one channel's failure never prevents another channel from being attempted", async () => {
    const failingEmail = createMockProvider("email", true);
    const workingInApp = createMockProvider("in_app", false);
    const ctx: DispatchContext = {
      preferenceProvider: new FixedNotificationPreferenceProvider(),
      providers: { email: failingEmail, in_app: workingInApp },
      locale: "en",
    };

    const results = await dispatchNotificationEvent(ctx, sampleEvent);

    expect(results.find((r) => r.channel === "email")?.status).toBe("failed");
    expect(results.find((r) => r.channel === "in_app")?.status).toBe("sent");
    expect(workingInApp.calls).toHaveLength(1);
  });

  it("only considers channels with a registered provider, even if the policy enables more", async () => {
    const ctx: DispatchContext = {
      preferenceProvider: new FixedNotificationPreferenceProvider(),
      providers: {},
      locale: "en",
    };

    const results = await dispatchNotificationEvent(ctx, sampleEvent);
    expect(results).toEqual([]);
  });
});
