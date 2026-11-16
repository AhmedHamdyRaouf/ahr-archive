import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { requestSuggestion, createOpenAiClientFromEnv } from "@ahr/ai";
import type {
  ArticleSummaryContext,
  ContributionRoleContext,
  EntityContext,
  TranslationContext,
} from "@ahr/ai";
import { isEntityType } from "@ahr/content";
import { nextCookieAdapter } from "@/lib/cookies";
import { errorToResponse } from "@/lib/api-error";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";
import {
  logAiRecommendation,
  type AiRecommendationEntityType,
} from "@/lib/ai-recommendation-log";

export const dynamic = "force-dynamic";

const LEGACY_ENTITY_TYPES = new Set(["work", "project"]);

function isAiRecommendationEntityType(value: string): value is AiRecommendationEntityType {
  return isEntityType(value) || LEGACY_ENTITY_TYPES.has(value);
}

function parseEntityContext(context: Partial<EntityContext> | undefined): EntityContext | null {
  if (
    !context ||
    (context.entityType !== "work" && context.entityType !== "project") ||
    typeof context.titleAr !== "string" ||
    typeof context.titleEn !== "string" ||
    !Array.isArray(context.availableCategories)
  ) {
    return null;
  }
  return context as EntityContext;
}

function parseTranslationContext(
  context: Partial<TranslationContext> | undefined,
): TranslationContext | null {
  if (
    !context ||
    typeof context.fieldLabel !== "string" ||
    (context.sourceLocale !== "ar" && context.sourceLocale !== "en") ||
    (context.targetLocale !== "ar" && context.targetLocale !== "en") ||
    typeof context.sourceText !== "string" ||
    context.sourceText.trim().length === 0
  ) {
    return null;
  }
  if (context.sourceLocale === context.targetLocale) {
    return null;
  }
  return context as TranslationContext;
}

function parseArticleSummaryContext(
  context: Partial<ArticleSummaryContext> | undefined,
): ArticleSummaryContext | null {
  if (!context || typeof context.articleText !== "string" || context.articleText.trim().length === 0) {
    return null;
  }
  return context as ArticleSummaryContext;
}

function parseContributionRoleContext(
  context: Partial<ContributionRoleContext> | undefined,
): ContributionRoleContext | null {
  if (
    !context ||
    typeof context.personName !== "string" ||
    context.personName.trim().length === 0 ||
    typeof context.subjectLabel !== "string" ||
    context.subjectLabel.trim().length === 0 ||
    (context.subjectType !== "work" &&
      context.subjectType !== "project" &&
      context.subjectType !== "event") ||
    !Array.isArray(context.availableRoles) ||
    context.availableRoles.length === 0 ||
    !context.availableRoles.every((role) => typeof role === "string")
  ) {
    return null;
  }
  return context as ContributionRoleContext;
}

/**
 * Implements: 07-API.md §11 ("AI | /api/ai/suggest"); 14-AI-Integration.md §3.
 * Extended 2026-07-22 — translation-suggestion for missing bilingual fields,
 * article-summary-suggestion for pasted-in journalism article text.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireCapability(nextCookieAdapter(), "ai:suggest");

    const body = (await request.json()) as {
      kind?: string;
      entityId?: string;
      logEntityType?: string;
      context?:
        | Partial<EntityContext>
        | Partial<TranslationContext>
        | Partial<ArticleSummaryContext>
        | Partial<ContributionRoleContext>;
    };

    if (typeof body.entityId !== "string" || body.entityId.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "entityId is required (needed to record this suggestion's history).",
          },
        },
        { status: 422 },
      );
    }

    const logEntityType = body.logEntityType ?? (body.context as Partial<EntityContext> | undefined)?.entityType;
    if (typeof logEntityType !== "string" || !isAiRecommendationEntityType(logEntityType)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "logEntityType must be a recognized CMS entity type.",
          },
        },
        { status: 422 },
      );
    }

    const aiClient = createOpenAiClientFromEnv();

    if (body.kind === "category-tag-suggestion" || body.kind === "summary-suggestion") {
      const context = parseEntityContext(body.context as Partial<EntityContext> | undefined);
      if (!context) {
        return NextResponse.json(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message:
                "context must include entityType ('work'|'project'), titleAr, titleEn, and availableCategories.",
            },
          },
          { status: 422 },
        );
      }

      const result = await requestSuggestion({ aiClient }, { kind: body.kind, context });

      const supabase = createRouteHandlerSupabaseClient();
      const logId = await logAiRecommendation(supabase, {
        entityType: context.entityType,
        entityId: body.entityId,
        kind: body.kind,
        suggestedContent: result.suggestedContent,
        rationale: result.rationale,
        confidenceLevel: result.confidenceLevel,
        provider: result.provider,
        actorId: session.platformUserId,
      });

      return NextResponse.json({ data: { ...result, logId }, error: null });
    }

    if (body.kind === "translation-suggestion") {
      const context = parseTranslationContext(body.context as Partial<TranslationContext> | undefined);
      if (!context) {
        return NextResponse.json(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message:
                "context must include fieldLabel, sourceLocale, targetLocale (ar|en, different), and non-empty sourceText.",
            },
          },
          { status: 422 },
        );
      }

      const result = await requestSuggestion({ aiClient }, { kind: body.kind, context });

      const supabase = createRouteHandlerSupabaseClient();
      const logId = await logAiRecommendation(supabase, {
        entityType: logEntityType,
        entityId: body.entityId,
        kind: body.kind,
        suggestedContent: result.suggestedContent,
        rationale: result.rationale,
        confidenceLevel: result.confidenceLevel,
        provider: result.provider,
        actorId: session.platformUserId,
      });

      return NextResponse.json({ data: { ...result, logId }, error: null });
    }

    if (body.kind === "article-summary-suggestion") {
      const context = parseArticleSummaryContext(
        body.context as Partial<ArticleSummaryContext> | undefined,
      );
      if (!context) {
        return NextResponse.json(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "context must include a non-empty articleText.",
            },
          },
          { status: 422 },
        );
      }

      const result = await requestSuggestion({ aiClient }, { kind: body.kind, context });

      const supabase = createRouteHandlerSupabaseClient();
      const logId = await logAiRecommendation(supabase, {
        entityType: logEntityType,
        entityId: body.entityId,
        kind: body.kind,
        suggestedContent: result.suggestedContent,
        rationale: result.rationale,
        confidenceLevel: result.confidenceLevel,
        provider: result.provider,
        actorId: session.platformUserId,
      });

      return NextResponse.json({ data: { ...result, logId }, error: null });
    }

    if (body.kind === "contribution-role-suggestion") {
      const context = parseContributionRoleContext(
        body.context as Partial<ContributionRoleContext> | undefined,
      );
      if (!context) {
        return NextResponse.json(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message:
                "context must include personName, subjectLabel, subjectType ('work'|'project'|'event'), and a non-empty availableRoles array.",
            },
          },
          { status: 422 },
        );
      }

      const result = await requestSuggestion({ aiClient }, { kind: body.kind, context });

      const supabase = createRouteHandlerSupabaseClient();
      const logId = await logAiRecommendation(supabase, {
        entityType: logEntityType,
        entityId: body.entityId,
        kind: body.kind,
        suggestedContent: result.suggestedContent,
        rationale: result.rationale,
        confidenceLevel: result.confidenceLevel,
        provider: result.provider,
        actorId: session.platformUserId,
      });

      return NextResponse.json({ data: { ...result, logId }, error: null });
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message:
            'kind must be "category-tag-suggestion", "summary-suggestion", "translation-suggestion", "article-summary-suggestion", or "contribution-role-suggestion".',
        },
      },
      { status: 422 },
    );
  } catch (error) {
    return errorToResponse(error);
  }
}
