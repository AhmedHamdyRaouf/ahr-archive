/**
 * Implements: Milestone 4 — Action Bar. Generic container for primary
 * page-level actions (e.g. "Create", "Publish") — takes a list of actions,
 * has no entity-specific knowledge of what those actions do.
 */
export interface ActionBarItem {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
}

export function ActionBar({ items }: { items: ActionBarItem[] }) {
  return (
    <div className="flex items-center gap-2 border-b p-4">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          disabled={item.disabled}
          className={
            item.variant === "destructive"
              ? "rounded-md bg-danger p-2 text-white disabled:opacity-50"
              : item.variant === "secondary"
                ? "rounded-md border p-2 disabled:opacity-50"
                : "rounded-md bg-primary p-2 text-white disabled:opacity-50"
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
