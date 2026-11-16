import { describe, it, expect } from "vitest";
import { NOTIFICATION_TEMPLATES, renderTemplate } from "../src/templates";
import { NOTIFICATION_EVENT_TYPES } from "../src/types";

describe("templates — bilingual notification templates (Milestone 11)", () => {
  it("has exactly one template per notification event type — no gaps", () => {
    expect(Object.keys(NOTIFICATION_TEMPLATES).sort()).toEqual(
      [...NOTIFICATION_EVENT_TYPES].sort(),
    );
  });

  it("every template has all four bilingual fields non-empty", () => {
    for (const template of Object.values(NOTIFICATION_TEMPLATES)) {
      expect(template.subjectAr.length).toBeGreaterThan(0);
      expect(template.subjectEn.length).toBeGreaterThan(0);
      expect(template.bodyAr.length).toBeGreaterThan(0);
      expect(template.bodyEn.length).toBeGreaterThan(0);
    }
  });

  it("renders the English variant with placeholders substituted", () => {
    const { subject, body } = renderTemplate(
      NOTIFICATION_TEMPLATES.moderation_report_opened,
      "en",
      {
        entityTable: "work",
        entityId: "w1",
        reason: "Copyright concern",
      },
    );
    expect(subject).toBe("A new moderation report was opened");
    expect(body).toBe("A moderation report was opened on work (w1). Reason: Copyright concern");
  });

  it("renders the Arabic variant with placeholders substituted", () => {
    const { body } = renderTemplate(NOTIFICATION_TEMPLATES.moderation_report_opened, "ar", {
      entityTable: "work",
      entityId: "w1",
      reason: "مشكلة حقوق نشر",
    });
    expect(body).toContain("مشكلة حقوق نشر");
  });

  it("leaves an unmatched placeholder as-is rather than blanking it", () => {
    const { body } = renderTemplate(NOTIFICATION_TEMPLATES.content_published, "en", {
      entityTable: "work",
    });
    expect(body).toContain("{{title}}"); // title was never provided
  });
});
