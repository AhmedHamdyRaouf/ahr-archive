/**
 * Implements: Milestone 4 — Field Components (Text). Generic, entity-agnostic
 * form field — UI/UX Specification, Design System §"Inputs": "label above
 * (never placeholder-as-label), helper text slot, error text slot."
 */
export function TextField({
  name,
  label,
  defaultValue,
  required,
  error,
  multiline,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm">
        {label}
        {required ? " *" : ""}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          className="w-full rounded-md border p-2"
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          defaultValue={defaultValue}
          required={required}
          className="w-full rounded-md border p-2"
        />
      )}
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
