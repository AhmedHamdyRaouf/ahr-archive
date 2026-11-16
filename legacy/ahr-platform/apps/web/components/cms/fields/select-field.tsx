/**
 * Implements: Milestone 4 — Field Components (Select). UI/UX
 * Specification, Design System §"Selects": "the Select only ever offers
 * the values the database itself allows — no free text where the schema
 * constrains it." `options` always comes from the ResourceDefinition's
 * `FieldDefinition.options` (mirroring a `check` constraint) — never
 * invented client-side.
 */
export function SelectField({
  name,
  label,
  options,
  defaultValue,
  required,
  error,
}: {
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border p-2"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
