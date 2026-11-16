/**
 * Implements: Identifier Strategy (Phase 4) — Public ID ("readable, may
 * change if the entity's name changes — but always linked to the same
 * stable Internal/Permanent ID"); Database Architecture §5 (`public_id`
 * columns on person/work/organization/project/event).
 *
 * Generic — does not know about any specific entity type. A future Work
 * package calls `generateSlug(titleEn)`; this module has no idea what a
 * "Work" is.
 */

/** Normalizes a string into a URL-safe slug base (ASCII-transliteration-free — see note below). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-") // keep any-language letters/numbers, per \p{L} — not ASCII-only
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Generates a slug from a preferred source string (typically the English
 * title/name — Data Foundation Conventions never mandates which language
 * seeds the slug, so this is a CMS Foundation policy: prefer the English
 * field for URL stability, since Arabic slugs are also valid per `\p{L}`
 * above but English is more broadly URL-friendly without transliteration).
 * Callers needing an Arabic-seeded slug can pass the Arabic field instead —
 * this function makes no entity-specific assumption either way.
 */
export function generateSlugBase(preferredSource: string, fallbackSource?: string): string {
  const base = slugify(preferredSource);
  if (base.length > 0) return base;
  if (fallbackSource) return slugify(fallbackSource);
  return "";
}

/**
 * Given a desired slug base and a function that checks whether a candidate
 * is already taken (scoped to whichever table/entity type the caller is
 * generating for), returns the first available slug — `base`, `base-2`,
 * `base-3`, etc. Suffix starts at 2, not 1, so the first occurrence of a
 * name reads as the "plain" slug.
 */
export async function generateUniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (base.length === 0) {
    throw new Error("generateUniqueSlug: base must be a non-empty string after slugify().");
  }

  let candidate = base;
  let suffix = 2;
  // Bounded loop — a runaway collision search is itself a signal something
  // is wrong (e.g. isTaken always returning true), not a case to loop
  // forever on.
  const MAX_ATTEMPTS = 1000;

  for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
    if (!(await isTaken(candidate))) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  throw new Error(
    `generateUniqueSlug: exceeded ${MAX_ATTEMPTS} attempts for base "${base}". ` +
      `This almost always indicates a bug in the isTaken() check, not a genuine collision run.`,
  );
}
