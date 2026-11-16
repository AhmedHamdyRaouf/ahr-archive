import Link from "next/link";

/**
 * Implements: UI/UX Specification, Design System (02) — "Breadcrumbs...
 * always reflects the actual navigational path, never a decorative
 * shortened version."
 */
export function Breadcrumbs({
  locale,
  segments,
}: {
  locale: string;
  segments: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="p-4 text-sm text-neutral">
      <ol className="flex flex-wrap gap-1">
        <li>
          <Link href={`/${locale}/dashboard`}>Dashboard</Link>
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
