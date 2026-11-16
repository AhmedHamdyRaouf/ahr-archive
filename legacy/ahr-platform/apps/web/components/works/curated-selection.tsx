import { CURATED_SELECTION_CONTENT } from "./works-content";
import { WorkCard, type WorkCardData } from "./work-card";

/**
 * Implements: Works Page editorial rebuild (data owner spec, 2026-07-24) —
 * "Curated Selection" (renamed from "Featured Works"), fully managed from
 * the CMS via `work.is_featured` (existing column, no schema change) —
 * same mechanism the Home page's own Featured Works section already uses.
 */
export function CuratedSelection({ works, locale }: { works: WorkCardData[]; locale: "ar" | "en" }) {
  if (works.length === 0) return null;

  return (
    <section className="works-section">
      <div className="container">
        <div className="section-header">
          <p className="section-count">{CURATED_SELECTION_CONTENT.eyebrow[locale]}</p>
          <h2>{CURATED_SELECTION_CONTENT.heading[locale]}</h2>
          <div className="section-line" />
        </div>
        <div className="work-tile-grid">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
