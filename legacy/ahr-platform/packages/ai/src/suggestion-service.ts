/**
 * Implements: 14-AI-Integration.md §3 (Runtime Flow), §7 (Security and
 * Cost Controls — "every call is triggered by an explicit Administrator
 * action... never automatic or background"), §8 (Interim Logging).
 *
 * This is the one entry point CMS/Dashboard code should call — never the
 * AiClient or OpenAI directly (14-AI-Integration.md §6). Every suggestion
 * is ephemeral: this function returns a result, it does not persist
 * anything, matching the documented schema gap (§5 of that same
 * document, ai_recommendation_log not yet built) — logging here goes to
 * the technical/operational log stream only, per §8, never to a database
 * table this package has no schema for.
 */

import type {
  AiClient,
  AiSuggestionResult,
  ArticleSummaryContext,
  ContributionRoleContext,
  EntityContext,
  TranslationContext,
} from "./types";
import {
  buildArticleSummaryPrompt,
  buildCategoryTagPrompt,
  buildContributionRolePrompt,
  buildSummaryPrompt,
  buildTranslationPrompt,
} from "./prompt-builder";
import {
  parseArticleSummaryResponse,
  parseCategoryTagResponse,
  parseContributionRoleResponse,
  parseSummaryResponse,
  parseTranslationResponse,
} from "./validation";
import { AiProviderUnavailableError, MalformedAiResponseError } from "./types";

/**
 * Interim logging seam (14-AI-Integration.md §8). Defaults to the
 * technical/operational console stream if the caller doesn't supply one —
 * deliberately never activity_log or entity_state_transition (Logging
 * Strategy, Development Specification 11 — "no code path writes
 * technical/operational logs into either database table").
 */
export interface AiCallLogger {
  logSuccess(input: { kind: string; confidence: string }): void;
  logFailure(input: { kind: string; reason: string }): void;
}

export const consoleAiCallLogger: AiCallLogger = {
  logSuccess({ kind, confidence }) {
    // eslint-disable-next-line no-console
    console.warn(`[ai] suggestion succeeded: kind="${kind}" confidence="${confidence}"`);
  },
  logFailure({ kind, reason }) {
    // eslint-disable-next-line no-console
    console.error(`[ai] suggestion failed: kind="${kind}" reason="${reason}"`);
  },
};

export interface SuggestionServiceContext {
  aiClient: AiClient;
  logger?: AiCallLogger;
}

export async function suggestCategoriesAndTags(
  ctx: SuggestionServiceContext,
  context: EntityContext,
): Promise<AiSuggestionResult> {
  const logger = ctx.logger ?? consoleAiCallLogger;
  const kind = "category-tag-suggestion" as const;

  try {
    const prompt = buildCategoryTagPrompt(context);
    const raw = await ctx.aiClient.complete(prompt);
    const { suggestedContent, rationale, confidence } = parseCategoryTagResponse(
      raw,
      context.availableCategories,
    );

    logger.logSuccess({ kind, confidence });

    return {
      kind,
      suggestedContent,
      rationale,
      confidenceLevel: confidence,
      provider: "openai",
    };
  } catch (error) {
    logger.logFailure({ kind, reason: error instanceof Error ? error.message : "unknown error" });
    if (error instanceof AiProviderUnavailableError || error instanceof MalformedAiResponseError) {
      throw error;
    }
    throw new AiProviderUnavailableError(error instanceof Error ? error.message : "unknown error");
  }
}

export async function suggestSummary(
  ctx: SuggestionServiceContext,
  context: EntityContext,
): Promise<AiSuggestionResult> {
  const logger = ctx.logger ?? consoleAiCallLogger;
  const kind = "summary-suggestion" as const;

  try {
    const prompt = buildSummaryPrompt(context);
    const raw = await ctx.aiClient.complete(prompt);
    const { suggestedContent, rationale, confidence } = parseSummaryResponse(raw);

    logger.logSuccess({ kind, confidence });

    return {
      kind,
      suggestedContent,
      rationale,
      confidenceLevel: confidence,
      provider: "openai",
    };
  } catch (error) {
    logger.logFailure({ kind, reason: error instanceof Error ? error.message : "unknown error" });
    if (error instanceof AiProviderUnavailableError || error instanceof MalformedAiResponseError) {
      throw error;
    }
    throw new AiProviderUnavailableError(error instanceof Error ? error.message : "unknown error");
  }
}

export async function suggestTranslation(
  ctx: SuggestionServiceContext,
  context: TranslationContext,
): Promise<AiSuggestionResult> {
  const logger = ctx.logger ?? consoleAiCallLogger;
  const kind = "translation-suggestion" as const;

  try {
    const prompt = buildTranslationPrompt(context);
    const raw = await ctx.aiClient.complete(prompt);
    const { suggestedContent, rationale, confidence } = parseTranslationResponse(
      raw,
      context.targetLocale,
    );

    logger.logSuccess({ kind, confidence });

    return {
      kind,
      suggestedContent,
      rationale,
      confidenceLevel: confidence,
      provider: "openai",
    };
  } catch (error) {
    logger.logFailure({ kind, reason: error instanceof Error ? error.message : "unknown error" });
    if (error instanceof AiProviderUnavailableError || error instanceof MalformedAiResponseError) {
      throw error;
    }
    throw new AiProviderUnavailableError(error instanceof Error ? error.message : "unknown error");
  }
}

export async function suggestArticleSummary(
  ctx: SuggestionServiceContext,
  context: ArticleSummaryContext,
): Promise<AiSuggestionResult> {
  const logger = ctx.logger ?? consoleAiCallLogger;
  const kind = "article-summary-suggestion" as const;

  try {
    const prompt = buildArticleSummaryPrompt(context);
    const raw = await ctx.aiClient.complete(prompt);
    const { suggestedContent, rationale, confidence } = parseArticleSummaryResponse(raw);

    logger.logSuccess({ kind, confidence });

    return {
      kind,
      suggestedContent,
      rationale,
      confidenceLevel: confidence,
      provider: "openai",
    };
  } catch (error) {
    logger.logFailure({ kind, reason: error instanceof Error ? error.message : "unknown error" });
    if (error instanceof AiProviderUnavailableError || error instanceof MalformedAiResponseError) {
      throw error;
    }
    throw new AiProviderUnavailableError(error instanceof Error ? error.message : "unknown error");
  }
}

export async function suggestContributionRole(
  ctx: SuggestionServiceContext,
  context: ContributionRoleContext,
): Promise<AiSuggestionResult> {
  const logger = ctx.logger ?? consoleAiCallLogger;
  const kind = "contribution-role-suggestion" as const;

  try {
    const prompt = buildContributionRolePrompt(context);
    const raw = await ctx.aiClient.complete(prompt);
    const { suggestedContent, rationale, confidence } = parseContributionRoleResponse(
      raw,
      context.availableRoles,
    );

    logger.logSuccess({ kind, confidence });

    return {
      kind,
      suggestedContent,
      rationale,
      confidenceLevel: confidence,
      provider: "openai",
    };
  } catch (error) {
    logger.logFailure({ kind, reason: error instanceof Error ? error.message : "unknown error" });
    if (error instanceof AiProviderUnavailableError || error instanceof MalformedAiResponseError) {
      throw error;
    }
    throw new AiProviderUnavailableError(error instanceof Error ? error.message : "unknown error");
  }
}

/**
 * Single dispatch entry point matching AiSuggestionRequest's `kind`
 * discriminant — the Route Handler calls this one function rather than
 * branching on `kind` itself (Coding Standards: "one place for a rule").
 * Each union member has a single-literal `kind` so a caller's `if` chain
 * narrows `request.context` cleanly by exclusion (a member combining two
 * `kind` literals under one type breaks that narrowing — see the
 * translation-suggestion fix that split this union previously).
 */
export async function requestSuggestion(
  ctx: SuggestionServiceContext,
  request:
    | { kind: "category-tag-suggestion"; context: EntityContext }
    | { kind: "summary-suggestion"; context: EntityContext }
    | { kind: "translation-suggestion"; context: TranslationContext }
    | { kind: "article-summary-suggestion"; context: ArticleSummaryContext }
    | { kind: "contribution-role-suggestion"; context: ContributionRoleContext },
): Promise<AiSuggestionResult> {
  if (request.kind === "category-tag-suggestion") {
    return suggestCategoriesAndTags(ctx, request.context);
  }
  if (request.kind === "summary-suggestion") {
    return suggestSummary(ctx, request.context);
  }
  if (request.kind === "translation-suggestion") {
    return suggestTranslation(ctx, request.context);
  }
  if (request.kind === "article-summary-suggestion") {
    return suggestArticleSummary(ctx, request.context);
  }
  return suggestContributionRole(ctx, request.context);
}
