/**
 * Implements: 14-AI-Integration.md §1 ("Archive-scoped AI assistance
 * only — suggested Category/Tag assignment and draft summary/description
 * text for Work/Project entities"), §2 (Governing Decision Boundaries),
 * §6 (Provider Abstraction). Built during the Development Audit —
 * previously unbuilt (§4 of that document).
 */

/** In-scope suggestion kinds — extended as new human-reviewed AI features ship. */
export type AiSuggestionKind =
  | "category-tag-suggestion"
  | "summary-suggestion"
  | "translation-suggestion"
  | "article-summary-suggestion"
  | "contribution-role-suggestion";

/**
 * Explainability is non-negotiable (14-AI-Integration.md §2 item 2) — every
 * result carries one of these three levels, never a raw numeric score the
 * Administrator would have to interpret without guidance.
 */
export type ConfidenceLevel = "low" | "medium" | "high";

/**
 * Bounded entity context (14-AI-Integration.md §2 item 3 — "only the
 * specific entity's own fields... never a bulk export of the database").
 * The caller (a Route Handler already holding one Work/Project row) is
 * responsible for populating this from that single row — this package
 * has no database access of its own and cannot fetch more than it is
 * given.
 */
export interface EntityContext {
  entityType: "work" | "project";
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  /** Category/tag names already attached, so the model doesn't re-suggest them. */
  existingCategories?: string[];
  existingTags?: string[];
  /**
   * The caller must supply the actual allowed category names for this
   * entity type (e.g. only `work_type`-domain categories for a Work) —
   * this package never invents a category/tag value outside what it is
   * told is valid, matching TAXONOMY_DOMAIN_MISMATCH's own enforcement
   * elsewhere (05-CMS.md §4) rather than duplicating that rule here.
   */
  availableCategories: string[];
}

/**
 * Bounded context for a single bilingual-field translation request — only
 * the one field's source text and target locale go into the prompt.
 */
export interface TranslationContext {
  fieldLabel: string;
  sourceLocale: "ar" | "en";
  targetLocale: "ar" | "en";
  sourceText: string;
}

export interface AiSuggestionRequest {
  kind: "category-tag-suggestion" | "summary-suggestion";
  context: EntityContext;
}

export interface TranslationSuggestionRequest {
  kind: "translation-suggestion";
  context: TranslationContext;
}

/**
 * Bounded context for summarizing a pasted-in journalism article (Phase 2 AI
 * backlog item 2). No stored article-body field exists anywhere in the
 * schema (`press_mention` has only `title`/`url`/`publication_name`), so the
 * Administrator pastes the source text in ephemerally — never persisted,
 * never fetched by this package from the `url` field.
 */
export interface ArticleSummaryContext {
  articleText: string;
}

export interface ArticleSummaryRequest {
  kind: "article-summary-suggestion";
  context: ArticleSummaryContext;
}

/**
 * Bounded context for suggesting a Contribution's `role` (Phase 2 AI
 * backlog item 3). `contribution` itself has no descriptive text — only
 * foreign keys (`person_id`, `work_id`/`project_id`/`event_id`) and the
 * `role` enum being suggested here — so the caller resolves the related
 * Person's display name and the Work/Project/Event's title first (via the
 * existing `GET /api/cms/{entityType}/{id}`) and passes only those bounded
 * strings in, never a raw id or unrelated record data.
 */
export interface ContributionRoleContext {
  personName: string;
  subjectLabel: string;
  subjectType: "work" | "project" | "event";
  roleDetail?: string;
  /**
   * The exact allowed values for this table's `role` column
   * (`chk_contribution_role`) — the caller supplies them from
   * `contributionDefinition`'s own field options, never hardcoded here,
   * so this package never invents a role value outside what is valid.
   */
  availableRoles: string[];
}

export interface ContributionRoleRequest {
  kind: "contribution-role-suggestion";
  context: ContributionRoleContext;
}

export interface CategoryTagSuggestion {
  categories: string[];
  tags: string[];
}

export interface SummarySuggestion {
  summaryAr: string;
  summaryEn: string;
}

export interface TranslationSuggestion {
  translatedText: string;
  targetLocale: "ar" | "en";
}

export interface ContributionRoleSuggestion {
  role: string;
}

export interface AiSuggestionResult<
  T =
    | CategoryTagSuggestion
    | SummarySuggestion
    | TranslationSuggestion
    | ContributionRoleSuggestion,
> {
  kind: AiSuggestionKind;
  suggestedContent: T;
  rationale: string;
  confidenceLevel: ConfidenceLevel;
  provider: "openai";
}

/**
 * The provider-agnostic seam (14-AI-Integration.md §6). Deliberately the
 * smallest possible interface — one method, taking a fully-built prompt
 * and returning raw text — so that adding a second provider later means
 * implementing this one method, not re-deriving prompt construction or
 * response parsing (both of which stay in this package, provider-agnostic,
 * in prompt-builder.ts/validation.ts).
 */
export interface AiClient {
  complete(prompt: string): Promise<string>;
}

/**
 * Separate seam from AiClient (Phase 2 AI backlog item 4 — Similar/duplicate
 * Work detection) — embeddings are a different OpenAI endpoint/capability
 * than chat completion, and a mock AiClient in a test shouldn't need to
 * fake an unrelated method it never calls.
 */
export interface EmbeddingClient {
  embed(text: string): Promise<number[]>;
}

export class AiProviderUnavailableError extends Error {
  constructor(cause: string) {
    super(`AI provider unavailable: ${cause}`);
    this.name = "AiProviderUnavailableError";
  }
}

export class MalformedAiResponseError extends Error {
  constructor(reason: string) {
    super(`Malformed AI response, discarded: ${reason}`);
    this.name = "MalformedAiResponseError";
  }
}
