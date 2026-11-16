/**
 * Implements: Milestone 4 — Validation Layer. Generic: validates any record
 * against its ResourceDefinition's field list — no entity-specific rule
 * (e.g. "a Work needs at least one Contribution," Data Integrity Rules
 * Phase 4) lives here. That is future business-package logic, layered on
 * top of this generic layer, not a replacement for it (API Specification
 * 12 - Error Codes: VALIDATION_ERROR is generic; MISSING_CONTRIBUTION is
 * entity-specific and out of scope for this milestone).
 */

import type { FieldDefinition, ResourceDefinition } from "./types";

export interface FieldError {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  readonly fieldErrors: FieldError[];

  constructor(fieldErrors: FieldError[]) {
    super(`VALIDATION_ERROR — ${fieldErrors.length} field(s) failed validation.`);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateField(field: FieldDefinition, value: unknown): FieldError | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0);

  if (field.required && isEmpty) {
    return { field: field.name, message: `"${field.label}" is required.` };
  }

  if (isEmpty) return null; // optional and absent — nothing further to check

  if (field.type === "select" && field.options && typeof value === "string") {
    if (!field.options.includes(value)) {
      return {
        field: field.name,
        message: `"${field.label}" must be one of: ${field.options.join(", ")}.`,
      };
    }
  }

  // Every caller that goes through an actual <form> (FormData, see
  // edit-client.tsx's handleSave) submits every value as a plain string —
  // native HTML has no numeric/boolean form-field wire format. Requiring
  // typeof value === "number"/"boolean" here rejected every genuinely
  // valid save (e.g. Work.year, Work.is_featured) the moment this
  // validation layer was wired into genericUpdate; it was already wrong
  // for genericCreate, just never exercised by an actual filled-in form
  // before now. Accept the real wire representations alongside already-
  // typed values (callers that build a structured object directly, e.g.
  // @ahr/media's service.ts, still pass actual numbers/booleans).
  if (field.type === "number") {
    const isValidNumber =
      typeof value === "number" ||
      (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)));
    if (!isValidNumber) {
      return { field: field.name, message: `"${field.label}" must be a number.` };
    }
  }

  if (field.type === "boolean") {
    const isValidBoolean =
      typeof value === "boolean" ||
      value === "on" ||
      value === "off" ||
      value === "true" ||
      value === "false";
    if (!isValidBoolean) {
      return { field: field.name, message: `"${field.label}" must be true or false.` };
    }
  }

  // No relation-picker UI exists yet (relation fields render as a plain id
  // input — see e.g. work.ts's parent_work_id) — this at least turns a
  // mistyped value into a friendly field error instead of a raw Postgres
  // "invalid input syntax for type uuid" leaking through as a 500.
  if (field.type === "relation" && typeof value === "string" && !UUID_PATTERN.test(value)) {
    return {
      field: field.name,
      message: `"${field.label}" must be a valid record ID (uuid), not free text.`,
    };
  }

  return null;
}

/**
 * Validates a plain record against a ResourceDefinition's fields.
 * `bilingual-text`/`bilingual-textarea` fields are validated as TWO
 * underlying columns, `${name}_ar` and `${name}_en` (Data Foundation
 * Conventions — every bilingual field is a sibling-column pair), each
 * checked against the same `required` flag independently, per Frontend
 * Development Rules' "both languages handled together, never one added
 * later."
 */
export function validateResource(
  definition: ResourceDefinition,
  record: Record<string, unknown>,
): FieldError[] {
  const errors: FieldError[] = [];

  for (const field of definition.fields) {
    if (field.type === "bilingual-text" || field.type === "bilingual-textarea") {
      for (const suffix of ["ar", "en"] as const) {
        const columnName = `${field.name}_${suffix}`;
        const err = validateField(
          { ...field, name: columnName, label: `${field.label} (${suffix.toUpperCase()})` },
          record[columnName],
        );
        if (err) errors.push(err);
      }
      continue;
    }

    const err = validateField(field, record[field.name]);
    if (err) errors.push(err);
  }

  return errors;
}

/** Throws ValidationError if any field fails — convenience for repository.ts. */
export function assertValidResource(
  definition: ResourceDefinition,
  record: Record<string, unknown>,
): void {
  const errors = validateResource(definition, record);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * Same per-field checks as validateResource, but only for fields actually
 * present in `record` — genericUpdate's callers include true partial
 * updates (Inline Edit patches exactly one field), which must never be
 * rejected for "missing" required fields it never touched. A field that
 * IS present and explicitly emptied still fails its `required` check —
 * this only skips fields absent from the input entirely.
 */
export function validatePartialResource(
  definition: ResourceDefinition,
  record: Record<string, unknown>,
): FieldError[] {
  const errors: FieldError[] = [];

  for (const field of definition.fields) {
    if (field.type === "bilingual-text" || field.type === "bilingual-textarea") {
      for (const suffix of ["ar", "en"] as const) {
        const columnName = `${field.name}_${suffix}`;
        if (!(columnName in record)) continue;
        const err = validateField(
          { ...field, name: columnName, label: `${field.label} (${suffix.toUpperCase()})` },
          record[columnName],
        );
        if (err) errors.push(err);
      }
      continue;
    }

    if (!(field.name in record)) continue;
    const err = validateField(field, record[field.name]);
    if (err) errors.push(err);
  }

  return errors;
}

/** Throws ValidationError if any present field fails — convenience for repository.ts. */
export function assertValidPartialResource(
  definition: ResourceDefinition,
  record: Record<string, unknown>,
): void {
  const errors = validatePartialResource(definition, record);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}
