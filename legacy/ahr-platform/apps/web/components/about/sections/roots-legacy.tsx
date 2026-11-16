import type { ResolvedAsset } from "@/lib/asset-library";
import { SECTION_META, ROOTS_LEGACY_CONTENT as C } from "../about-content";
import { AssetImage } from "../asset-image";
import { Reveal } from "../reveal";

/** Section 03 — Roots & Legacy. Image leads the DOM order; dir-aware flex
 * places it on the right in Arabic and the left in English (spec: "Arabic:
 * Image on RIGHT, Text LEFT. English opposite.") without locale branching. */
export function RootsLegacy({
  locale,
  asset,
}: {
  locale: "ar" | "en";
  asset?: ResolvedAsset;
}) {
  return (
    <section id={SECTION_META.rootsLegacy.id} className="cine-section">
      <div className="cine-shell grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <Reveal>
          <AssetImage asset={asset} content={C.image} locale={locale} aspectClassName="aspect-[4/5]" />
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex flex-col gap-8">
            {C.blocks.map((block, index) => (
              <div key={block.heading.en} className="relative">
                <p className="about-eyebrow text-[var(--about-gold)]">{block.heading[locale]}</p>
                <p className="mt-3 text-white/70">{block.body[locale]}</p>
                {index < C.blocks.length - 1 ? (
                  <span className="mt-6 block text-white/20" aria-hidden>
                    ↓
                  </span>
                ) : null}
              </div>
            ))}

            <p className="about-quote mt-4 text-2xl md:text-3xl">{C.quote[locale]}</p>
            <p className="about-eyebrow text-white/40">{C.legacyLine[locale]}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
