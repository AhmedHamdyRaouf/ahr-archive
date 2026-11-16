"use client";

import "./about-theme.css";
import type { ResolvedAsset } from "@/lib/asset-library";
import { ABOUT_IMAGE_KEYS } from "./about-content";
import { aboutArabicFont, aboutBodyFont, aboutDisplayFont } from "./about-fonts";
import { SectionTimeline } from "./section-timeline";
import { HeroSection } from "./sections/hero-section";
import { WhereMusicFoundMe } from "./sections/where-music-found-me";
import { RootsLegacy } from "./sections/roots-legacy";
import { TwoMusicalWorlds } from "./sections/two-musical-worlds";
import { SignatureWorks } from "./sections/signature-works";
import { BeyondMusic } from "./sections/beyond-music";
import { RecognitionSection } from "./sections/recognition-section";
import { LookingAhead } from "./sections/looking-ahead";
import { Manifesto } from "./sections/manifesto";

/**
 * Cinematic content for /about, rendered inside the shared (site) layout's
 * SiteHeader/`<main>`/SiteFooter (data owner decision, 2026-07-23, reversing
 * an earlier standalone attempt) — that shared chrome is the only place the
 * WhatsApp float button and the site's real primary nav are implemented, so
 * this page must not opt out of it. The persistent scroll timeline stays
 * page-scoped (floats above the shared chrome); the intro splash itself is
 * NOT duplicated here — `SiteEffects` (rendered once by the shared layout)
 * already renders one loader for every page, so a second one here would
 * stack on top of it.
 */
export function AboutExperience({
  locale,
  assets,
}: {
  locale: "ar" | "en";
  /** Resolved Asset Library images keyed by image_key (server-fetched in page.tsx) — empty until assets are published. */
  assets: Record<string, ResolvedAsset>;
}) {
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`about-theme ${aboutDisplayFont.variable} ${aboutBodyFont.variable} ${aboutArabicFont.variable}`}
    >
      <SectionTimeline locale={locale} />

      <HeroSection locale={locale} asset={assets[ABOUT_IMAGE_KEYS.heroPortrait]} />
      <WhereMusicFoundMe locale={locale} asset={assets[ABOUT_IMAGE_KEYS.whereMusicFoundMe]} />
      <RootsLegacy locale={locale} asset={assets[ABOUT_IMAGE_KEYS.rootsLegacy]} />
      <TwoMusicalWorlds locale={locale} />
      <SignatureWorks locale={locale} assets={assets} />
      <BeyondMusic locale={locale} />
      <RecognitionSection locale={locale} />
      <LookingAhead locale={locale} asset={assets[ABOUT_IMAGE_KEYS.lookingAheadBackground]} />
      <Manifesto locale={locale} asset={assets[ABOUT_IMAGE_KEYS.manifestoImage]} />
    </div>
  );
}
