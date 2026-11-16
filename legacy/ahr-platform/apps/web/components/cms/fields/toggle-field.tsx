/**
 * Implements: Milestone 4 — Field Components (Toggle). UI/UX
 * Specification, Design System §"Checkboxes / Radios / Toggles": "a toggle
 * always labels both its on and off meaning, not just a colored switch."
 */
export function ToggleField({
  name,
  label,
  onLabel = "On",
  offLabel = "Off",
  defaultChecked,
}: {
  name: string;
  label: string;
  onLabel?: string;
  offLabel?: string;
  defaultChecked?: boolean;
}) {
  return (
    <div>
      <span className="block text-sm">{label}</span>
      <label className="flex items-center gap-2">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        <span>{defaultChecked ? onLabel : offLabel}</span>
      </label>
    </div>
  );
}
