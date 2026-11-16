import Link from "next/link";
import type { ResolvedAsset } from "@/lib/asset-library";
import { SECTION_META, MANIFESTO_CONTENT as C } from "../about-content";
import { AssetImage } from "../asset-image";
import { Reveal } from "../reveal";

/** Section 09 — Manifesto. Replaces a traditional Contact section. */
export function Manifesto({
  locale,
  asset,
}: {
  locale: "ar" | "en";
  asset?: ResolvedAsset;
}) {
  return (
    <section id={SECTION_META.manifesto.id} className="cine-section is-roomy">
      <div className="cine-shell max-w-3xl text-center">
        <Reveal>
          <AssetImage asset={asset} content={C.image} locale={locale} aspectClassName="aspect-[16/9]" className="cine-center max-w-md" />
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="about-heading mt-14 text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 text-white/70">{C.body[locale]}</p>
        </Reveal>

        <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/${locale}/contact`} className="btn gold">
            {C.collaborateCta[locale]}
          </Link>
          <Link href={`/${locale}/contact`} className="btn">
            {C.contactCta[locale]}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
