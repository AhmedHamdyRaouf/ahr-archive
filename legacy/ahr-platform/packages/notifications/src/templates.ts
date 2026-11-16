/**
 * Implements: Milestone 11 §"Notification templates." Bilingual
 * (ar/en) subject+body pairs, matching the platform's bilingual-parity
 * principle (Design Principles §3) even for system-generated messages.
 * Placeholder substitution is a simple `{{key}}` replace — no templating
 * engine dependency, matching this project's "prefer standards over
 * added complexity" posture (Development Specification 15).
 */

import type { NotificationEventType } from "./types";

export interface NotificationTemplate {
  subjectAr: string;
  subjectEn: string;
  bodyAr: string;
  bodyEn: string;
}

/**
 * One template per event type this milestone wires up (types.ts's
 * NOTIFICATION_EVENT_TYPES) — every key in that list has an entry here,
 * checked by `templates.test.ts`.
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationEventType, NotificationTemplate> = {
  moderation_report_opened: {
    subjectAr: "تم فتح بلاغ إشراف جديد",
    subjectEn: "A new moderation report was opened",
    bodyAr: "تم فتح بلاغ إشراف على {{entityTable}} ({{entityId}}). السبب: {{reason}}",
    bodyEn: "A moderation report was opened on {{entityTable}} ({{entityId}}). Reason: {{reason}}",
  },
  moderation_report_escalated: {
    subjectAr: "تم تصعيد بلاغ إشراف",
    subjectEn: "A moderation report was escalated",
    bodyAr: "تم تصعيد البلاغ رقم {{reportId}} ويحتاج إلى مراجعة عاجلة.",
    bodyEn: "Moderation report {{reportId}} was escalated and needs urgent review.",
  },
  moderation_report_resolved: {
    subjectAr: "تم حل بلاغ إشراف",
    subjectEn: "A moderation report was resolved",
    bodyAr: "تم حل البلاغ رقم {{reportId}}. ملاحظات الحل: {{resolutionNotes}}",
    bodyEn: "Moderation report {{reportId}} was resolved. Resolution notes: {{resolutionNotes}}",
  },
  content_published: {
    subjectAr: "تم نشر محتوى جديد",
    subjectEn: "New content was published",
    bodyAr: 'تم نشر {{entityTable}} بعنوان "{{title}}".',
    bodyEn: 'A {{entityTable}} titled "{{title}}" was published.',
  },
};

/**
 * Replaces every `{{key}}` in `template` with `data[key]`, per language.
 * Unmatched placeholders are left as-is rather than silently blanked (a
 * clear sign of a caller bug, not a rendering failure).
 */
export function renderTemplate(
  template: NotificationTemplate,
  locale: "ar" | "en",
  data: Record<string, string>,
): { subject: string; body: string } {
  const subjectTemplate = locale === "ar" ? template.subjectAr : template.subjectEn;
  const bodyTemplate = locale === "ar" ? template.bodyAr : template.bodyEn;

  const substitute = (input: string): string =>
    input.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = data[key];
      return value !== undefined ? value : match;
    });

  return { subject: substitute(subjectTemplate), body: substitute(bodyTemplate) };
}
