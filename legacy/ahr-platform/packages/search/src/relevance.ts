/**
 * Implements: Search Architecture (Phase 3) — "ranking: exact name/title
 * match first, then verified-status preference, then relevance." A
 * DETERMINISTIC HEURISTIC, not `ts_rank` — see docs/blocked-fts.md for why
 * true PostgreSQL full-text ranking isn't available in the frozen schema.
 *
 * Every function here is pure (no database access) — precisely so this
 * heuristic itself can be tested in isolation, independent of how rows
 * were actually fetched (ILIKE via query.ts).
 */

const EXACT_MATCH_SCORE = 1000;
const PREFIX_MATCH_SCORE = 500;
const SUBSTRING_MATCH_SCORE = 100;
const VERIFIED_BONUS = 50;
const MAX_RECENCY_BONUS = 50;
const RECENCY_DECAY_DAYS = 365; // a one-year-old update earns ~0 recency bonus; a brand-new one earns the full bonus

/**
 * Scores how well a query matches a bilingual title/name pair — the
 * primary ranking signal. Checks both languages independently, since a
 * query might match the Arabic field, the English field, or both.
 */
export function computeMatchScore(query: string, titleAr: string, titleEn: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return 0;

  const candidates = [titleAr.toLowerCase(), titleEn.toLowerCase()];
  let best = 0;

  for (const candidate of candidates) {
    if (candidate === normalizedQuery) {
      best = Math.max(best, EXACT_MATCH_SCORE);
    } else if (candidate.startsWith(normalizedQuery)) {
      best = Math.max(best, PREFIX_MATCH_SCORE);
    } else if (candidate.includes(normalizedQuery)) {
      best = Math.max(best, SUBSTRING_MATCH_SCORE);
    }
  }

  return best;
}

/** Verified content ranks above unverified/pending/self-reported content, per Search Architecture (Phase 3). */
export function computeVerificationBonus(verificationStatus: string): number {
  return verificationStatus === "verified" ? VERIFIED_BONUS : 0;
}

/**
 * Recently-updated content gets a small boost — linearly decaying to zero
 * over RECENCY_DECAY_DAYS. This is a tie-breaker, not a primary signal:
 * it can never outweigh a match-quality difference (its max value is far
 * below SUBSTRING_MATCH_SCORE, let alone EXACT_MATCH_SCORE).
 */
export function computeRecencyBonus(updatedAt: string, now: Date = new Date()): number {
  const updatedTime = new Date(updatedAt).getTime();
  if (Number.isNaN(updatedTime)) return 0;

  const daysSinceUpdate = (now.getTime() - updatedTime) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 0) return MAX_RECENCY_BONUS; // clock skew/future timestamp — treat as "as recent as possible," not an error
  if (daysSinceUpdate >= RECENCY_DECAY_DAYS) return 0;

  return MAX_RECENCY_BONUS * (1 - daysSinceUpdate / RECENCY_DECAY_DAYS);
}

export interface RelevanceInput {
  query: string;
  titleAr: string;
  titleEn: string;
  verificationStatus: string;
  updatedAt: string;
}

/** Combines the three signals into one score — higher is more relevant. */
export function computeRelevanceScore(input: RelevanceInput, now: Date = new Date()): number {
  return (
    computeMatchScore(input.query, input.titleAr, input.titleEn) +
    computeVerificationBonus(input.verificationStatus) +
    computeRecencyBonus(input.updatedAt, now)
  );
}
