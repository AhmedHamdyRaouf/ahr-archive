import Link from "next/link";
import type { Locale } from "@ahr/site";

/**
 * Implements: UI/UX Specification, Design System (doc 02) §"Cards" —
 * "the primary way entities are previewed in lists... consistent anatomy:
 * title, status/verification indicator, short metadata, primary action."
 * A separate component from the Dashboard's `AdminTable`/list styling
 * (Design Principles §7: "Public and Admin are different registers, same
 * system").
 */
export function VerificationBadge({ verificationStatus }: { verificationStatus: string }) {
  if (verificationStatus !== "verified") return null; // Design Principles: visible trust signal, but quiet when not applicable
  return (
    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success" role="status">
      ✓ Verified
    </span>
  );
}

export function EntityCard({
  href,
  titleAr,
  titleEn,
  excerpt,
  locale,
  verificationStatus,
}: {
  href: string;
  titleAr: string;
  titleEn: string;
  excerpt?: string;
  locale: Locale;
  verificationStatus?: string;
}) {
  const title = locale === "ar" ? titleAr : titleEn;

  return (
    <Link href={href} className="block rounded-md border p-4 transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {verificationStatus ? <VerificationBadge verificationStatus={verificationStatus} /> : null}
      </div>
      {excerpt ? <p className="mt-1 text-sm text-neutral">{excerpt}</p> : null}
    </Link>
  );
}
