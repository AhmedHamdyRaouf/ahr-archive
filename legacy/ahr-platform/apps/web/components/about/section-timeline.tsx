"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TIMELINE_SECTIONS } from "./about-content";

/**
 * Persistent scroll timeline — deliberately pinned to the physical right
 * edge of the viewport in both locales (a chrome rail, not page content),
 * per spec "Right Side Timeline". Section text elsewhere adapts per
 * locale naturally via dir-aware flex; this rail does not mirror.
 */
export function SectionTimeline({ locale }: { locale: "ar" | "en" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      TIMELINE_SECTIONS.forEach((section, index) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollHeight > 0 ? window.scrollY / scrollHeight : 0);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Desktop: persistent vertical rail */}
      <div className="cine-timeline-desktop fixed right-6 top-1/2 z-40 -translate-y-1/2 flex-col items-center gap-4">
        {TIMELINE_SECTIONS.map((section, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="group relative flex items-center justify-center"
              aria-label={section.label[locale]}
              aria-current={isActive}
            >
              <span
                className="pointer-events-none absolute right-full mr-4 whitespace-nowrap rounded-sm border border-white/10 bg-black/80 px-3 py-1 text-xs text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                {section.label[locale]}
              </span>
              <motion.span
                animate={{
                  scale: isActive ? 1.1 : 1,
                  borderColor: isActive ? "var(--about-gold)" : "rgba(255,255,255,0.2)",
                  color: isActive ? "var(--about-gold)" : "rgba(255,255,255,0.5)",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="about-heading flex h-8 w-8 items-center justify-center rounded-full border bg-black/40 text-[11px] tracking-widest backdrop-blur-sm"
              >
                {section.number}
              </motion.span>
            </button>
          );
        })}
      </div>

      {/* Mobile: floating progress indicator */}
      <div className="cine-timeline-mobile fixed inset-x-0 bottom-0 z-40">
        <div className="h-[2px] w-full bg-white/10">
          <div
            className="h-full bg-[var(--about-gold)] transition-[width] duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        <div className="flex justify-end px-4 py-2">
          <span className="about-heading rounded-full border border-white/15 bg-black/80 px-3 py-1 text-[11px] text-white/70">
            {TIMELINE_SECTIONS[activeIndex]?.number} / {TIMELINE_SECTIONS.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </>
  );
}
