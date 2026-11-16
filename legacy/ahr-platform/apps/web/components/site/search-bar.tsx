"use client";

import { Search } from "lucide-react";
import type { Locale } from "@ahr/site";

/**
 * Implements: UI/UX Specification, Design System (doc 02) §"Navigation" —
 * SearchBar in SiteHeader, present on every page. A search box, not a
 * primary nav link — Sitemap (Phase 3) never listed "Search" as a page in
 * the navigation tree; it's the entry point to the Search results page.
 *
 * Updated 2026-07-25 (data owner: "شكل شريط البحث مش حلو") — restyled to
 * match the live site's own glass-pill language (`.lang-btn` in
 * site-legacy.css: translucent background, blurred border, gold focus
 * accent) via a new `.search-bar` class in that same stylesheet, rather
 * than the previous plain, unstyled Tailwind `<input>`. Also reused
 * as-is by the `/search` results page (previously a near-duplicate,
 * slightly differently-styled inline form) via the new `defaultValue`
 * prop, removing that inconsistency.
 */
export function SearchBar({
  locale,
  defaultValue,
}: {
  locale: Locale;
  defaultValue?: string;
}) {
  return (
    <form action={`/${locale}/search`} role="search" className="search-bar">
      <Search size={16} aria-hidden />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={locale === "ar" ? "ابحث..." : "Search…"}
        aria-label={locale === "ar" ? "بحث" : "Search"}
      />
    </form>
  );
}
