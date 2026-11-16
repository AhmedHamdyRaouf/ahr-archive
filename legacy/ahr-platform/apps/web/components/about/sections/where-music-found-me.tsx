"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ResolvedAsset } from "@/lib/asset-library";
import { SECTION_META, WHERE_MUSIC_FOUND_ME_CONTENT as C } from "../about-content";
import { AssetImage } from "../asset-image";
import { Reveal } from "../reveal";

/** Section 02 — Where Music Found Me. */
export function WhereMusicFoundMe({
  locale,
  asset,
}: {
  locale: "ar" | "en";
  asset?: ResolvedAsset;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <section id={SECTION_META.whereMusicFoundMe.id} className="cine-section">
      <div ref={ref} className="cine-shell max-w-6xl overflow-hidden">
        <Reveal>
          <div className="overflow-hidden">
            <motion.div style={{ y }}>
              <AssetImage asset={asset} content={C.image} locale={locale} aspectClassName="aspect-[21/9]" />
            </motion.div>
          </div>
        </Reveal>

        <div className="cine-center mt-14 max-w-2xl text-center">
          <Reveal>
            <h2 className="about-heading text-3xl text-white md:text-4xl">{C.heading[locale]}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-white/70">{C.paragraphOne[locale]}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="about-quote mt-10 text-2xl md:text-3xl">{C.quote[locale]}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-10 text-white/70">{C.paragraphTwo[locale]}</p>
          </Reveal>
          <Reveal delay={0.25}>
            <Link
              href={`#${SECTION_META.rootsLegacy.id}`}
              className="about-eyebrow mt-10 inline-block text-white/60 transition hover:text-[var(--about-gold)]"
            >
              {C.continueCta[locale]} {locale === "ar" ? "←" : "→"}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
