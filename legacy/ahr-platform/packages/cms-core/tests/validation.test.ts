import { describe, it, expect } from "vitest";
import {
  validateResource,
  assertValidResource,
  validatePartialResource,
  assertValidPartialResource,
  ValidationError,
} from "../src/validation";
import type { ResourceDefinition } from "../src/types";

// A generic, synthetic resource definition used only for testing the engine
// itself — deliberately not named after any real business entity (Work,
// Person, etc.), per this milestone's "no business packages" rule.
const sampleDefinition: ResourceDefinition = {
  tableName: "sample_generic_entity",
  label: "Sample",
  labelPlural: "Samples",
  hasSlug: true,
  slugSourceField: "title_en",
  hasLifecycle: true,
  fields: [
    { name: "title", type: "bilingual-text", label: "Title", required: true },
    { name: "kind", type: "select", label: "Kind", required: true, options: ["alpha", "beta"] },
    { name: "count", type: "number", label: "Count" },
    { name: "is_featured", type: "boolean", label: "Featured" },
    { name: "parent_id", type: "relation", label: "Parent" },
  ],
};

describe("validation — generic Validation Layer (Milestone 4)", () => {
  it("passes a fully valid record", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "عنوان",
      title_en: "Title",
      kind: "alpha",
      count: 3,
      is_featured: true,
    });
    expect(errors).toHaveLength(0);
  });

  it("validates BOTH halves of a bilingual field independently", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "",
      title_en: "Title",
      kind: "alpha",
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.field).toBe("title_ar");
  });

  it("rejects a select value outside the fixed option set", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "عنوان",
      title_en: "Title",
      kind: "gamma",
    });
    expect(errors.some((e) => e.field === "kind")).toBe(true);
  });

  it("rejects a non-number for a number field", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      count: "three",
    });
    expect(errors.some((e) => e.field === "count")).toBe(true);
  });

  it("accepts a numeric string for a number field — real <form> submissions never send a JS number", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      count: "2008",
    });
    expect(errors.some((e) => e.field === "count")).toBe(false);
  });

  it("accepts a native checkbox's 'on'/'off' string for a boolean field", () => {
    const onErrors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      is_featured: "on",
    });
    expect(onErrors.some((e) => e.field === "is_featured")).toBe(false);

    const offErrors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      is_featured: "off",
    });
    expect(offErrors.some((e) => e.field === "is_featured")).toBe(false);
  });

  it("still rejects a genuinely non-boolean value for a boolean field", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      is_featured: "maybe",
    });
    expect(errors.some((e) => e.field === "is_featured")).toBe(true);
  });

  it("does not flag an optional field that is simply absent", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
    });
    expect(errors).toHaveLength(0);
  });

  it("assertValidResource throws ValidationError with the same field errors", () => {
    expect(() => assertValidResource(sampleDefinition, { kind: "alpha" })).toThrow(ValidationError);
  });

  it("rejects free text in a relation field instead of leaking a raw db error", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      parent_id: "Had Aqsaa",
    });
    expect(errors.some((e) => e.field === "parent_id")).toBe(true);
  });

  it("accepts a well-formed uuid in a relation field", () => {
    const errors = validateResource(sampleDefinition, {
      title_ar: "ع",
      title_en: "T",
      kind: "alpha",
      parent_id: "d7b1969b-a035-598d-befd-4b9b1fc925ba",
    });
    expect(errors.some((e) => e.field === "parent_id")).toBe(false);
  });
});

describe("validation — validatePartialResource (Inline Edit / PATCH must not require untouched fields)", () => {
  it("does not flag required fields that are simply absent from a partial update", () => {
    const errors = validatePartialResource(sampleDefinition, { kind: "alpha" });
    expect(errors).toHaveLength(0);
  });

  it("still flags a present field that fails its own check", () => {
    const errors = validatePartialResource(sampleDefinition, { kind: "gamma" });
    expect(errors.some((e) => e.field === "kind")).toBe(true);
  });

  it("still flags a present required field that was explicitly emptied", () => {
    const errors = validatePartialResource(sampleDefinition, { title_ar: "" });
    expect(errors.some((e) => e.field === "title_ar")).toBe(true);
  });

  it("catches a mistyped relation field in a single-field patch (the parent_work_id bug)", () => {
    const errors = validatePartialResource(sampleDefinition, { parent_id: "Had Aqsaa" });
    expect(errors.some((e) => e.field === "parent_id")).toBe(true);
  });

  it("assertValidPartialResource throws only for present, failing fields", () => {
    expect(() => assertValidPartialResource(sampleDefinition, { kind: "gamma" })).toThrow(
      ValidationError,
    );
    expect(() => assertValidPartialResource(sampleDefinition, { kind: "alpha" })).not.toThrow();
  });
});
