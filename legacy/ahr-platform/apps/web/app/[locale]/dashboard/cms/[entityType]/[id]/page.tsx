import { notFound } from "next/navigation";
import { isEntityType, getDefinition, type EntityType } from "@ahr/content";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { EntityEditClient } from "./edit-client";

/**
 * Implements: API Specification 03 - CMS API "Get Entity"; UI/UX
 * Specification, CMS UI (doc 07) — Entity Create/Edit form + status
 * transition controls. Server Component fetches the record directly
 * (API Integration Rules, doc 08); the Client Component handles editing,
 * transitions, and delete/restore actions via the Route Handlers.
 */
export default async function EntityDetailPage({
  params,
}: {
  params: { locale: string; entityType: string; id: string };
}) {
  if (!isEntityType(params.entityType)) {
    notFound();
  }

  const entityType = params.entityType as EntityType;
  const definition = getDefinition(entityType);
  const supabase = createRouteHandlerSupabaseClient();

  const { data: record } = await supabase
    .from(definition.tableName)
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!record) {
    notFound();
  }

  return (
    <div>
      <Breadcrumbs
        locale={params.locale}
        segments={[
          { label: definition.labelPlural, href: `/${params.locale}/dashboard/cms/${entityType}` },
          { label: String(record.title_en ?? record.name_en ?? record.id) },
        ]}
      />
      <EntityEditClient
        locale={params.locale}
        entityType={entityType}
        definition={definition}
        record={record}
      />
    </div>
  );
}
