/**
 * Implements: 14-AI-Integration.md §6 (Provider Abstraction), §7 ("The
 * OpenAI API key lives server-side only... never exposed to the
 * client"). The one, sole implementation of the AiClient seam
 * (types.ts) for v1's one frozen provider (01-Architecture.md §2 —
 * "AI provider: OpenAI only").
 *
 * Uses the OpenAI REST API directly via fetch rather than the official
 * SDK — this keeps the dependency footprint at zero for a package this
 * narrow (one HTTP call, one response shape), and the whole point of the
 * AiClient interface is that swapping this implementation out later
 * never touches a call site regardless of how it's implemented internally.
 */

import type { AiClient, EmbeddingClient } from "./types";
import { AiProviderUnavailableError } from "./types";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const DEFAULT_MODEL = "gpt-4o-mini";
// Frozen alongside the chat model choice (14-AI-Integration.md §6 —
// OpenAI-only, behind this one abstraction). 1536 dimensions, matching
// work.search_embedding vector(1536) in the Phase 2 item 4 migration.
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const REQUEST_TIMEOUT_MS = 15_000;

export interface OpenAiClientOptions {
  apiKey: string;
  model?: string;
  embeddingModel?: string;
  timeoutMs?: number;
}

export class OpenAiClient implements AiClient, EmbeddingClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly embeddingModel: string;
  private readonly timeoutMs: number;

  constructor(options: OpenAiClientOptions) {
    if (!options.apiKey) {
      throw new Error(
        "OpenAiClient requires an API key. Never construct this client with an empty string " +
          "(10-Security.md §5 — secrets live in server-side environment configuration only).",
      );
    }
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.embeddingModel = options.embeddingModel ?? DEFAULT_EMBEDDING_MODEL;
    this.timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  }

  async complete(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          // Deterministic, low-temperature output — a suggestion tool
          // benefits from consistency far more than from creative variance
          // (14-AI-Integration.md §2 — every output must be explainable
          // and reviewable, which a wildly variable response undermines).
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new AiProviderUnavailableError(
          `OpenAI returned HTTP ${response.status}: ${bodyText.slice(0, 300)}`,
        );
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;

      if (typeof content !== "string" || content.length === 0) {
        throw new AiProviderUnavailableError("OpenAI response contained no message content.");
      }

      return content;
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AiProviderUnavailableError(`request timed out after ${this.timeoutMs}ms`);
      }
      throw new AiProviderUnavailableError(
        error instanceof Error ? error.message : "unknown fetch failure",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async embed(text: string): Promise<number[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(OPENAI_EMBEDDINGS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: text,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new AiProviderUnavailableError(
          `OpenAI returned HTTP ${response.status}: ${bodyText.slice(0, 300)}`,
        );
      }

      const payload = (await response.json()) as {
        data?: Array<{ embedding?: number[] }>;
      };
      const embedding = payload.data?.[0]?.embedding;

      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new AiProviderUnavailableError("OpenAI response contained no embedding vector.");
      }

      return embedding;
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new AiProviderUnavailableError(`request timed out after ${this.timeoutMs}ms`);
      }
      throw new AiProviderUnavailableError(
        error instanceof Error ? error.message : "unknown fetch failure",
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * Reads OPENAI_API_KEY from server-side environment configuration only —
 * never from a NEXT_PUBLIC_* variable (10-Security.md §5). Throws rather
 * than silently falling back to an empty/placeholder client, matching
 * @ahr/auth's requireEnv precedent for exactly this kind of required
 * secret.
 */
export function createOpenAiClientFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): AiClient & EmbeddingClient {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing required environment variable "OPENAI_API_KEY". See .env.example. ' +
        "(14-AI-Integration.md §7 — the AI provider key must be configured server-side before any suggestion request can run.)",
    );
  }
  return new OpenAiClient({
    apiKey,
    model: env.OPENAI_MODEL || undefined,
    embeddingModel: env.OPENAI_EMBEDDING_MODEL || undefined,
  });
}
