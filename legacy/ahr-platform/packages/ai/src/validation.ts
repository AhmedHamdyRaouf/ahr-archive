/**
 * Implements: 14-AI-Integration.md §10 ("Malformed AI response... Discarded
 * entirely, treated as a failure — never partially applied"). Every field
 * is checked; a response missing or misshaping any required field is
 * rejected as a whole, never partially accepted.
 */

import {
  MalformedAiResponseError,
  type CategoryTagSuggestion,
  type ConfidenceLevel,
  type ContributionRoleSuggestion,
  type SummarySuggestion,
  type TranslationSuggestion,
} from "./types";

function parseJsonObject(raw: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new MalformedAiResponseError("response was not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new MalformedAiResponseError("response was not a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function assertConfidenceLevel(value: unknown): ConfidenceLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  throw new MalformedAiResponseError(
    `"confidence" must be "low", "medium", or "high" (got ${JSON.stringify(value)})`,
  );
}

function assertRationale(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new MalformedAiResponseError('"rationale" must be a non-empty string');
  }
  return value;
}

function assertStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new MalformedAiResponseError(`"${field}" must be an array of strings`);
  }
  return value;
}

export function parseCategoryTagResponse(
  raw: string,
  availableCategories: string[],
): { suggestedContent: CategoryTagSuggestion; rationale: string; confidence: ConfidenceLevel } {
  const obj = parseJsonObject(raw);
  const categories = assertStringArray(obj.categories, "categories");
  const tags = assertStringArray(obj.tags, "tags");

  // A model suggesting a category outside the given available list is a
  // malformed response for our purposes, exactly as much as bad JSON shape
  // would be -- matching TAXONOMY_DOMAIN_MISMATCH's own database-level
  // enforcement (05-CMS.md §4), not a rule this package invents on its own.
  const invalidCategories = categories.filter((c) => !availableCategories.includes(c));
  if (invalidCategories.length > 0) {
    throw new MalformedAiResponseError(
      `response suggested categories outside the available list: ${invalidCategories.join(", ")}`,
    );
  }

  return {
    suggestedContent: { categories, tags },
    rationale: assertRationale(obj.rationale),
    confidence: assertConfidenceLevel(obj.confidence),
  };
}

export function parseSummaryResponse(raw: string): {
  suggestedContent: SummarySuggestion;
  rationale: string;
  confidence: ConfidenceLevel;
} {
  const obj = parseJsonObject(raw);
  const summaryAr = obj.summaryAr;
  const summaryEn = obj.summaryEn;

  if (typeof summaryAr !== "string" || summaryAr.trim().length === 0) {
    throw new MalformedAiResponseError('"summaryAr" must be a non-empty string');
  }
  if (typeof summaryEn !== "string" || summaryEn.trim().length === 0) {
    throw new MalformedAiResponseError('"summaryEn" must be a non-empty string');
  }

  return {
    suggestedContent: { summaryAr, summaryEn },
    rationale: assertRationale(obj.rationale),
    confidence: assertConfidenceLevel(obj.confidence),
  };
}

export function parseTranslationResponse(
  raw: string,
  expectedTargetLocale: "ar" | "en",
): {
  suggestedContent: TranslationSuggestion;
  rationale: string;
  confidence: ConfidenceLevel;
} {
  const obj = parseJsonObject(raw);
  const translatedText = obj.translatedText;
  const targetLocale = obj.targetLocale;

  if (typeof translatedText !== "string" || translatedText.trim().length === 0) {
    throw new MalformedAiResponseError('"translatedText" must be a non-empty string');
  }
  if (targetLocale !== "ar" && targetLocale !== "en") {
    throw new MalformedAiResponseError('"targetLocale" must be "ar" or "en"');
  }
  if (targetLocale !== expectedTargetLocale) {
    throw new MalformedAiResponseError(
      `"targetLocale" must be "${expectedTargetLocale}" (got ${JSON.stringify(targetLocale)})`,
    );
  }

  return {
    suggestedContent: { translatedText, targetLocale },
    rationale: assertRationale(obj.rationale),
    confidence: assertConfidenceLevel(obj.confidence),
  };
}

/**
 * Article summaries share the exact same response shape as
 * parseSummaryResponse (summaryAr/summaryEn/rationale/confidence) — same
 * validation, delegated rather than duplicated (one place for the rule).
 */
export function parseArticleSummaryResponse(raw: string): {
  suggestedContent: SummarySuggestion;
  rationale: string;
  confidence: ConfidenceLevel;
} {
  return parseSummaryResponse(raw);
}

export function parseContributionRoleResponse(
  raw: string,
  availableRoles: string[],
): {
  suggestedContent: ContributionRoleSuggestion;
  rationale: string;
  confidence: ConfidenceLevel;
} {
  const obj = parseJsonObject(raw);
  const role = obj.role;

  // Same "outside the given list is malformed" rule as
  // parseCategoryTagResponse — matches chk_contribution_role's own
  // database-level enforcement, not a rule this package invents.
  if (typeof role !== "string" || !availableRoles.includes(role)) {
    throw new MalformedAiResponseError(
      `"role" must be one of the available roles (got ${JSON.stringify(role)})`,
    );
  }

  return {
    suggestedContent: { role },
    rationale: assertRationale(obj.rationale),
    confidence: assertConfidenceLevel(obj.confidence),
  };
}
