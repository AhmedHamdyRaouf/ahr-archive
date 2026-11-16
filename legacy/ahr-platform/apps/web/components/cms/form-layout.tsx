import type { ResourceDefinition } from "@ahr/cms-core";
import { TextField } from "./fields/text-field";
import { BilingualTextField } from "./fields/bilingual-text-field";
import { SelectField } from "./fields/select-field";
import { ToggleField } from "./fields/toggle-field";
import { MediaPickerField } from "./fields/media-picker-field";

/**
 * Implements: Milestone 4 — Reusable Form Layout. Renders the correct
 * field component per FieldDefinition.type, generically, for ANY
 * ResourceDefinition — a future business package never writes its own
 * per-field JSX, it supplies a ResourceDefinition and gets a working form.
 */
export function FormLayout({
  definition,
  record,
  fieldErrors = {},
  entityId,
  entityType,
}: {
  definition: ResourceDefinition;
  record?: Record<string, unknown>;
  fieldErrors?: Record<string, string>;
  /** Passed through to bilingual fields for AI translation suggestions. */
  entityId?: string;
  entityType?: string;
}) {
  return (
    <div className="space-y-6">
      {definition.fields.map((field) => {
        switch (field.type) {
          case "bilingual-text":
          case "bilingual-textarea":
            return (
              <BilingualTextField
                key={field.name}
                name={field.name}
                label={field.label}
                required={field.required}
                multiline={field.type === "bilingual-textarea"}
                defaultValueAr={record?.[`${field.name}_ar`] as string | undefined}
                defaultValueEn={record?.[`${field.name}_en`] as string | undefined}
                errorAr={fieldErrors[`${field.name}_ar`]}
                errorEn={fieldErrors[`${field.name}_en`]}
                entityId={entityId}
                entityType={entityType}
              />
            );
          case "select":
            return (
              <SelectField
                key={field.name}
                name={field.name}
                label={field.label}
                required={field.required}
                options={field.options ?? []}
                defaultValue={record?.[field.name] as string | undefined}
                error={fieldErrors[field.name]}
              />
            );
          case "boolean":
            return (
              <ToggleField
                key={field.name}
                name={field.name}
                label={field.label}
                defaultChecked={Boolean(record?.[field.name])}
              />
            );
          case "media":
            return (
              <MediaPickerField
                key={field.name}
                name={field.name}
                label={field.label}
                defaultValue={record?.[field.name] as string | undefined}
              />
            );
          case "textarea":
            return (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                required={field.required}
                multiline
                defaultValue={record?.[field.name] as string | undefined}
                error={fieldErrors[field.name]}
              />
            );
          case "text":
          case "number":
          case "date":
          case "relation":
          default:
            return (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                required={field.required}
                defaultValue={record?.[field.name] as string | undefined}
                error={fieldErrors[field.name]}
              />
            );
        }
      })}
    </div>
  );
}
