import Link from "next/link";
import type { Locale } from "@ahr/site";

/**
 * Implements: UI/UX Specification, Design System (doc 02) §"Breadcrumbs" —
 * public variant (the Dashboard's Breadcrumbs, Milestone 3, hardcodes a
 * "/dashboard" root link and isn't suitable here).
 */
export function SiteBreadcrumbs({
  locale,
  segments,
}: {
  locale: Locale;
  segments: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-5xl p-4 text-sm text-neutral">
      <ol className="flex flex-wrap gap-1">
        <li>
          <Link href={`/${locale}`}>{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        </li>
        {segments.map((segment, index) => (
          <li key={index} className="flex gap-1">
            <span aria-hidden="true">/</span>
            {segment.href ? (
              <Link href={segment.href}>{segment.label}</Link>
            ) : (
              <span>{segment.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
