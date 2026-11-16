"use client";

import { useState } from "react";
import type { ResourceDefinition, PaginationMeta } from "@ahr/cms-core";
import { AdminTable } from "./admin-table";
import { ActionBar, type ActionBarItem } from "./action-bar";
import { BulkActionsBar, type BulkAction } from "./bulk-actions-bar";
import { EmptyState, ErrorState } from "./states";

// Mirrors packages/cms-core/src/status.ts's STATUS_VALUES — this
// component has no dependency on that module (kept entity-agnostic per
// this file's own header comment), so the lifecycle status list is
// duplicated here as plain strings rather than importing @ahr/cms-core
// internals just for a filter dropdown's option list.
const STATUS_FILTER_VALUES = ["draft", "review", "verified", "published", "archived"];

/**
 * Implements: Milestone 4 — Generic List View. Composes the pieces above
 * into the standard admin list screen shape (Filter bar + Table +
 * Pagination — UI/UX Specification, CMS UI doc 07 §9). Data fetching is
 * NOT this component's job — a future business package's page component
 * calls `@ahr/cms-core`'s `genericList` and passes the result down here.
 *
 * Dashboard UX Enhancement Backlog #4 — "Field-based filtering": in
 * addition to free-text search, this now renders one dropdown per
 * `select`-type field the resource declares (Work Type, Contribution
 * Role, etc.), plus a status dropdown for lifecycle-bearing resources —
 * still entity-agnostic, since the options come from `definition.fields`
 * itself, not any hardcoded list.
 */
export function ListView({
  definition,
  rows,
  meta,
  loading,
  error,
  onRetry,
  createLabel,
  onCreate,
  onSort,
  currentSort,
  onSearch,
  onPageChange,
  onRowClick,
  bulkActions = [],
  thumbnailsByRowId,
  currentStatus,
  currentFieldFilters,
  onStatusFilterChange,
  onFieldFilterChange,
  onQuickView,
  onInlineFieldUpdate,
  onInlineStatusChange,
  onExport,
}: {
  definition: ResourceDefinition;
  rows: Array<Record<string, unknown>>;
  meta?: PaginationMeta;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  createLabel?: string;
  onCreate?: () => void;
  onSort?: (field: string) => void;
  currentSort?: { field: string; direction: "asc" | "desc" };
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  bulkActions?: BulkAction[];
  thumbnailsByRowId?: Record<string, string>;
  currentStatus?: string;
  currentFieldFilters?: Record<string, string>;
  onStatusFilterChange?: (status: string) => void;
  onFieldFilterChange?: (fieldName: string, value: string) => void;
  onQuickView?: (row: Record<string, unknown>) => void;
  onInlineFieldUpdate?: (id: string, fieldName: string, value: string) => Promise<void>;
  onInlineStatusChange?: (id: string, currentStatus: string, toStatus: string) => Promise<void>;
  onExport?: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const selectFilterFields = definition.fields.filter((field) => field.type === "select");

  const actionBarItems: ActionBarItem[] = [
    ...(onCreate
      ? [{ label: createLabel ?? `New ${definition.label}`, onClick: onCreate, variant: "primary" as const }]
      : []),
    ...(onExport
      ? [{ label: "Export CSV", onClick: onExport, variant: "secondary" as const }]
      : []),
  ];

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div>
      <ActionBar items={actionBarItems} />

      <div className="flex flex-wrap items-center gap-2 border-b p-4">
        <input
          type="search"
          placeholder={`Search ${definition.labelPlural}…`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch?.(searchInput);
          }}
          className="rounded-md border p-2"
        />

        {onStatusFilterChange ? (
          <select
            aria-label="Filter by status"
            value={currentStatus ?? ""}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_FILTER_VALUES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : null}

        {selectFilterFields.map((field) => (
          <select
            key={field.name}
            aria-label={`Filter by ${field.label}`}
            value={currentFieldFilters?.[field.name] ?? ""}
            onChange={(e) => onFieldFilterChange?.(field.name, e.target.value)}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">All {field.label}</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ))}
      </div>

      <BulkActionsBar
        selectedIds={selectedIds}
        actions={bulkActions}
        onClearSelection={() => setSelectedIds([])}
      />

      {!loading && rows.length === 0 ? (
        <EmptyState
          label={`No ${definition.labelPlural.toLowerCase()} yet.`}
          action={
            onCreate
              ? { label: createLabel ?? `Create ${definition.label}`, onClick: onCreate }
              : undefined
          }
        />
      ) : (
        <AdminTable
          definition={definition}
          rows={rows}
          loading={loading}
          selectable={bulkActions.length > 0}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSort={onSort}
          currentSort={currentSort}
          onRowClick={onRowClick}
          onQuickView={onQuickView}
          thumbnailsByRowId={thumbnailsByRowId}
          onInlineFieldUpdate={onInlineFieldUpdate}
          onInlineStatusChange={onInlineStatusChange}
        />
      )}

      {meta ? (
        <div className="flex items-center justify-between p-4 text-sm">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.totalItems} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => onPageChange?.(meta.page - 1)}
              className="rounded-md border p-2 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange?.(meta.page + 1)}
              className="rounded-md border p-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
