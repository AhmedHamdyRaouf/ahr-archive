import { describe, it, expect, vi } from "vitest";
import { generateEmbedding } from "../src/similarity-service";
import { AiProviderUnavailableError } from "../src/types";
import type { EmbeddingClient } from "../src/types";

function fakeLogger() {
  return { logSuccess: vi.fn(), logFailure: vi.fn() };
}

describe("similarity-service — generateEmbedding", () => {
  it("returns the embedding vector on success", async () => {
    const embeddingClient: EmbeddingClient = {
      embed: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    };
    const logger = fakeLogger();

    const result = await generateEmbedding({ embeddingClient, logger }, "some text");

    expect(result).toEqual([0.1, 0.2, 0.3]);
    expect(logger.logSuccess).toHaveBeenCalledWith({
      kind: "work-similarity-embedding",
      confidence: "n/a",
    });
  });

  it("wraps a provider failure as AiProviderUnavailableError and logs it", async () => {
    const embeddingClient: EmbeddingClient = {
      embed: vi.fn().mockRejectedValue(new Error("network exploded")),
    };
    const logger = fakeLogger();

    await expect(generateEmbedding({ embeddingClient, logger }, "some text")).rejects.toThrow(
      AiProviderUnavailableError,
    );
    expect(logger.logFailure).toHaveBeenCalled();
  });

  it("uses the default console logger when none is supplied", async () => {
    const embeddingClient: EmbeddingClient = {
      embed: vi.fn().mockResolvedValue([0.1]),
    };
    await expect(generateEmbedding({ embeddingClient }, "some text")).resolves.toEqual([0.1]);
  });
});
