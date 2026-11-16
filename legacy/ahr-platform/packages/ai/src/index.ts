/**
 * @ahr/ai — public exports only (Coding Standards: "no deep imports from
 * outside a package's public exports").
 */

export type {
  AiSuggestionKind,
  ConfidenceLevel,
  EntityContext,
  TranslationContext,
  ArticleSummaryContext,
  ContributionRoleContext,
  AiSuggestionRequest,
  TranslationSuggestionRequest,
  ArticleSummaryRequest,
  ContributionRoleRequest,
  CategoryTagSuggestion,
  SummarySuggestion,
  TranslationSuggestion,
  ContributionRoleSuggestion,
  AiSuggestionResult,
  AiClient,
  EmbeddingClient,
} from "./types";
export { AiProviderUnavailableError, MalformedAiResponseError } from "./types";

export { OpenAiClient, createOpenAiClientFromEnv } from "./openai-client";
export type { OpenAiClientOptions } from "./openai-client";

export {
  buildCategoryTagPrompt,
  buildSummaryPrompt,
  buildTranslationPrompt,
  buildArticleSummaryPrompt,
  buildContributionRolePrompt,
} from "./prompt-builder";
export {
  parseCategoryTagResponse,
  parseSummaryResponse,
  parseTranslationResponse,
  parseArticleSummaryResponse,
  parseContributionRoleResponse,
} from "./validation";

export {
  suggestCategoriesAndTags,
  suggestSummary,
  suggestTranslation,
  suggestArticleSummary,
  suggestContributionRole,
  requestSuggestion,
  consoleAiCallLogger,
} from "./suggestion-service";
export type { AiCallLogger, SuggestionServiceContext } from "./suggestion-service";

export { generateEmbedding } from "./similarity-service";
export type { EmbeddingServiceContext } from "./similarity-service";
