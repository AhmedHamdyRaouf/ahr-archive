/**
 * Implements: Phase 2 AI backlog item 4 (Similar/duplicate Work detection),
 * built once and reused by items 5–6. Separate from suggestion-service.ts —
 * an embedding is not a reviewable "suggestion" with a rationale/confidence
 * an Administrator accepts or rejects (14-AI-Integration.md §2 item 2), it
 * is an intermediate vector this package hands back so the caller (which
 * owns the database) can store it and run a similarity query. This package
 * still has no database access of its own (same boundary as
 * suggestion-service.ts).
 */

import type { AiCallLogger } from "./suggestion-service";
import { consoleAiCallLogger } from "./suggestion-service";
import type { EmbeddingClient } from "./types";
import { AiProviderUnavailableError } from "./types";

export interface EmbeddingServiceContext {
  embeddingClient: EmbeddingClient;
  logger?: AiCallLogger;
}

/**
 * Generates one embedding vector for the given text (14-AI-Integration.md
 * §7 — every call is triggered by an explicit Administrator action; the
 * caller is responsible for only invoking this from such an action, never
 * automatically on save/schedule).
 */
export async function generateEmbedding(
  ctx: EmbeddingServiceContext,
  text: string,
): Promise<number[]> {
  const logger = ctx.logger ?? consoleAiCallLogger;
  const kind = "work-similarity-embedding";

  try {
    const embedding = await ctx.embeddingClient.embed(text);
    logger.logSuccess({ kind, confidence: "n/a" });
    return embedding;
  } catch (error) {
    logger.logFailure({ kind, reason: error instanceof Error ? error.message : "unknown error" });
    if (error instanceof AiProviderUnavailableError) {
      throw error;
    }
    throw new AiProviderUnavailableError(error instanceof Error ? error.message : "unknown error");
  }
}
