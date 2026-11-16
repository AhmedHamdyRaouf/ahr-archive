import { TextField } from "./text-field";
import { AISuggestionPanel } from "@/components/ai/ai-suggestion-panel";

function hasContent(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function readFieldValue(fieldId: string): string {
  const element = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
  return element?.value.trim() ?? "";
}

/**
 * Implements: Milestone 4 — Field Components (Bilingual Text). CMS UI
 * (UI/UX Specification, doc 07 §9): "bilingual field pairs, side by side on
 * Desktop, stacked on Mobile." Renders both `_ar`/`_en` columns TOGETHER,
 * always — Frontend Development Rules: "no component silently drops the
 * untranslated-locale value."
 *
 * Updated 2026-07-22 — optional AI translation suggestion when exactly one
 * locale is filled (Phase 2 AI backlog item 1).
 */
export function BilingualTextField({
  name,
  label,
  defaultValueAr,
  defaultValueEn,
  required,
  errorAr,
  errorEn,
  multiline,
  entityId,
  entityType,
}: {
  name: string;
  label: string;
  defaultValueAr?: string;
  defaultValueEn?: string;
  required?: boolean;
  errorAr?: string;
  errorEn?: string;
  multiline?: boolean;
  /** When set with entityType, shows a translation suggestion for the missing locale. */
  entityId?: string;
  entityType?: string;
}) {
  const savedHasAr = hasContent(defaultValueAr);
  const savedHasEn = hasContent(defaultValueEn);
  const showTranslation =
    Boolean(entityId && entityType) && !(savedHasAr && savedHasEn);

  function resolveTranslationContext() {
    const arValue = readFieldValue(`${name}_ar`);
    const enValue = readFieldValue(`${name}_en`);
    const hasAr = hasContent(arValue);
    const hasEn = hasContent(enValue);

    if (hasAr && !hasEn) {
      return {
        fieldLabel: label,
        sourceLocale: "ar" as const,
        targetLocale: "en" as const,
        sourceText: arValue,
      };
    }
    if (hasEn && !hasAr) {
      return {
        fieldLabel: label,
        sourceLocale: "en" as const,
        targetLocale: "ar" as const,
        sourceText: enValue,
      };
    }
    return null;
  }

  function acceptTranslation(content: { translatedText: string; targetLocale: "ar" | "en" }) {
    const targetId = content.targetLocale === "ar" ? `${name}_ar` : `${name}_en`;
    const target = document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (target) target.value = content.translatedText;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div dir="rtl">
          <TextField
            name={`${name}_ar`}
            label={`${label} (AR)`}
            defaultValue={defaultValueAr}
            required={required}
            error={errorAr}
            multiline={multiline}
          />
        </div>
        <div dir="ltr">
          <TextField
            name={`${name}_en`}
            label={`${label} (EN)`}
            defaultValue={defaultValueEn}
            required={required}
            error={errorEn}
            multiline={multiline}
          />
        </div>
      </div>
      {showTranslation ? (
        <AISuggestionPanel
          kind="translation-suggestion"
          fieldLabel={`${label} translation`}
          entityId={entityId!}
          logEntityType={entityType!}
          resolveContext={resolveTranslationContext}
          onAccept={acceptTranslation}
        />
      ) : null}
    </div>
  );
}
