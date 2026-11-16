"use client";

import { useState } from "react";

/**
 * Implements: Wireframes/AI.md — AISuggestionPanel.
 * Extended 2026-07-22 — translation-suggestion for missing bilingual fields,
 * article-summary-suggestion for pasted-in journalism article text,
 * contribution-role-suggestion for a Contribution's `role` field.
 */

type EntitySuggestionKind = "category-tag-suggestion" | "summary-suggestion";
type ConfidenceLevel = "low" | "medium" | "high";

interface CategoryTagSuggestion {
  categories: string[];
  tags: string[];
}

interface SummarySuggestion {
  summaryAr: string;
  summaryEn: string;
}

interface TranslationSuggestion {
  translatedText: string;
  targetLocale: "ar" | "en";
}

interface EntityContext {
  entityType: "work" | "project";
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  existingCategories?: string[];
  existingTags?: string[];
  availableCategories: string[];
}

interface TranslationContext {
  fieldLabel: string;
  sourceLocale: "ar" | "en";
  targetLocale: "ar" | "en";
  sourceText: string;
}

interface ArticleSummaryContext {
  articleText: string;
}

interface ContributionRoleContext {
  personName: string;
  subjectLabel: string;
  subjectType: "work" | "project" | "event";
  roleDetail?: string;
  availableRoles: string[];
}

interface ContributionRoleSuggestion {
  role: string;
}

type AISuggestionPanelProps =
  | {
      kind: EntitySuggestionKind;
      context: EntityContext;
      logEntityType?: "work" | "project";
      entityId: string;
      fieldLabel: string;
      onAccept: (content: CategoryTagSuggestion | SummarySuggestion) => void;
    }
  | {
      kind: "translation-suggestion";
      resolveContext: () => TranslationContext | null;
      logEntityType: string;
      entityId: string;
      fieldLabel: string;
      onAccept: (content: TranslationSuggestion) => void;
    }
  | {
      kind: "article-summary-suggestion";
      resolveContext: () => ArticleSummaryContext | null;
      logEntityType: string;
      entityId: string;
      fieldLabel: string;
      onAccept: (content: SummarySuggestion) => void;
    }
  | {
      kind: "contribution-role-suggestion";
      /** Async because resolving requires fetching the related Person/Work
       * display names from the existing GET /api/cms/{entityType}/{id}. */
      resolveContext: () => Promise<ContributionRoleContext | null>;
      logEntityType: string;
      entityId: string;
      fieldLabel: string;
      onAccept: (content: ContributionRoleSuggestion) => void;
    };

/**
 * Mirrors AISuggestionPanelProps' discriminant so a generated suggestion's
 * `content` type is tied to its own `kind`, not the panel's current props.
 * Needed because "summary-suggestion" and "article-summary-suggestion" both
 * produce a `SummarySuggestion`-shaped result — a plain content-shape check
 * (`"summaryAr" in content`) can't tell those two kinds apart, only `kind` can.
 */
type SuggestionState =
  | {
      kind: EntitySuggestionKind;
      content: CategoryTagSuggestion | SummarySuggestion;
      rationale: string;
      confidenceLevel: ConfidenceLevel;
      logId?: string;
    }
  | {
      kind: "translation-suggestion";
      content: TranslationSuggestion;
      rationale: string;
      confidenceLevel: ConfidenceLevel;
      logId?: string;
    }
  | {
      kind: "article-summary-suggestion";
      content: SummarySuggestion;
      rationale: string;
      confidenceLevel: ConfidenceLevel;
      logId?: string;
    }
  | {
      kind: "contribution-role-suggestion";
      content: ContributionRoleSuggestion;
      rationale: string;
      confidenceLevel: ConfidenceLevel;
      logId?: string;
    };

function reportOutcome(logId: string | undefined, outcome: "accepted" | "rejected") {
  if (!logId) return;
  fetch(`/api/ai/suggest/${logId}/resolve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome }),
  }).catch(() => {
    // Deliberately silent — see file header. The Administrator's
    // Accept/Reject already took effect in the form regardless.
  });
}

export function AISuggestionPanel(props: AISuggestionPanelProps) {
  const { kind, entityId, fieldLabel } = props;
  const logEntityType =
    props.kind === "category-tag-suggestion" || props.kind === "summary-suggestion"
      ? (props.logEntityType ?? props.context.entityType)
      : props.logEntityType;

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null);

  async function requestSuggestion() {
    setStatus("loading");
    setError(null);

    let context: EntityContext | TranslationContext | ArticleSummaryContext | ContributionRoleContext;
    if (
      props.kind === "translation-suggestion" ||
      props.kind === "article-summary-suggestion" ||
      props.kind === "contribution-role-suggestion"
    ) {
      const resolved = await props.resolveContext();
      if (!resolved) {
        setError(
          props.kind === "translation-suggestion"
            ? "Fill in the source language before requesting a translation."
            : props.kind === "article-summary-suggestion"
              ? "Paste the article text before requesting a summary."
              : "Select a Person and a Work/Project/Event before requesting a role.",
        );
        setStatus("error");
        return;
      }
      context = resolved;
    } else {
      context = props.context;
    }

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, context, entityId, logEntityType }),
      });
      const body = await response.json();

      if (!response.ok || body.error) {
        setError(body.error?.message ?? "Couldn't generate a suggestion right now.");
        setStatus("error");
        return;
      }

      setSuggestion({
        kind,
        content: body.data.suggestedContent,
        rationale: body.data.rationale,
        confidenceLevel: body.data.confidenceLevel,
        logId: body.data.logId ?? undefined,
      });
      setStatus("success");
    } catch {
      setError("Couldn't generate a suggestion right now.");
      setStatus("error");
    }
  }

  function accept() {
    if (!suggestion) return;
    switch (suggestion.kind) {
      case "translation-suggestion":
        if (props.kind === "translation-suggestion") props.onAccept(suggestion.content);
        break;
      case "article-summary-suggestion":
        if (props.kind === "article-summary-suggestion") props.onAccept(suggestion.content);
        break;
      case "contribution-role-suggestion":
        if (props.kind === "contribution-role-suggestion") props.onAccept(suggestion.content);
        break;
      default:
        if (props.kind === "category-tag-suggestion" || props.kind === "summary-suggestion") {
          props.onAccept(suggestion.content);
        }
    }
    reportOutcome(suggestion.logId, "accepted");
    setSuggestion(null);
    setStatus("idle");
  }

  function reject() {
    reportOutcome(suggestion?.logId, "rejected");
    setSuggestion(null);
    setStatus("idle");
  }

  if (status === "idle" || (status === "error" && !suggestion)) {
    return (
      <div className="mt-1">
        <button
          type="button"
          onClick={requestSuggestion}
          className="text-xs text-primary underline"
        >
          ✨ Suggest {fieldLabel.toLowerCase()}
        </button>
        {error ? (
          <p role="alert" className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (status === "loading") {
    return (
      <p role="status" className="mt-1 text-xs text-neutral">
        Generating a suggestion…
      </p>
    );
  }

  if (suggestion) {
    const confidenceDots = { low: "•", medium: "••", high: "•••" }[suggestion.confidenceLevel];
    return (
      <div className="mt-1 rounded-md border border-dashed border-primary bg-primary/5 p-3">
        <p className="text-xs font-medium">✨ Suggested</p>
        {"summaryAr" in suggestion.content ? (
          <div className="mt-1 space-y-1 text-sm">
            <p dir="rtl">{suggestion.content.summaryAr}</p>
            <p dir="ltr">{suggestion.content.summaryEn}</p>
          </div>
        ) : "translatedText" in suggestion.content ? (
          <p
            className="mt-1 text-sm"
            dir={suggestion.content.targetLocale === "ar" ? "rtl" : "ltr"}
          >
            {suggestion.content.translatedText}
          </p>
        ) : "role" in suggestion.content ? (
          <p className="mt-1 text-sm">{suggestion.content.role}</p>
        ) : (
          <div className="mt-1 space-y-1 text-sm">
            {suggestion.content.categories.length > 0 ? (
              <p>
                <span className="text-neutral">Categories:</span>{" "}
                {suggestion.content.categories.join(", ")}
              </p>
            ) : null}
            {suggestion.content.tags.length > 0 ? (
              <p>
                <span className="text-neutral">Tags:</span> {suggestion.content.tags.join(", ")}
              </p>
            ) : null}
          </div>
        )}
        <p className="mt-2 text-xs text-neutral">
          {suggestion.rationale} — Confidence: {confidenceDots}
        </p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-primary px-3 py-1 text-xs text-white"
          >
            Accept
          </button>
          <button type="button" onClick={reject} className="text-xs underline">
            Reject
          </button>
        </div>
      </div>
    );
  }

  return null;
}
