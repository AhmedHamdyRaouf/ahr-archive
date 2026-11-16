"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Implements: Global Experience & Intro Screen (Final Direction, data
 * owner spec, 2026-07-24) §9 "Custom Cursor" — replaces the pointer with
 * a circular "View" indicator while hovering any element marked
 * `data-cursor="view"` (gallery/artwork images). Skipped entirely on
 * touch/coarse-pointer devices, which have no hover concept to replace.
 */
export function GalleryCursor({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    function onMove(e: MouseEvent) {
      const el = dotRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      const target = e.target as Element | null;
      setVisible(Boolean(target?.closest('[data-cursor="view"]')));
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[999998] flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/40 text-[11px] uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {label}
    </div>
  );
}
