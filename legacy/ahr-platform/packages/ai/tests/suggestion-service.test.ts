import { describe, it, expect, vi } from "vitest";
import {
  suggestCategoriesAndTags,
  suggestSummary,
  suggestTranslation,
  suggestArticleSummary,
  suggestContributionRole,
  requestSuggestion,
} from "../src/suggestion-service";
import { AiProviderUnavailableError, MalformedAiResponseError } from "../src/types";
import type { AiClient, EntityContext } from "../src/types";

const context: EntityContext = {
  entityType: "work",
  titleAr: "أغنية",
  titleEn: "Song",
  availableCategories: ["song", "album"],
};

function fakeLogger() {
  return { logSuccess: vi.fn(), logFailure: vi.fn() };
}

describe("suggestion-service — suggestCategoriesAndTags", () => {
  it("returns a well-formed AiSuggestionResult on success", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          categories: ["song"],
          tags: ["archival"],
          rationale: "Matches the title.",
          confidence: "high",
        }),
      ),
    };
    const logger = fakeLogger();

    const result = await suggestCategoriesAndTags({ aiClient, logger }, context);

    expect(result.kind).toBe("category-tag-suggestion");
    expect(result.provider).toBe("openai");
    expect(result.confidenceLevel).toBe("high");
    expect(result.suggestedContent).toEqual({ categories: ["song"], tags: ["archival"] });
    expect(logger.logSuccess).toHaveBeenCalledWith({
      kind: "category-tag-suggestion",
      confidence: "high",
    });
  });

  it("wraps a provider failure as AiProviderUnavailableError and logs it, never throwing a raw fetch error", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockRejectedValue(new Error("network exploded")),
    };
    const logger = fakeLogger();

    await expect(suggestCategoriesAndTags({ aiClient, logger }, context)).rejects.toThrow(
      AiProviderUnavailableError,
    );
    expect(logger.logFailure).toHaveBeenCalled();
  });

  it("propagates a malformed-response failure as MalformedAiResponseError, not silently applied", async () => {
    const aiClient: AiClient = { complete: vi.fn().mockResolvedValue("not json") };
    const logger = fakeLogger();

    await expect(suggestCategoriesAndTags({ aiClient, logger }, context)).rejects.toThrow(
      MalformedAiResponseError,
    );
  });

  it("uses the default console logger when none is supplied (never throws for lack of a logger)", async () => {
    const aiClient: AiClient = {
      complete: vi
        .fn()
        .mockResolvedValue(
          JSON.stringify({ categories: [], tags: [], rationale: "x", confidence: "low" }),
        ),
    };
    await expect(suggestCategoriesAndTags({ aiClient }, context)).resolves.toBeDefined();
  });
});

describe("suggestion-service — suggestSummary", () => {
  it("returns a well-formed AiSuggestionResult on success", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          summaryAr: "ملخص",
          summaryEn: "Summary",
          rationale: "Based on title.",
          confidence: "medium",
        }),
      ),
    };
    const result = await suggestSummary({ aiClient }, context);
    expect(result.kind).toBe("summary-suggestion");
    expect(result.suggestedContent).toEqual({ summaryAr: "ملخص", summaryEn: "Summary" });
  });
});

describe("suggestion-service — suggestTranslation", () => {
  it("returns a well-formed AiSuggestionResult on success", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          translatedText: "أغنية",
          targetLocale: "ar",
          rationale: "Faithful translation.",
          confidence: "high",
        }),
      ),
    };
    const result = await suggestTranslation(
      { aiClient },
      {
        fieldLabel: "Title",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceText: "Song",
      },
    );
    expect(result.kind).toBe("translation-suggestion");
    expect(result.suggestedContent).toEqual({ translatedText: "أغنية", targetLocale: "ar" });
  });
});

describe("suggestion-service — suggestArticleSummary", () => {
  it("returns a well-formed AiSuggestionResult on success", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          summaryAr: "ملخص المقال",
          summaryEn: "Article summary",
          rationale: "Based on the pasted article text.",
          confidence: "medium",
        }),
      ),
    };
    const result = await suggestArticleSummary(
      { aiClient },
      { articleText: "A long-form article about a concert premiere." },
    );
    expect(result.kind).toBe("article-summary-suggestion");
    expect(result.suggestedContent).toEqual({
      summaryAr: "ملخص المقال",
      summaryEn: "Article summary",
    });
  });
});

describe("suggestion-service — suggestContributionRole", () => {
  it("returns a well-formed AiSuggestionResult on success", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          role: "composer",
          rationale: "Credited as the primary songwriter.",
          confidence: "high",
        }),
      ),
    };
    const result = await suggestContributionRole(
      { aiClient },
      {
        personName: "Ahmed Hamdy Raouf",
        subjectLabel: "Test Song",
        subjectType: "work",
        availableRoles: ["composer", "arranger", "producer"],
      },
    );
    expect(result.kind).toBe("contribution-role-suggestion");
    expect(result.suggestedContent).toEqual({ role: "composer" });
  });
});

describe("suggestion-service — requestSuggestion (single dispatch entry point)", () => {
  it("dispatches to suggestCategoriesAndTags for kind='category-tag-suggestion'", async () => {
    const aiClient: AiClient = {
      complete: vi
        .fn()
        .mockResolvedValue(
          JSON.stringify({ categories: [], tags: [], rationale: "x", confidence: "low" }),
        ),
    };
    const result = await requestSuggestion(
      { aiClient },
      { kind: "category-tag-suggestion", context },
    );
    expect(result.kind).toBe("category-tag-suggestion");
  });

  it("dispatches to suggestSummary for kind='summary-suggestion'", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          summaryAr: "أ",
          summaryEn: "b",
          rationale: "x",
          confidence: "low",
        }),
      ),
    };
    const result = await requestSuggestion({ aiClient }, { kind: "summary-suggestion", context });
    expect(result.kind).toBe("summary-suggestion");
  });

  it("dispatches to suggestTranslation for kind='translation-suggestion'", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          translatedText: "Song",
          targetLocale: "en",
          rationale: "x",
          confidence: "low",
        }),
      ),
    };
    const result = await requestSuggestion(
      { aiClient },
      {
        kind: "translation-suggestion",
        context: {
          fieldLabel: "Title",
          sourceLocale: "ar",
          targetLocale: "en",
          sourceText: "أغنية",
        },
      },
    );
    expect(result.kind).toBe("translation-suggestion");
  });

  it("dispatches to suggestArticleSummary for kind='article-summary-suggestion'", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({
          summaryAr: "أ",
          summaryEn: "b",
          rationale: "x",
          confidence: "low",
        }),
      ),
    };
    const result = await requestSuggestion(
      { aiClient },
      { kind: "article-summary-suggestion", context: { articleText: "Article text." } },
    );
    expect(result.kind).toBe("article-summary-suggestion");
  });

  it("dispatches to suggestContributionRole for kind='contribution-role-suggestion'", async () => {
    const aiClient: AiClient = {
      complete: vi.fn().mockResolvedValue(
        JSON.stringify({ role: "arranger", rationale: "x", confidence: "low" }),
      ),
    };
    const result = await requestSuggestion(
      { aiClient },
      {
        kind: "contribution-role-suggestion",
        context: {
          personName: "Ahmed Hamdy Raouf",
          subjectLabel: "Test Song",
          subjectType: "work",
          availableRoles: ["composer", "arranger"],
        },
      },
    );
    expect(result.kind).toBe("contribution-role-suggestion");
  });
});
