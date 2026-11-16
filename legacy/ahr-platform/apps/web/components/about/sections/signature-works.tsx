import Link from "next/link";
import type { ResolvedAsset } from "@/lib/asset-library";
import { SECTION_META, SIGNATURE_WORKS_CONTENT as C } from "../about-content";
import { AssetImage } from "../asset-image";
import { Reveal } from "../reveal";

/** Section 05 — Signature Works. Largest section: a four-poster gallery. */
export function SignatureWorks({
  locale,
  assets,
}: {
  locale: "ar" | "en";
  assets: Record<string, ResolvedAsset>;
}) {
  return (
    <section id={SECTION_META.signatureWorks.id} className="cine-section is-roomy">
      <div className="cine-shell max-w-6xl">
        <Reveal className="cine-center max-w-2xl text-center">
          <h2 className="about-heading text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
          <p className="about-eyebrow mt-4 text-white/50">{C.intro[locale]}</p>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {C.posters.map((poster, index) => (
            <Reveal key={poster.title.en} delay={index * 0.08}>
              <article className="group">
                <div className="overflow-hidden">
                  <AssetImage
                    asset={assets[poster.imageKey]}
                    content={poster.placeholder}
                    locale={locale}
                    aspectClassName="aspect-[2/3]"
                    className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    gallery
                  />
                </div>
                <h3 className="about-heading mt-6 text-xl text-white">{poster.title[locale]}</h3>
                <p className="mt-2 text-sm text-white/60">{poster.description[locale]}</p>
                <Link href={`/${locale}/works`} className="btn mt-4 inline-block">
                  {C.discoverCta[locale]}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
