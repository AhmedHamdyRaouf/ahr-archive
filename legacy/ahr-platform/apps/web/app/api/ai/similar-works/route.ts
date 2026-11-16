import { NextResponse, type NextRequest } from "next/server";
import { requireCapability } from "@ahr/auth";
import { generateEmbedding, createOpenAiClientFromEnv } from "@ahr/ai";
import { nextCookieAdapter } from "@/lib/cookies";
import { errorToResponse } from "@/lib/api-error";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const MATCH_COUNT = 5;

/**
 * Implements: Phase 2 AI backlog item 4 (Similar/duplicate Work detection),
 * admin-only, lowest-risk first use of embeddings — built once here,
 * items 5–6 reuse `work.search_embedding`/`match_similar_works` rather than
 * re-deriving their own embedding path.
 *
 * Unlike /api/ai/suggest, this is not a single reviewable suggestion with
 * an accept/reject outcome (14-AI-Integration.md §2 item 2 — every AI
 * output carries a rationale/confidence) — it returns a list of candidate
 * matches for the Administrator to look through and decide on manually, so
 * it is not logged to `ai_recommendation_log`. Every OpenAI call this route
 * makes is still logged to the technical/operational stream via
 * `generateEmbedding`'s own logger (14-AI-Integration.md §8).
 */
export async function POST(request: NextRequest) {
  try {
    await requireCapability(nextCookieAdapter(), "ai:suggest");

    const body = (await request.json()) as { workId?: string };
    if (typeof body.workId !== "string" || body.workId.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "VALIDATION_ERROR", message: "workId is required." },
        },
        { status: 422 },
      );
    }

    const supabase = createRouteHandlerSupabaseClient();
    const { data: work, error: fetchError } = await supabase
      .from("work")
      .select("id, title_ar, title_en, description_ar, description_en")
      .eq("id", body.workId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!work) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Work not found." } },
        { status: 404 },
      );
    }

    const text = [work.title_en, work.title_ar, work.description_en, work.description_ar]
      .filter(Boolean)
      .join(" ");
    if (!text.trim()) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "This Work has no title/description text to compare.",
          },
        },
        { status: 422 },
      );
    }

    const embeddingClient = createOpenAiClientFromEnv();
    const embedding = await generateEmbedding({ embeddingClient }, text);
    const embeddingLiteral = `[${embedding.join(",")}]`;

    const { error: updateError } = await supabase
      .from("work")
      .update({ search_embedding: embeddingLiteral })
      .eq("id", work.id);
    if (updateError) throw updateError;

    const { data: matches, error: matchError } = await supabase.rpc("match_similar_works", {
      query_embedding: embeddingLiteral,
      exclude_work_id: work.id,
      match_count: MATCH_COUNT,
    });
    if (matchError) throw matchError;

    return NextResponse.json({
      data: {
        matches: (matches ?? []).map(
          (match: { id: string; title_ar: string; title_en: string; status: string; distance: number }) => ({
            id: match.id,
            titleAr: match.title_ar,
            titleEn: match.title_en,
            status: match.status,
            // Cosine distance (0 = identical) shown as an approximate
            // similarity percentage — an internal review aid, not a
            // precision metric.
            similarityPercent: Math.max(0, Math.round((1 - match.distance) * 100)),
          }),
        ),
      },
      error: null,
    });
  } catch (error) {
    return errorToResponse(error);
  }
}
