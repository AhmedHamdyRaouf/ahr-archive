import { notFound } from "next/navigation";
import { genericList } from "@ahr/cms-core";
import { isEntityType, getDefinition, type EntityType } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { getThumbnailUrlsForOwners, ENTITY_TYPE_TO_THUMBNAIL_OWNER } from "@/lib/entity-thumbnails";
import { CmsListClient } from "./list-client";

/**
 * Implements: API Specification 03 - CMS API "List Entities"; UI/UX
 * Specification, CMS UI (doc 07) — Entity List screen. Server Component:
 * calls `genericList` directly (API Integration Rules, doc 08 — "prefer
 * calling the underlying function directly rather than an HTTP round-trip
 * for server-rendered pages"), then hands the result to a thin Client
 * Component for interactive filtering/pagination/navigation.
 */
export default async function EntityListPage({
  params,
  searchParams,
}: {
  params: { locale: string; entityType: string };
  searchParams: {
    page?: string;
    status?: string;
    q?: string;
    sort?: string;
    direction?: string;
    [key: string]: string | undefined;
  };
}) {
  if (!isEntityType(params.entityType)) {
    notFound();
  }

  const entityType = params.entityType as EntityType;
  const definition = getDefinition(entityType);
  const supabase = createRouteHandlerSupabaseClient();

  const page = Number(searchParams.page ?? "1");

  // Dashboard UX Enhancement Backlog #2 — "Activate Sort." @ahr/cms-core's
  // applyListQuery (query.ts) has supported params.sort since Milestone 4;
  // nothing server-side ever read a `sort`/`direction` query param and
  // passed it through until now. Only accept a `sort` field that's
  // actually a real column on this resource (or "status" for
  // lifecycle-bearing entities) — an arbitrary client-supplied field name
  // must never reach a raw Supabase `.order()` call unchecked.
  const sortableFields = new Set(definition.fields.map((f) => f.name));
  if (definition.hasLifecycle) sortableFields.add("status");
  const sortField =
    searchParams.sort && sortableFields.has(searchParams.sort) ? searchParams.sort : undefined;

  // Dashboard UX Enhancement Backlog #4 — "Field-based filtering." Any
  // `select` field on this resource (Work's work_type, Contribution's
  // role, etc.) becomes a `?field_<name>=value` query param, using the
  // URL param prefix `field_` so it can never collide with `page`,
  // `status`, `q`, `sort`, or `direction`. Same allow-list discipline as
  // the sort field above — only a field that's actually a `select` field
  // on THIS resource, with a value that's actually one of ITS declared
  // options, is ever passed through to a raw `.eq()` filter.
  const selectFields = definition.fields.filter((f) => f.type === "select");
  const fieldFilters: Record<string, string> = {};
  for (const field of selectFields) {
    const value = searchParams[`field_${field.name}`];
    if (value && field.options?.includes(value)) {
      fieldFilters[field.name] = value;
    }
  }

  const result = await genericList(
    definition,
    { supabase: supabase as never, actorId: "" },
    {
      pagination: { page, pageSize: 20 },
      filters: {
        ...(searchParams.status ? { status: searchParams.status } : undefined),
        ...fieldFilters,
      },
      search: searchParams.q,
      searchFields: definition.fields
        .filter((f) => f.type === "bilingual-text")
        .flatMap((f) => [`${f.name}_ar`, `${f.name}_en`]),
      sort: sortField
        ? { field: sortField, direction: searchParams.direction === "desc" ? "desc" : "asc" }
        : undefined,
    },
  );

  // Dashboard UX Enhancement Backlog #3 — "Visual row indicators." Only
  // Person/Work/Project/Event have any media relation to look up at all
  // (media-relations.ts); other entity types simply get an empty map and
  // AdminTable's thumbnail column doesn't render for them.
  const thumbnailOwnerType = ENTITY_TYPE_TO_THUMBNAIL_OWNER[entityType];
  const thumbnailsByRowId = thumbnailOwnerType
    ? await getThumbnailUrlsForOwners(
        supabase,
        thumbnailOwnerType,
        result.data.map((row) => String((row as Record<string, unknown>).id)),
      )
    : {};

  return (
    <div>
      <Breadcrumbs locale={params.locale} segments={[{ label: definition.labelPlural }]} />
      <CmsListClient
        locale={params.locale}
        entityType={entityType}
        definition={definition}
        rows={result.data}
        meta={result.meta}
        thumbnailsByRowId={thumbnailsByRowId}
        currentSort={sortField ? { field: sortField, direction: searchParams.direction === "desc" ? "desc" : "asc" } : undefined}
        currentStatus={searchParams.status}
        currentFieldFilters={fieldFilters}
      />
    </div>
  );
}
