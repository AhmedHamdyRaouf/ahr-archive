"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Implements: Phase 2 AI backlog item 4 (Similar/duplicate Work detection),
 * admin-only. Backend: POST /api/ai/similar-works. Unlike AISuggestionPanel,
 * this is a read-only lookup — a list of candidate matches for the
 * Administrator to open and judge themselves, never an Accept/Reject action
 * (there is no single "suggested value" here to accept — see the Route
 * Handler's own file header for why this isn't logged to
 * ai_recommendation_log the way the other AI kinds are).
 */
interface SimilarWork {
  id: string;
  titleAr: string;
  titleEn: string;
  status: string;
  similarityPercent: number;
}

export function SimilarWorksPanel({ locale, workId }: { locale: string; workId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<SimilarWork[]>([]);

  async function checkForSimilarWorks() {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/ai/similar-works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId }),
      });
      const body = await response.json();

      if (!response.ok || body.error) {
        setError(body.error?.message ?? "Couldn't check for similar Works right now.");
        setStatus("error");
        return;
      }

      setMatches(body.data.matches ?? []);
      setStatus("success");
    } catch {
      setError("Couldn't check for similar Works right now.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Similar/duplicate Works</h2>
        <button
          type="button"
          onClick={checkForSimilarWorks}
          disabled={status === "loading"}
          className="text-xs text-primary underline disabled:opacity-50"
        >
          {status === "loading" ? "Checking…" : "✨ Check for similar Works"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : null}

      {status === "success" ? (
        matches.length === 0 ? (
          <p className="mt-2 text-xs text-neutral">No similar Works found.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {matches.map((match) => (
              <li key={match.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/${locale}/dashboard/cms/works/${match.id}`}
                  className="text-primary underline"
                >
                  {match.titleEn || match.titleAr}
                </Link>
                <span className="text-xs text-neutral">
                  {match.similarityPercent}% similar — {match.status}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
