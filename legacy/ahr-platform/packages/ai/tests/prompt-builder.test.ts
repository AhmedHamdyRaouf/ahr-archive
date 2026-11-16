import { describe, it, expect } from "vitest";
import {
  buildCategoryTagPrompt,
  buildSummaryPrompt,
  buildTranslationPrompt,
  buildArticleSummaryPrompt,
  buildContributionRolePrompt,
} from "../src/prompt-builder";
import type { EntityContext } from "../src/types";

const baseContext: EntityContext = {
  entityType: "work",
  titleAr: "أغنية تجريبية",
  titleEn: "Test Song",
  descriptionAr: "وصف تجريبي",
  descriptionEn: "A test description",
  availableCategories: ["song", "album", "film"],
};

describe("prompt-builder — bounded, entity-scoped prompts (14-AI-Integration.md §2 item 3)", () => {
  it("buildCategoryTagPrompt includes the entity's own fields", () => {
    const prompt = buildCategoryTagPrompt(baseContext);
    expect(prompt).toContain("Test Song");
    expect(prompt).toContain("أغنية تجريبية");
    expect(prompt).toContain("A test description");
  });

  it("buildCategoryTagPrompt includes only the caller-supplied available categories", () => {
    const prompt = buildCategoryTagPrompt(baseContext);
    expect(prompt).toContain("song, album, film");
  });

  it("buildCategoryTagPrompt never includes fields the caller did not supply (no bulk data leakage)", () => {
    const minimal: EntityContext = {
      entityType: "project",
      titleAr: "مشروع",
      titleEn: "Project",
      availableCategories: ["training"],
    };
    const prompt = buildCategoryTagPrompt(minimal);
    expect(prompt).not.toContain("Description");
    expect(prompt).not.toContain("Already-assigned");
  });

  it("buildCategoryTagPrompt instructs the model to respond with JSON only", () => {
    const prompt = buildCategoryTagPrompt(baseContext);
    expect(prompt).toMatch(/JSON object only/i);
    expect(prompt).toContain('"categories"');
    expect(prompt).toContain('"confidence"');
  });

  it("buildSummaryPrompt includes the entity's own fields and the JSON contract", () => {
    const prompt = buildSummaryPrompt(baseContext);
    expect(prompt).toContain("Test Song");
    expect(prompt).toContain('"summaryAr"');
    expect(prompt).toContain('"summaryEn"');
  });

  it("buildTranslationPrompt includes the source text and target locale contract", () => {
    const prompt = buildTranslationPrompt({
      fieldLabel: "Title",
      sourceLocale: "en",
      targetLocale: "ar",
      sourceText: "Test Song",
    });
    expect(prompt).toContain("Test Song");
    expect(prompt).toContain("Title");
    expect(prompt).toContain('"translatedText"');
    expect(prompt).toContain('"targetLocale" must be "ar"');
    expect(prompt).toMatch(/faithful Arabic translation/i);
  });

  it("buildArticleSummaryPrompt includes the pasted article text and the JSON contract", () => {
    const prompt = buildArticleSummaryPrompt({
      articleText: "A long-form article about a concert premiere.",
    });
    expect(prompt).toContain("A long-form article about a concert premiere.");
    expect(prompt).toContain('"summaryAr"');
    expect(prompt).toContain('"summaryEn"');
    expect(prompt).toMatch(/JSON object only/i);
  });

  it("buildContributionRolePrompt includes the person, subject, and available roles", () => {
    const prompt = buildContributionRolePrompt({
      personName: "Ahmed Hamdy Raouf",
      subjectLabel: "Test Song",
      subjectType: "work",
      availableRoles: ["composer", "arranger", "producer"],
    });
    expect(prompt).toContain("Ahmed Hamdy Raouf");
    expect(prompt).toContain("Work: Test Song");
    expect(prompt).toContain("composer, arranger, producer");
    expect(prompt).toContain('"role"');
  });

  it("buildContributionRolePrompt includes roleDetail when supplied", () => {
    const prompt = buildContributionRolePrompt({
      personName: "Ahmed Hamdy Raouf",
      subjectLabel: "Test Song",
      subjectType: "work",
      roleDetail: "Wrote the lyrics",
      availableRoles: ["composer", "lyricist"],
    });
    expect(prompt).toContain("Wrote the lyrics");
  });
});
