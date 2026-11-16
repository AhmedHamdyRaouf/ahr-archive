import { describe, it, expect } from "vitest";
import {
  parseCategoryTagResponse,
  parseSummaryResponse,
  parseTranslationResponse,
  parseArticleSummaryResponse,
  parseContributionRoleResponse,
} from "../src/validation";
import { MalformedAiResponseError } from "../src/types";

describe("validation — parseCategoryTagResponse (14-AI-Integration.md §10)", () => {
  const available = ["song", "album"];

  it("parses a well-formed response", () => {
    const raw = JSON.stringify({
      categories: ["song"],
      tags: ["nostalgic"],
      rationale: "The title suggests a single song.",
      confidence: "medium",
    });
    const result = parseCategoryTagResponse(raw, available);
    expect(result.suggestedContent).toEqual({ categories: ["song"], tags: ["nostalgic"] });
    expect(result.confidence).toBe("medium");
    expect(result.rationale).toContain("single song");
  });

  it("rejects a category outside the caller-supplied available list, matching TAXONOMY_DOMAIN_MISMATCH's intent", () => {
    const raw = JSON.stringify({
      categories: ["not-a-real-category"],
      tags: [],
      rationale: "x",
      confidence: "low",
    });
    expect(() => parseCategoryTagResponse(raw, available)).toThrow(MalformedAiResponseError);
  });

  it("rejects non-JSON input entirely, not partially", () => {
    expect(() => parseCategoryTagResponse("not json at all", available)).toThrow(
      MalformedAiResponseError,
    );
  });

  it("rejects a response missing rationale", () => {
    const raw = JSON.stringify({ categories: [], tags: [], confidence: "low" });
    expect(() => parseCategoryTagResponse(raw, available)).toThrow(MalformedAiResponseError);
  });

  it("rejects an invalid confidence value", () => {
    const raw = JSON.stringify({
      categories: [],
      tags: [],
      rationale: "x",
      confidence: "extremely certain",
    });
    expect(() => parseCategoryTagResponse(raw, available)).toThrow(MalformedAiResponseError);
  });

  it("rejects categories/tags that are not arrays of strings", () => {
    const raw = JSON.stringify({ categories: "song", tags: [], rationale: "x", confidence: "low" });
    expect(() => parseCategoryTagResponse(raw, available)).toThrow(MalformedAiResponseError);
  });
});

describe("validation — parseSummaryResponse", () => {
  it("parses a well-formed response", () => {
    const raw = JSON.stringify({
      summaryAr: "ملخص",
      summaryEn: "Summary",
      rationale: "Based on the given title.",
      confidence: "high",
    });
    const result = parseSummaryResponse(raw);
    expect(result.suggestedContent).toEqual({ summaryAr: "ملخص", summaryEn: "Summary" });
    expect(result.confidence).toBe("high");
  });

  it("rejects a response missing summaryAr", () => {
    const raw = JSON.stringify({ summaryEn: "Summary", rationale: "x", confidence: "low" });
    expect(() => parseSummaryResponse(raw)).toThrow(MalformedAiResponseError);
  });

  it("rejects an empty-string summary as equivalent to missing", () => {
    const raw = JSON.stringify({
      summaryAr: "   ",
      summaryEn: "Summary",
      rationale: "x",
      confidence: "low",
    });
    expect(() => parseSummaryResponse(raw)).toThrow(MalformedAiResponseError);
  });

  it("rejects malformed JSON entirely", () => {
    expect(() => parseSummaryResponse("{not valid")).toThrow(MalformedAiResponseError);
  });

  it("rejects a JSON array (valid JSON, wrong shape)", () => {
    expect(() => parseSummaryResponse("[1,2,3]")).toThrow(MalformedAiResponseError);
  });
});

describe("validation — parseTranslationResponse", () => {
  it("parses a well-formed response", () => {
    const raw = JSON.stringify({
      translatedText: "أغنية",
      targetLocale: "ar",
      rationale: "Faithful translation of the English title.",
      confidence: "high",
    });
    const result = parseTranslationResponse(raw, "ar");
    expect(result.suggestedContent).toEqual({ translatedText: "أغنية", targetLocale: "ar" });
    expect(result.confidence).toBe("high");
  });

  it("rejects a targetLocale that does not match the expected locale", () => {
    const raw = JSON.stringify({
      translatedText: "Song",
      targetLocale: "en",
      rationale: "x",
      confidence: "low",
    });
    expect(() => parseTranslationResponse(raw, "ar")).toThrow(MalformedAiResponseError);
  });

  it("rejects an empty translatedText", () => {
    const raw = JSON.stringify({
      translatedText: "   ",
      targetLocale: "en",
      rationale: "x",
      confidence: "low",
    });
    expect(() => parseTranslationResponse(raw, "en")).toThrow(MalformedAiResponseError);
  });
});

describe("validation — parseArticleSummaryResponse", () => {
  it("parses a well-formed response", () => {
    const raw = JSON.stringify({
      summaryAr: "ملخص المقال",
      summaryEn: "Article summary",
      rationale: "Based on the pasted article text.",
      confidence: "medium",
    });
    const result = parseArticleSummaryResponse(raw);
    expect(result.suggestedContent).toEqual({
      summaryAr: "ملخص المقال",
      summaryEn: "Article summary",
    });
    expect(result.confidence).toBe("medium");
  });

  it("rejects a response missing summaryEn, same as parseSummaryResponse", () => {
    const raw = JSON.stringify({ summaryAr: "ملخص", rationale: "x", confidence: "low" });
    expect(() => parseArticleSummaryResponse(raw)).toThrow(MalformedAiResponseError);
  });
});

describe("validation — parseContributionRoleResponse", () => {
  const availableRoles = ["composer", "arranger", "producer"];

  it("parses a well-formed response", () => {
    const raw = JSON.stringify({
      role: "composer",
      rationale: "The person is credited as the primary songwriter.",
      confidence: "high",
    });
    const result = parseContributionRoleResponse(raw, availableRoles);
    expect(result.suggestedContent).toEqual({ role: "composer" });
    expect(result.confidence).toBe("high");
  });

  it("rejects a role outside the caller-supplied available list, matching chk_contribution_role", () => {
    const raw = JSON.stringify({
      role: "not-a-real-role",
      rationale: "x",
      confidence: "low",
    });
    expect(() => parseContributionRoleResponse(raw, availableRoles)).toThrow(
      MalformedAiResponseError,
    );
  });

  it("rejects a non-string role", () => {
    const raw = JSON.stringify({ role: 123, rationale: "x", confidence: "low" });
    expect(() => parseContributionRoleResponse(raw, availableRoles)).toThrow(
      MalformedAiResponseError,
    );
  });
});
