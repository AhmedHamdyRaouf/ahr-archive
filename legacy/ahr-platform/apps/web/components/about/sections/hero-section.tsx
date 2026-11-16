"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import type { ResolvedAsset } from "@/lib/asset-library";
import { HERO_CONTENT, SECTION_META } from "../about-content";
import { AssetImage } from "../asset-image";
import { Reveal } from "../reveal";

/** Section 01 — Discover Ahmed. */
export function HeroSection({
  locale,
  asset,
}: {
  locale: "ar" | "en";
  asset?: ResolvedAsset;
}) {
  const [musicOn, setMusicOn] = useState(false);

  return (
    <section id={SECTION_META.hero.id} className="cine-section is-hero">
      <div className="cine-shell grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
        <Reveal className="order-2 md:order-1">
          <AssetImage asset={asset} content={HERO_CONTENT.portrait} locale={locale} aspectClassName="aspect-[3/4]" />
        </Reveal>

        <Reveal delay={0.15} className="relative order-1 md:order-2">
          <span className="about-ghost-number pointer-events-none absolute -top-16 text-[8rem] leading-none md:text-[11rem]">
            {SECTION_META.hero.number}
          </span>
          <div className="relative">
            <p className="about-eyebrow">{HERO_CONTENT.eyebrow[locale]}</p>
            <h1 className="about-heading mt-4 text-4xl text-white md:text-5xl">{HERO_CONTENT.name[locale]}</h1>
            <p className="mt-4 text-sm text-white/60">
              {HERO_CONTENT.roles.map((role) => role[locale]).join("  •  ")}
            </p>
            <p className="about-quote mt-8 text-xl md:text-2xl">{HERO_CONTENT.statement[locale]}</p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href={`#${SECTION_META.whereMusicFoundMe.id}`} className="btn gold">
                {HERO_CONTENT.primaryCta[locale]}
              </Link>
              <Link href={`/${locale}/works`} className="btn">
                {HERO_CONTENT.secondaryCta[locale]}
              </Link>
              <button
                type="button"
                onClick={() => setMusicOn((v) => !v)}
                aria-pressed={musicOn}
                title={locale === "ar" ? "لا يوجد تشغيل تلقائي" : "No autoplay"}
                className="flex items-center gap-2 text-xs text-white/50 transition hover:text-[var(--about-gold)]"
              >
                {musicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {HERO_CONTENT.musicCta[locale]}
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
