"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { replacePathLocale, type Locale } from "@ahr/site";

/**
 * Implements: UI/UX Specification, Design System (doc 02) §"Navigation" —
 * locale switcher. Preserves the current page when switching language
 * (e.g. a Work detail page stays on the same Work), rather than always
 * bouncing to Home — Frontend Development Rules: "no component silently
 * drops the untranslated-locale value."
 *
 * Redesigned 2026-07-25 (data owner picked "Option B" from a set of live
 * previews) — a two-segment pill with a sliding gold indicator under the
 * active language, replacing the previous single icon+text link. The
 * current locale renders as a plain (non-link) segment; only the other
 * one is a real `<Link>`. Uses `inset-inline-start` (not `left`/
 * `transform: translateX`) for the sliding thumb specifically so it
 * mirrors correctly under `dir="rtl"` without a separate RTL stylesheet
 * branch — flexbox already reorders the ع/EN segments for RTL on its
 * own, and inset-inline-start tracks whichever segment is first in
 * reading order in either direction.
 */
export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname() ?? `/${currentLocale}`;

  return (
    <span className={`lang-toggle state-${currentLocale}`}>
      <span className="lang-toggle-thumb" aria-hidden="true" />
      {currentLocale === "ar" ? (
        <span className="lang-toggle-current" aria-current="true">
          ع
        </span>
      ) : (
        <Link href={replacePathLocale(pathname, "ar")} aria-label="التحويل إلى العربية">
          ع
        </Link>
      )}
      {currentLocale === "en" ? (
        <span className="lang-toggle-current" aria-current="true">
          EN
        </span>
      ) : (
        <Link href={replacePathLocale(pathname, "en")} aria-label="Switch to English">
          EN
        </Link>
      )}
    </span>
  );
}
