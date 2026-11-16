"use client";

import { useState } from "react";
import type { ResourceDefinition, EntityStatus } from "@ahr/cms-core";
import { getAllowedNextStatuses } from "@ahr/cms-core";
import { LoadingState } from "./states";
import { useToast } from "./toast";

/**
 * Implements: Milestone 4 — Generic Admin Table. Renders any resource's
 * records generically, driven entirely by its ResourceDefinition — no
 * column list is hardcoded per entity. Status/verification columns are
 * always rendered first when the resource has a lifecycle (UI/UX
 * Specification, Design System §"Tables": "status/verification badges
 * always leftmost").
 *
 * Fixed 2026-07-21: the whole row is now clickable (not just a small,
 * unstyled "Open" text button in the last column, which was easy to miss
 * — especially on entity types with many fields, where "Actions" could
 * sit far off to the right and need horizontal scrolling to even see).
 * The "Open →" button remains as a clear, styled affordance for anyone
 * who prefers a precise target over clicking the row itself.
 */
export interface AdminTableProps {
  definition: ResourceDefinition;
  rows: Array<Record<string, unknown>>;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSort?: (field: string) => void;
  currentSort?: { field: string; direction: "asc" | "desc" };
  onRowClick?: (row: Record<string, unknown>) => void;
  /** Dashboard UX Enhancement Backlog #7 — "Quick View panel." When
   * provided, clicking a row opens the Quick View panel instead of
   * navigating away; the "Open →" button still always navigates
   * (`onRowClick`), for anyone who wants the full edit screen directly. */
  onQuickView?: (row: Record<string, unknown>) => void;
  thumbnailsByRowId?: Record<string, string>;
  /**
   * Dashboard UX Enhancement Backlog #8 — "Inline Edit." Editing a
   * `select`-type field's value directly from the table, without opening
   * the full edit form. Provided by the page's Client Component, which
   * owns the actual PATCH request and the refresh afterward — this
   * component only renders the control and reports what changed.
   */
  onInlineFieldUpdate?: (id: string, fieldName: string, value: string) => Promise<void>;
  /**
   * Same idea for status — but only the statuses `status.ts`'s
   * `ALLOWED_TRANSITIONS` actually permits from the row's current status
   * are ever offered, so this can never present an invalid transition as
   * if it were a normal dropdown choice.
   */
  onInlineStatusChange?: (id: string, currentStatus: string, toStatus: string) => Promise<void>;
}

/**
 * Dashboard UX Enhancement Backlog #3 — "Visual row indicators (colored
 * status icon)." Each lifecycle status (status.ts's STATUS_VALUES) gets
 * its own color so an admin can scan a page of rows and tell
 * draft/review/verified/published/archived apart at a glance, instead of
 * reading identical gray-pill text for every status.
 */
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral/20 text-neutral-700",
  review: "bg-amber-100 text-amber-800",
  verified: "bg-sky-100 text-sky-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-neutral-200 text-neutral-500",
};

function StatusBadge({
  status,
  allowedNextStatuses,
  onChange,
  disabled,
}: {
  status: unknown;
  allowedNextStatuses?: readonly string[];
  onChange?: (toStatus: string) => void;
  disabled?: boolean;
}) {
  if (typeof status !== "string") return null;
  const colorClasses = STATUS_COLORS[status] ?? "bg-neutral/20 text-neutral-700";

  if (onChange && allowedNextStatuses) {
    return (
      <select
        aria-label="Change status"
        value={status}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value !== status) onChange(e.target.value);
        }}
        className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${colorClasses} disabled:opacity-50`}
      >
        <option value={status}>{status}</option>
        {allowedNextStatuses
          .filter((next) => next !== status)
          .map((next) => (
            <option key={next} value={next}>
              {next}
            </option>
          ))}
      </select>
    );
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses}`}>
      {status}
    </span>
  );
}

function InlineSelectCell({
  value,
  options,
  disabled,
  onChange,
}: {
  value: string;
  options: readonly string[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label="Edit value"
      value={value}
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value !== value) onChange(e.target.value);
      }}
      className="rounded-md border p-1 text-sm disabled:opacity-50"
    >
      {!options.includes(value) && value ? <option value={value}>{value}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function RowThumbnail({ url }: { url: string | undefined }) {
  if (!url) {
    return <div className="h-8 w-8 rounded bg-neutral/10" aria-hidden="true" />;
  }
  // Small, dynamic, signed-URL thumbnails in an admin table aren't a
  // next/image caching candidate (next.config.js's note on signed
  // Supabase URLs already documents the same tradeoff for this project).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-8 w-8 rounded object-cover" />;
}

export function AdminTable({
  definition,
  rows,
  loading,
  selectable,
  selectedIds = [],
  onSelectionChange,
  onSort,
  currentSort,
  onRowClick,
  onQuickView,
  thumbnailsByRowId,
  onInlineFieldUpdate,
  onInlineStatusChange,
}: AdminTableProps) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedIds);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const { show } = useToast();

  if (loading) return <LoadingState />;

  const toggleRow = (id: string) => {
    const next = localSelection.includes(id)
      ? localSelection.filter((existing) => existing !== id)
      : [...localSelection, id];
    setLocalSelection(next);
    onSelectionChange?.(next);
  };

  const handleInlineFieldChange = async (id: string, fieldName: string, value: string) => {
    const key = `${id}:${fieldName}`;
    setSavingKey(key);
    try {
      await onInlineFieldUpdate?.(id, fieldName, value);
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Could not save that change.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleInlineStatusChange = async (id: string, currentStatus: string, toStatus: string) => {
    const key = `${id}:status`;
    setSavingKey(key);
    try {
      await onInlineStatusChange?.(id, currentStatus, toStatus);
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Could not change status.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          {selectable ? <th className="p-2" /> : null}
          {thumbnailsByRowId ? <th className="p-2" /> : null}
          {definition.hasLifecycle ? <th className="p-2">Status</th> : null}
          {definition.fields
            .filter((field) => field.type !== "bilingual-textarea" && field.type !== "textarea")
            .map((field) => (
              <th key={field.name} className="p-2">
                <button
                  type="button"
                  onClick={() => onSort?.(field.name)}
                  className="font-semibold"
                >
                  {field.label}
                  {currentSort?.field === field.name
                    ? currentSort.direction === "asc"
                      ? " ▲"
                      : " ▼"
                    : null}
                </button>
              </th>
            ))}
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const id = String(row.id);
          return (
            <tr
              key={id}
              className={`border-t ${onQuickView || onRowClick ? "cursor-pointer hover:bg-neutral/10" : ""}`}
              onClick={() => (onQuickView ? onQuickView(row) : onRowClick?.(row))}
            >
              {selectable ? (
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={localSelection.includes(id)}
                    onChange={() => toggleRow(id)}
                    aria-label={`Select row ${id}`}
                  />
                </td>
              ) : null}
              {thumbnailsByRowId ? (
                <td className="p-2">
                  <RowThumbnail url={thumbnailsByRowId[id]} />
                </td>
              ) : null}
              {definition.hasLifecycle ? (
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge
                    status={row.status}
                    allowedNextStatuses={
                      onInlineStatusChange && typeof row.status === "string"
                        ? getAllowedNextStatuses(row.status as EntityStatus)
                        : undefined
                    }
                    disabled={savingKey === `${id}:status`}
                    onChange={
                      onInlineStatusChange
                        ? (toStatus) =>
                            handleInlineStatusChange(id, String(row.status), toStatus)
                        : undefined
                    }
                  />
                </td>
              ) : null}
              {definition.fields
                .filter((field) => field.type !== "bilingual-textarea" && field.type !== "textarea")
                .map((field) => (
                  <td
                    key={field.name}
                    className="p-2"
                    onClick={field.type === "select" && onInlineFieldUpdate ? (e) => e.stopPropagation() : undefined}
                  >
                    {field.type === "select" && onInlineFieldUpdate ? (
                      <InlineSelectCell
                        value={String(row[field.name] ?? "")}
                        options={field.options ?? []}
                        disabled={savingKey === `${id}:${field.name}`}
                        onChange={(value) => handleInlineFieldChange(id, field.name, value)}
                      />
                    ) : field.type === "bilingual-text" ? (
                      String(row[`${field.name}_en`] ?? row[`${field.name}_ar`] ?? "")
                    ) : (
                      String(row[field.name] ?? "")
                    )}
                  </td>
                ))}
              <td className="p-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onRowClick?.(row)}
                  className="rounded-md border border-primary px-2 py-1 text-xs text-primary hover:bg-primary hover:text-white"
                >
                  Open →
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
