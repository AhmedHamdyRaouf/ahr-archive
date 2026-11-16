/**
 * Implements: Milestone 4 — Generic Detail View. Read-oriented display of
 * a single record, driven by its ResourceDefinition — no entity-specific
 * layout. A future business package's page composes this with FormLayout
 * (for editing) rather than this component owning both concerns.
 */
import type { ResourceDefinition } from "@ahr/cms-core";

export function DetailView({
  definition,
  record,
}: {
  definition: ResourceDefinition;
  record: Record<string, unknown>;
}) {
  return (
    <dl className="space-y-4">
      {definition.hasLifecycle ? (
        <div>
          <dt className="text-sm text-neutral">Status</dt>
          <dd>{String(record.status ?? "")}</dd>
        </div>
      ) : null}

      {definition.fields.map((field) => {
        if (field.type === "bilingual-text" || field.type === "bilingual-textarea") {
          return (
            <div key={field.name}>
              <dt className="text-sm text-neutral">{field.label}</dt>
              <dd className="grid grid-cols-2 gap-4">
                <span dir="rtl">{String(record[`${field.name}_ar`] ?? "")}</span>
                <span dir="ltr">{String(record[`${field.name}_en`] ?? "")}</span>
              </dd>
            </div>
          );
        }
        return (
          <div key={field.name}>
            <dt className="text-sm text-neutral">{field.label}</dt>
            <dd>{String(record[field.name] ?? "")}</dd>
          </div>
        );
      })}
    </dl>
  );
}
