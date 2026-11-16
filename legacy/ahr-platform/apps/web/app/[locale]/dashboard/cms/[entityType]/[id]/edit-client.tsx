"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAllowedNextStatuses, type ResourceDefinition, type EntityStatus } from "@ahr/cms-core";
import {
  FormLayout,
  ActionBar,
  ConfirmDialog,
  ForceDeleteDialog,
  useToast,
  type ActionBarItem,
} from "@/components/cms";
import { AISuggestionPanel } from "@/components/ai/ai-suggestion-panel";
import { SimilarWorksPanel } from "@/components/ai/similar-works-panel";
import { TaxonomyPanel } from "@/components/relationships/taxonomy-panel";
import { PlatformLinksPanel } from "@/components/relationships/platform-links-panel";

/**
 * Implements: API Specification 03 - CMS API "Update Entity"/"Transition
 * Status"; UI/UX Specification, CMS UI (doc 07) §9/§14 — status controls
 * always visible, destructive actions behind a confirmation Dialog.
 */
export function EntityEditClient({
  locale,
  entityType,
  definition,
  record,
}: {
  locale: string;
  entityType: string;
  definition: ResourceDefinition;
  record: Record<string, unknown>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmTarget, setConfirmTarget] = useState<EntityStatus | "restore" | null>(null);
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);

  const basePath = `/${locale}/dashboard/cms/${entityType}`;
  const currentStatus = (record.status as EntityStatus) ?? "draft";
  const allowedNext = definition.hasLifecycle ? getAllowedNextStatuses(currentStatus) : [];

  // The text an Administrator must type to confirm permanent deletion —
  // whatever this entity's own most human-readable identifier is.
  const recordLabel = String(
    record.title_en ??
      record.title_ar ??
      record.name_en ??
      record.name_ar ??
      record.public_id ??
      record.id,
  );

  async function performForceDelete() {
    const response = await fetch(`/api/cms/${entityType}/${record.id}/force-delete`, {
      method: "POST",
    });
    if (!response.ok && response.status !== 204) {
      const json = await response.json();
      toast.show("error", json.error?.message ?? "Permanent delete failed.");
      return;
    }
    toast.show("success", `${definition.label} permanently deleted.`);
    router.push(basePath);
    router.refresh();
  }

  // AI Integration (14-AI-Integration.md §1) is scoped to Work/Project
  // only — every other entity type simply doesn't render these panels.
  const isAiSupported = entityType === "works" || entityType === "projects";
  const aiEntityType = entityType === "works" ? "work" : "project";

  // Phase 2 AI backlog item 2 — journalism article summarization.
  // press_mention has no article-body/summary field to write into (only
  // title/publication_name/url/published_date), so this doesn't reuse the
  // "accept writes into a field" contract above — the pasted text is
  // ephemeral (never saved), and Accept copies the draft summary to the
  // clipboard for the Administrator to use wherever they see fit.
  const isArticleSummarySupported = entityType === "press-mentions";

  function acceptSummarySuggestion(content: { summaryAr: string; summaryEn: string }) {
    // Uncontrolled form (FormData-based, see handleSave) — Accept writes
    // straight into the live DOM inputs BilingualTextField already
    // rendered (ids "description_ar"/"description_en"), so the value is
    // picked up by the normal Save submit exactly like a manual edit
    // would be. No separate confirmation step, per Wireframes/AI.md.
    const arInput = document.getElementById("description_ar") as HTMLTextAreaElement | null;
    const enInput = document.getElementById("description_en") as HTMLTextAreaElement | null;
    if (arInput) arInput.value = content.summaryAr;
    if (enInput) enInput.value = content.summaryEn;
  }

  function resolveArticleSummaryContext(): { articleText: string } | null {
    const el = document.getElementById("ai-article-text") as HTMLTextAreaElement | null;
    const articleText = el?.value.trim() ?? "";
    return articleText.length > 0 ? { articleText } : null;
  }

  async function acceptArticleSummary(content: { summaryAr: string; summaryEn: string }) {
    const text = `${content.summaryAr}\n\n${content.summaryEn}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.show("success", "Summary copied to clipboard.");
    } catch {
      toast.show("error", "Couldn't copy to clipboard — select and copy the text shown above manually.");
    }
  }

  // Phase 2 AI backlog item 3 — Contribution role suggestion. `contribution`
  // rows only hold foreign key ids (person_id, work_id/project_id/event_id),
  // never a display name, so the Administrator's current selections are
  // resolved to a name/title via the existing GET /api/cms/{entityType}/{id}
  // at the moment a suggestion is requested — nothing new is fetched or
  // stored ahead of time.
  const isContributionRoleSupported = entityType === "contributions";
  const roleField = definition.fields.find((field) => field.name === "role");

  async function resolveContributionRoleContext(): Promise<{
    personName: string;
    subjectLabel: string;
    subjectType: "work" | "project" | "event";
    roleDetail?: string;
    availableRoles: string[];
  } | null> {
    const personId = (document.getElementById("person_id") as HTMLInputElement | null)?.value.trim();
    const workId = (document.getElementById("work_id") as HTMLInputElement | null)?.value.trim();
    const projectId = (
      document.getElementById("project_id") as HTMLInputElement | null
    )?.value.trim();
    const eventId = (document.getElementById("event_id") as HTMLInputElement | null)?.value.trim();
    const roleDetailAr = (
      document.getElementById("role_detail_ar") as HTMLInputElement | null
    )?.value.trim();
    const roleDetailEn = (
      document.getElementById("role_detail_en") as HTMLInputElement | null
    )?.value.trim();

    if (!personId || !roleField?.options) return null;
    const subjectType: "work" | "project" | "event" | null = workId
      ? "work"
      : projectId
        ? "project"
        : eventId
          ? "event"
          : null;
    if (!subjectType) return null;
    const subjectId = workId || projectId || eventId;
    const subjectApiEntityType =
      subjectType === "work" ? "works" : subjectType === "project" ? "projects" : "events";

    const [personRes, subjectRes] = await Promise.all([
      fetch(`/api/cms/persons/${personId}`),
      fetch(`/api/cms/${subjectApiEntityType}/${subjectId}`),
    ]);
    const personBody = await personRes.json();
    const subjectBody = await subjectRes.json();
    if (personBody.error || subjectBody.error) return null;

    const personName = String(personBody.data?.name_en ?? personBody.data?.name_ar ?? "");
    const subjectLabel = String(subjectBody.data?.title_en ?? subjectBody.data?.title_ar ?? "");
    if (!personName || !subjectLabel) return null;

    const roleDetail = [roleDetailAr, roleDetailEn].filter(Boolean).join(" / ") || undefined;

    return {
      personName,
      subjectLabel,
      subjectType,
      roleDetail,
      availableRoles: roleField.options as string[],
    };
  }

  function acceptContributionRole(content: { role: string }) {
    const select = document.getElementById("role") as HTMLSelectElement | null;
    if (select) select.value = content.role;
  }

  // Phase 2 AI backlog item 4 — Similar/duplicate Work detection,
  // Work-only (admin-only, lowest-risk first use of embeddings).
  const isSimilarWorksSupported = entityType === "works";

  // data owner request 2026-07-25 — external platform links, the four
  // entity types entity_external_link actually has an owner column for.
  const isPlatformLinksSupported =
    entityType === "persons" ||
    entityType === "organizations" ||
    entityType === "projects" ||
    entityType === "works";

  async function handleSave(formData: FormData) {
    const rawBody = Object.fromEntries(formData.entries());
    // Fixed 2026-07-21: an empty optional field (e.g. "Parent Work" —
    // work.parent_work_id, a nullable uuid column) was being sent as the
    // literal string "" instead of being omitted/null. Postgres correctly
    // rejects "" for a uuid column ("invalid input syntax for type uuid"),
    // which surfaced as an opaque 500 on every Save that touched such a
    // field, even when the person never meant to set it. Empty strings
    // now become `null` for every field before the request is sent.
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rawBody)) {
      body[key] = value === "" ? null : value;
    }
    const response = await fetch(`/api/cms/${entityType}/${record.id}`, {
      method: "PATCH",
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

    toast.show("success", `${definition.label} saved.`);
    router.refresh();
  }

  async function performTransition(toStatus: EntityStatus) {
    const response = await fetch(`/api/cms/${entityType}/${record.id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentStatus, toStatus }),
    });
    const json = await response.json();

    if (json.error) {
      toast.show("error", json.error.message ?? "Transition failed.");
      return;
    }
    toast.show("success", `Status changed to ${toStatus}.`);
    router.refresh();
  }

  async function performRestore() {
    const response = await fetch(`/api/cms/${entityType}/${record.id}/restore`, { method: "POST" });
    const json = await response.json();

    if (json.error) {
      toast.show("error", json.error.message ?? "Restore failed.");
      return;
    }
    toast.show("success", "Restored.");
    router.refresh();
  }

  const actionItems: ActionBarItem[] = [
    { label: "Back", onClick: () => router.push(basePath), variant: "secondary" },
    ...allowedNext.map((next) => ({
      label: next === "archived" ? "Archive" : `Move to ${next}`,
      onClick: () => setConfirmTarget(next),
      variant: (next === "archived" ? "destructive" : "primary") as ActionBarItem["variant"],
    })),
    ...(currentStatus === "archived"
      ? [
          {
            label: "Restore",
            onClick: () => setConfirmTarget("restore"),
            variant: "primary" as const,
          },
        ]
      : []),
  ];

  return (
    <div>
      <ActionBar items={actionItems} />

      <form action={handleSave} className="space-y-6 p-4">
        <h1 className="text-xl font-semibold">
          {definition.label} — <span className="text-sm text-neutral">{currentStatus}</span>
        </h1>
        <FormLayout
          definition={definition}
          record={record}
          fieldErrors={fieldErrors}
          entityId={String(record.id)}
          entityType={entityType}
        />

        {isAiSupported ? (
          <AISuggestionPanel
            kind="summary-suggestion"
            fieldLabel="Description"
            entityId={String(record.id)}
            context={{
              entityType: aiEntityType,
              titleAr: String(record.title_ar ?? ""),
              titleEn: String(record.title_en ?? ""),
              descriptionAr: record.description_ar ? String(record.description_ar) : undefined,
              descriptionEn: record.description_en ? String(record.description_en) : undefined,
              availableCategories: [],
            }}
            onAccept={(content) => {
              if ("summaryAr" in content) acceptSummarySuggestion(content);
            }}
          />
        ) : null}

        {isArticleSummarySupported ? (
          <div className="space-y-2 rounded-md border p-4">
            <label htmlFor="ai-article-text" className="block text-sm font-medium">
              Paste article text for an AI summary (not saved)
            </label>
            <textarea
              id="ai-article-text"
              rows={6}
              className="w-full rounded-md border p-2 text-sm"
              placeholder="Paste the full article text here…"
            />
            <AISuggestionPanel
              kind="article-summary-suggestion"
              fieldLabel="Article summary"
              entityId={String(record.id)}
              logEntityType="press-mentions"
              resolveContext={resolveArticleSummaryContext}
              onAccept={acceptArticleSummary}
            />
          </div>
        ) : null}

        {isContributionRoleSupported ? (
          <AISuggestionPanel
            kind="contribution-role-suggestion"
            fieldLabel="Role"
            entityId={String(record.id)}
            logEntityType="contributions"
            resolveContext={resolveContributionRoleContext}
            onAccept={acceptContributionRole}
          />
        ) : null}

        <button type="submit" className="rounded-md bg-primary p-2 text-white">
          Save
        </button>
      </form>

      {isAiSupported ? (
        <div className="p-4">
          <TaxonomyPanel
            taxonomyEntityType={entityType as "works" | "projects"}
            entityId={String(record.id)}
            domain={aiEntityType === "work" ? "work_type" : "project_type"}
            titleAr={String(record.title_ar ?? "")}
            titleEn={String(record.title_en ?? "")}
            descriptionAr={record.description_ar ? String(record.description_ar) : undefined}
            descriptionEn={record.description_en ? String(record.description_en) : undefined}
          />
        </div>
      ) : null}

      {isSimilarWorksSupported ? (
        <div className="p-4">
          <SimilarWorksPanel locale={locale} workId={String(record.id)} />
        </div>
      ) : null}

      {isPlatformLinksSupported ? (
        <div className="p-4">
          <PlatformLinksPanel
            entityType={entityType as "persons" | "organizations" | "projects" | "works"}
            entityId={String(record.id)}
          />
        </div>
      ) : null}

      <div className="m-4 rounded-md border border-danger/40 p-4">
        <h2 className="text-sm font-semibold text-danger">Danger Zone</h2>
        <p className="mt-1 text-xs text-neutral">
          Permanently deletes this {definition.label.toLowerCase()} — unlike Archive, this cannot
          be undone from the dashboard.
        </p>
        <button
          type="button"
          onClick={() => setForceDeleteOpen(true)}
          className="mt-3 rounded-md border border-danger px-3 py-1.5 text-sm text-danger"
        >
          Delete Permanently
        </button>
      </div>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={confirmTarget === "restore" ? "Restore this record?" : `Move to "${confirmTarget}"?`}
        destructive={confirmTarget === "archived"}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={async () => {
          if (confirmTarget === "restore") {
            await performRestore();
          } else if (confirmTarget) {
            await performTransition(confirmTarget);
          }
          setConfirmTarget(null);
        }}
      />

      <ForceDeleteDialog
        open={forceDeleteOpen}
        entityLabel={definition.label}
        expectedText={recordLabel}
        onCancel={() => setForceDeleteOpen(false)}
        onConfirm={performForceDelete}
      />
    </div>
  );
}
