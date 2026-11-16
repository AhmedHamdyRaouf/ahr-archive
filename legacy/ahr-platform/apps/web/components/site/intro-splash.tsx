"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TAGLINES: Record<"ar" | "en", [string, string]> = {
  en: ["Every Voice Has a Story.", "Where Hearts Find Their Voice."],
  ar: ["لكل صوتٍ حكاية.", "حيث تجد القلوب صوتها."],
};

const TOTAL_MS = 3000;

/**
 * Implements: Global Experience & Intro Screen (Final Direction, data
 * owner spec, 2026-07-24) §1-3 — supersedes the previous plain loader.
 * Rendered once by `SiteEffects` inside the shared (site) layout, which
 * Next.js keeps mounted across client-side navigation between site pages
 * — so this naturally replays only on an actual document load (first
 * visit or a hard refresh), never on an internal `<Link>` navigation,
 * with no sessionStorage gate needed.
 */
export function IntroSplash({
  siteName,
  roles,
  locale,
}: {
  siteName: string;
  roles: string;
  locale: "ar" | "en";
}) {
  const [visible, setVisible] = useState(true);
  const [first, second] = TAGLINES[locale];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => setVisible(false), TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center gap-4 bg-black px-6 text-center"
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: TOTAL_MS / 1000, times: [0, 0.933, 1], ease: "easeInOut" }}
      aria-hidden
    >
      <motion.span
        className="font-display text-3xl tracking-[0.35em] text-[var(--color-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        AHR
      </motion.span>

      <motion.span
        className="font-display text-2xl text-white sm:text-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
      >
        {siteName}
      </motion.span>

      <motion.span
        className="font-body text-xs uppercase tracking-[0.2em] text-white/60 sm:text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
      >
        {roles}
      </motion.span>

      <div className="relative mt-2 h-6 w-full max-w-md sm:h-7">
        <motion.p
          className="font-display absolute inset-x-0 italic text-[var(--color-primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 1.7, duration: 1.0, times: [0, 0.2, 0.75, 1], ease: "easeInOut" }}
        >
          {first}
        </motion.p>
        <motion.p
          className="font-display absolute inset-x-0 italic text-[var(--color-primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1] }}
          transition={{ delay: 1.7, duration: 1.3, times: [0, 0.65, 1], ease: "easeInOut" }}
        >
          {second}
        </motion.p>
      </div>
    </motion.div>
  );
}
