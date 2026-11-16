import Link from "next/link";
import { WORK_TYPE_LABELS, ARCHIVE_CONTENT } from "./works-content";

export interface WorkCardData {
  id: string;
  public_id: string;
  title_ar: string | null;
  title_en: string | null;
  work_type: string | null;
  year: number | null;
  verification_status?: string | null;
  thumbnailUrl?: string | null;
  display_size?: string | null;
}

const SIZE_CLASS: Record<string, string> = {
  small: "work-tile-small",
  medium: "work-tile-medium",
  large: "work-tile-large",
};

/**
 * Implements: Works Page editorial rebuild (data owner spec, 2026-07-24) —
 * one masonry tile. Size comes only from `display_size` (CMS-controlled,
 * migration 20260724140000) — never randomly generated. In "Grid" view the
 * caller passes `forceUniform` so every tile renders at the same size
 * regardless of `display_size`, without touching the underlying data.
 */
export function WorkCard({
  work,
  locale,
  forceUniform = false,
}: {
  work: WorkCardData;
  locale: "ar" | "en";
  forceUniform?: boolean;
}) {
  const title = (locale === "ar" ? work.title_ar : work.title_en) || work.title_en || work.title_ar || "";
  const typeLabel = work.work_type ? WORK_TYPE_LABELS[work.work_type]?.[locale] : null;
  const sizeClass = forceUniform ? "" : SIZE_CLASS[work.display_size ?? "medium"] ?? "work-tile-medium";

  return (
    <Link
      href={`/${locale}/works/${work.public_id}`}
      className={`work-tile group ${sizeClass}`}
    >
      {work.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={work.thumbnailUrl}
          alt={title}
          data-cursor="view"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#111] text-white/20">
          <span className="about-heading text-xs uppercase tracking-[0.2em]">{typeLabel ?? work.work_type}</span>
        </div>
      )}

      <div className="work-tile-overlay" aria-hidden />

      <div className="work-tile-info">
        {typeLabel ? <p className="work-tile-type">{typeLabel}</p> : null}
        <h3 className="work-tile-title">{title}</h3>
        {work.year ? <p className="work-tile-year">{work.year}</p> : null}
      </div>

      <span className="work-tile-cta">
        {ARCHIVE_CONTENT.viewWork[locale]} {locale === "ar" ? "←" : "→"}
      </span>
    </Link>
  );
}
