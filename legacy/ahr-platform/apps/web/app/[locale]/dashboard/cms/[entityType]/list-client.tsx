"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ResourceDefinition, PaginationMeta } from "@ahr/cms-core";
import type { BulkAction } from "@/components/cms";
import { ListView, QuickViewPanel, SavedViewsBar } from "@/components/cms";

/**
 * Implements: Dashboard UX Enhancement Backlog #1 — "Wire up Bulk Actions
 * for real." Calls the new /api/cms/[entityType]/bulk endpoint with each
 * selected row's id + its own current status (a bulk selection can contain
 * rows in different statuses, e.g. some draft and some published — the
 * server transitions each independently and reports per-row success).
 */
export function CmsListClient({
  locale,
  entityType,
  definition,
  rows,
  meta,
  currentSort,
  thumbnailsByRowId,
  currentStatus,
  currentFieldFilters,
}: {
  locale: string;
  entityType: string;
  definition: ResourceDefinition;
  rows: Array<Record<string, unknown>>;
  meta: PaginationMeta;
  currentSort?: { field: string; direction: "asc" | "desc" };
  thumbnailsByRowId?: Record<string, string>;
  currentStatus?: string;
  currentFieldFilters?: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = `/${locale}/dashboard/cms/${entityType}`;
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [quickViewRow, setQuickViewRow] = useState<Record<string, unknown> | null>(null);

  // Dashboard UX Enhancement Backlog #7 — "Quick View panel." Escape
  // closes the panel, matching the standard dialog/drawer convention.
  useEffect(() => {
    if (!quickViewRow) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickViewRow(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickViewRow]);

  // Dashboard UX Enhancement Backlog #11 — "Keyboard shortcuts." `n` for
  // a new record, `/` to jump to the search box — both ignored while the
  // admin is already typing in any field, so they never hijack normal
  // text entry (e.g. typing a title that happens to contain "n").
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (isTyping) return;

      if (e.key === "n") {
        e.preventDefault();
        router.push(`${basePath}/new`);
      } else if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, basePath]);

  /**
   * Dashboard UX Enhancement Backlog #4 — "Field-based filtering." Shared
   * navigation helper so filter changes, search, and sort all preserve
   * each other's query params instead of clobbering them (search used to
   * discard the page/status/sort params entirely — this fixes that too).
   * Filter/search changes reset to page 1, since the previous page number
   * may no longer exist under the new filter.
   */
  const pushWithParams = (
    updates: Record<string, string | undefined>,
    options: { resetPage?: boolean } = {},
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }
    if (options.resetPage) nextParams.delete("page");
    const query = nextParams.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  // Dashboard UX Enhancement Backlog #2 — "Activate Sort." Clicking the
  // same column again flips direction (asc → desc → asc...); clicking a
  // different column starts it at asc, matching the common admin-table
  // convention (and avoiding a "which way is it sorted" surprise).
  const handleSort = (field: string) => {
    const nextDirection: "asc" | "desc" =
      currentSort?.field === field && currentSort.direction === "asc" ? "desc" : "asc";
    pushWithParams({ sort: field, direction: nextDirection });
  };

  const handleStatusFilterChange = (status: string) => {
    pushWithParams({ status: status || undefined }, { resetPage: true });
  };

  const handleFieldFilterChange = (fieldName: string, value: string) => {
    pushWithParams({ [`field_${fieldName}`]: value || undefined }, { resetPage: true });
  };

  /**
   * Dashboard UX Enhancement Backlog #8 — "Inline Edit." Reuses the same
   * PATCH /api/cms/[entityType]/[id] endpoint the full edit form already
   * calls — no new backend for a plain field update.
   */
  const handleInlineFieldUpdate = async (id: string, fieldName: string, value: string) => {
    const response = await fetch(`/api/cms/${entityType}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [fieldName]: value }),
    });
    const body = await response.json();
    if (!response.ok || body.error) {
      throw new Error(body.error?.message ?? "Could not save that change.");
    }
    router.refresh();
  };

  /**
   * Status changes go through the transition endpoint, not PATCH — same
   * business-rule-checked path (contribution-required-before-publish,
   * allowed-transition sequence) the full edit screen's status controls
   * already use.
   */
  const handleInlineStatusChange = async (id: string, currentStatus: string, toStatus: string) => {
    const response = await fetch(`/api/cms/${entityType}/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentStatus, toStatus }),
    });
    const body = await response.json();
    if (!response.ok || body.error) {
      throw new Error(body.error?.message ?? "Could not change status.");
    }
    router.refresh();
  };

  const runBulkTransition = async (selectedIds: string[], toStatus: string) => {
    setBulkError(null);
    const items = selectedIds
      .map((id) => rows.find((row) => String(row.id) === id))
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({ id: String(row.id), currentStatus: String(row.status) }));

    try {
      const response = await fetch(`/api/cms/${entityType}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, toStatus }),
      });
      const body = await response.json();
      if (!response.ok) {
        setBulkError(body?.error?.message ?? "Bulk action failed.");
        return;
      }
      const failed = (body.data as Array<{ id: string; ok: boolean; error?: string }>).filter(
        (r) => !r.ok,
      );
      if (failed.length > 0) {
        setBulkError(
          `${failed.length} of ${items.length} item(s) could not be updated: ` +
            failed.map((f) => f.error).join("; "),
        );
      }
    } finally {
      router.refresh();
    }
  };

  // Bulk actions only make sense for entities that actually have a status
  // lifecycle (Data Lifecycle, Phase 4) — non-lifecycle entities have no
  // "publish"/"archive" transition to run in bulk at all.
  const bulkActions: BulkAction[] = definition.hasLifecycle
    ? [
        { label: "Publish", onClick: (ids) => runBulkTransition(ids, "published") },
        { label: "Archive", onClick: (ids) => runBulkTransition(ids, "archived") },
      ]
    : [];

  return (
    <div>
      {bulkError ? (
        <div className="border-b bg-red-50 p-3 text-sm text-red-800" role="alert">
          {bulkError}
        </div>
      ) : null}
      <SavedViewsBar
        entityType={entityType}
        currentQuery={searchParams.toString()}
        onApply={(query) => router.push(query ? `${basePath}?${query}` : basePath)}
      />
      <ListView
        definition={definition}
        rows={rows}
        meta={meta}
        bulkActions={bulkActions}
        currentSort={currentSort}
        onSort={handleSort}
        thumbnailsByRowId={thumbnailsByRowId}
        currentStatus={currentStatus}
        currentFieldFilters={currentFieldFilters}
        onStatusFilterChange={definition.hasLifecycle ? handleStatusFilterChange : undefined}
        onFieldFilterChange={handleFieldFilterChange}
        onCreate={() => router.push(`${basePath}/new`)}
        onSearch={(q) => pushWithParams({ q: q || undefined }, { resetPage: true })}
        onPageChange={(page) => pushWithParams({ page: String(page) })}
        onRowClick={(row) => router.push(`${basePath}/${row.id}`)}
        onQuickView={(row) => setQuickViewRow(row)}
        onInlineFieldUpdate={handleInlineFieldUpdate}
        onInlineStatusChange={handleInlineStatusChange}
        onExport={() => {
          const query = searchParams.toString();
          window.location.href = `/api/cms/${entityType}/export${query ? `?${query}` : ""}`;
        }}
      />
      {quickViewRow ? (
        <QuickViewPanel
          definition={definition}
          record={quickViewRow}
          onClose={() => setQuickViewRow(null)}
          onEditFull={() => router.push(`${basePath}/${quickViewRow.id}`)}
        />
      ) : null}
    </div>
  );
}
