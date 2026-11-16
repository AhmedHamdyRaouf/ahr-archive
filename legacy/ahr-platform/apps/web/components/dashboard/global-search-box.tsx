"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Dashboard UX Enhancement Backlog #10 — "Global Search" — the entry
 * point in the Top Bar, present on every Dashboard screen (not just an
 * entity list), submitting to /dashboard/search.
 */
export function GlobalSearchBox({ locale }: { locale: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          router.push(`/${locale}/dashboard/search?q=${encodeURIComponent(query.trim())}`);
        }
      }}
    >
      <input
        type="search"
        placeholder="Search everything…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Global search"
        className="w-48 rounded-md border p-1.5 text-sm"
      />
    </form>
  );
}
