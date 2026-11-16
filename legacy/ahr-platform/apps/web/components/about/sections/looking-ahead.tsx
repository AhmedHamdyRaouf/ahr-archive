import type { ResolvedAsset } from "@/lib/asset-library";
import { SECTION_META, LOOKING_AHEAD_CONTENT as C } from "../about-content";
import { AssetImage } from "../asset-image";
import { Reveal } from "../reveal";

/** Section 08 — Looking Ahead. Future vision across four columns. */
export function LookingAhead({
  locale,
  asset,
}: {
  locale: "ar" | "en";
  asset?: ResolvedAsset;
}) {
  return (
    <section id={SECTION_META.lookingAhead.id} className="cine-section">
      <div className="cine-shell max-w-6xl">
        <Reveal>
          <AssetImage asset={asset} content={C.background} locale={locale} aspectClassName="aspect-[21/9]" />
        </Reveal>

        <Reveal delay={0.1} className="cine-center mt-14 max-w-2xl text-center">
          <h2 className="about-heading text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
        </Reveal>

        <div className="mt-14 grid gap-10 md:grid-cols-4">
          {C.columns.map((column, index) => (
            <Reveal key={column.title.en} delay={0.1 + index * 0.08}>
              <div className="border-t border-[var(--about-gold)]/40 pt-6">
                <h3 className="about-heading text-lg text-white">{column.title[locale]}</h3>
                <p className="mt-3 text-sm text-white/60">{column.body[locale]}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
