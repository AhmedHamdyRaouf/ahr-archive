"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDefinition, isEntityType } from "@ahr/content";
import { FormLayout, ActionBar, useToast } from "@/components/cms";

/**
 * Implements: API Specification 03 - CMS API "Create Entity"; UI/UX
 * Specification, CMS UI (doc 07) — Entity Create/Edit form. Submits to the
 * generic `/api/cms/{entityType}` Route Handler — this page has no
 * entity-specific submit logic of its own.
 */
export default function EntityCreatePage({
  params,
}: {
  params: { locale: string; entityType: string };
}) {
  const router = useRouter();
  const toast = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isEntityType(params.entityType)) {
    return <p>Unknown entity type.</p>;
  }
  const definition = getDefinition(params.entityType);

  async function handleSubmit(formData: FormData) {
    const body = Object.fromEntries(formData.entries());
    const response = await fetch(`/api/cms/${params.entityType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();

    if (json.error) {
      const errors: Record<string, string> = {};
      for (const fieldError of json.error.details?.fieldErrors ?? []) {
        errors[fieldError.field] = fieldError.message;
      }
      setFieldErrors(errors);
      toast.show("error", json.error.message ?? "Something went wrong.");
      return;
    }

    toast.show("success", `${definition.label} created.`);
    router.push(`/${params.locale}/dashboard/cms/${params.entityType}/${json.data.id}`);
  }

  return (
    <div>
      <ActionBar
        items={[{ label: "Cancel", onClick: () => router.back(), variant: "secondary" }]}
      />
      <form action={handleSubmit} className="space-y-6 p-4">
        <h1 className="text-xl font-semibold">New {definition.label}</h1>
        <FormLayout definition={definition} fieldErrors={fieldErrors} />
        <button type="submit" className="rounded-md bg-primary p-2 text-white">
          Save as Draft
        </button>
      </form>
    </div>
  );
}
