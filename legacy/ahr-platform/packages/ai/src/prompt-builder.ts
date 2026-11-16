/**
 * Implements: 14-AI-Integration.md §2 item 3 (bounded data access — only
 * the given entity's own fields go into the prompt, nothing else is ever
 * concatenated in) and §1 (the two in-scope suggestion kinds).
 *
 * Every prompt explicitly instructs the model to respond with JSON only,
 * matching a documented shape — this is what makes validation.ts's strict
 * parsing possible, and what makes a malformed response detectable rather
 * than silently mis-parsed.
 */

import type {
  ArticleSummaryContext,
  ContributionRoleContext,
  EntityContext,
  TranslationContext,
} from "./types";

function describeEntity(context: EntityContext): string {
  const lines = [
    `Entity type: ${context.entityType}`,
    `Title (Arabic): ${context.titleAr}`,
    `Title (English): ${context.titleEn}`,
  ];
  if (context.descriptionAr) lines.push(`Description (Arabic): ${context.descriptionAr}`);
  if (context.descriptionEn) lines.push(`Description (English): ${context.descriptionEn}`);
  if (context.existingCategories?.length) {
    lines.push(`Already-assigned categories: ${context.existingCategories.join(", ")}`);
  }
  if (context.existingTags?.length) {
    lines.push(`Already-assigned tags: ${context.existingTags.join(", ")}`);
  }
  return lines.join("\n");
}

export function buildCategoryTagPrompt(context: EntityContext): string {
  return [
    "You are assisting an Administrator of a cultural archive platform by suggesting",
    "categories and tags for one content entity. You are proposing a suggestion for a",
    "human to review — you are not making the final decision.",
    "",
    describeEntity(context),
    "",
    `Choose only from this exact list of available categories (do not invent new ones): ${context.availableCategories.join(", ")}`,
    "",
    "Respond with a single JSON object only, no other text, matching exactly this shape:",
    '{ "categories": string[], "tags": string[], "rationale": string, "confidence": "low" | "medium" | "high" }',
    "",
    '"categories" must only contain values from the available list above.',
    '"tags" may contain new, free-text descriptive labels (tags are not hierarchical or scoped, unlike categories).',
    '"rationale" must briefly explain your reasoning in one or two sentences.',
    '"confidence" must reflect how certain you are, given how much descriptive text was available.',
  ].join("\n");
}

export function buildSummaryPrompt(context: EntityContext): string {
  return [
    "You are assisting an Administrator of a cultural archive platform by drafting a short,",
    "bilingual (Arabic and English) summary/description for one content entity, based only",
    "on the information given below. You are proposing a draft for a human to review, edit,",
    "or reject — you are not publishing anything yourself.",
    "",
    describeEntity(context),
    "",
    "Respond with a single JSON object only, no other text, matching exactly this shape:",
    '{ "summaryAr": string, "summaryEn": string, "rationale": string, "confidence": "low" | "medium" | "high" }',
    "",
    "Keep each summary to 2-3 sentences. Do not invent facts not implied by the given title/description.",
    '"rationale" must briefly explain your reasoning in one or two sentences.',
    '"confidence" must reflect how certain you are, given how much source text was available to draft from.',
  ].join("\n");
}

const LOCALE_LABELS = { ar: "Arabic", en: "English" } as const;

export function buildTranslationPrompt(context: TranslationContext): string {
  const sourceLabel = LOCALE_LABELS[context.sourceLocale];
  const targetLabel = LOCALE_LABELS[context.targetLocale];

  return [
    "You are assisting an Administrator of a cultural archive platform by drafting a",
    `${targetLabel} translation for one bilingual field ("${context.fieldLabel}"). You are`,
    "proposing a draft for a human to review, edit, or reject — you are not publishing",
    "anything yourself.",
    "",
    `Source text (${sourceLabel}):`,
    context.sourceText,
    "",
    "Respond with a single JSON object only, no other text, matching exactly this shape:",
    '{ "translatedText": string, "targetLocale": "ar" | "en", "rationale": string, "confidence": "low" | "medium" | "high" }',
    "",
    `"translatedText" must be a faithful ${targetLabel} translation of the source — never summarize,`,
    "embellish, or omit. Preserve names, dates, and factual claims exactly.",
    `"targetLocale" must be "${context.targetLocale}".`,
    '"rationale" must briefly explain your reasoning in one or two sentences.',
    '"confidence" must reflect how certain you are given the source text length and clarity.',
  ].join("\n");
}

export function buildArticleSummaryPrompt(context: ArticleSummaryContext): string {
  return [
    "You are assisting an Administrator of a cultural archive platform by drafting a short,",
    "bilingual (Arabic and English) summary of a journalism article pasted in below. You are",
    "proposing a draft for a human to review, edit, or reject — you are not publishing",
    "anything yourself.",
    "",
    "Article text:",
    context.articleText,
    "",
    "Respond with a single JSON object only, no other text, matching exactly this shape:",
    '{ "summaryAr": string, "summaryEn": string, "rationale": string, "confidence": "low" | "medium" | "high" }',
    "",
    "Keep each summary to 2-3 sentences. Do not invent facts not present in the article text.",
    '"rationale" must briefly explain your reasoning in one or two sentences.',
    '"confidence" must reflect how certain you are given the article text length and clarity.',
  ].join("\n");
}

const SUBJECT_TYPE_LABELS = { work: "Work", project: "Project", event: "Event" } as const;

export function buildContributionRolePrompt(context: ContributionRoleContext): string {
  const lines = [
    "You are assisting an Administrator of a cultural archive platform by suggesting the",
    "role a person played in a specific credit (a \"Contribution\" record linking a person",
    "to a work, project, or event). You are proposing a suggestion for a human to review —",
    "you are not making the final decision.",
    "",
    `Person: ${context.personName}`,
    `${SUBJECT_TYPE_LABELS[context.subjectType]}: ${context.subjectLabel}`,
  ];
  if (context.roleDetail) {
    lines.push(`Role detail already noted by the Administrator: ${context.roleDetail}`);
  }
  lines.push(
    "",
    `Choose exactly one role from this exact list (do not invent new ones): ${context.availableRoles.join(", ")}`,
    "",
    "Respond with a single JSON object only, no other text, matching exactly this shape:",
    '{ "role": string, "rationale": string, "confidence": "low" | "medium" | "high" }',
    "",
    '"role" must be exactly one value from the list above.',
    '"rationale" must briefly explain your reasoning in one or two sentences.',
    '"confidence" must reflect how certain you are given the information provided.',
  );
  return lines.join("\n");
}
