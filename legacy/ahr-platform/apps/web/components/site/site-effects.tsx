"use client";

import { useEffect, useState } from "react";
import { IntroSplash } from "./intro-splash";

/**
 * Implements: the interactive behaviors from the live site's own
 * site-additional.css/inline scripts (content/Master-Content-Dataset/
 * 12-Source-Files/Website-Archive/), ported to React: scroll-progress bar
 * fill, a "back to top" button that appears after 400px, the header's
 * scroll-aware transparent→white swap, and the mobile hamburger menu
 * toggle. Kept as one small client component so every public page (via
 * the shared `(site)/layout.tsx`) gets identical behavior automatically,
 * matching the live site's own "unified across all pages" fix. The intro
 * splash itself now lives in `IntroSplash` (Global Experience spec,
 * 2026-07-24) — this component just mounts it once alongside everything
 * else.
 */
export function SiteEffects({
  siteName,
  tagline,
  locale,
}: {
  siteName: string;
  tagline: string;
  locale: "ar" | "en";
}) {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowBackToTop(scrollTop > 400);

      const nav = document.querySelector(".site-theme nav");
      nav?.classList.toggle("nav-scrolled", scrollTop > 60);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Mirrors the live site's own toggle: clicking the hamburger icon
    // adds/removes a class on the nav-links list, shown/hidden via CSS.
    const toggle = document.querySelector(".menu-toggle");
    function handleClick() {
      setMenuOpen((open) => !open);
    }
    toggle?.addEventListener("click", handleClick);
    return () => toggle?.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const links = document.querySelector(".nav-links");
    links?.classList.toggle("active", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    // Global Experience spec §8 "Image Loading" — fade newly-loading images
    // in, never images already cached/complete (no flicker, no layout
    // shift: only `opacity` is touched, width/height are untouched).
    function prepare(img: HTMLImageElement) {
      if (img.dataset.fadeHandled) return;
      img.dataset.fadeHandled = "true";
      if (img.complete && img.naturalWidth > 0) return;
      img.style.opacity = "0";
      img.style.transition = "opacity .5s ease";
      const reveal = () => {
        img.style.opacity = "1";
      };
      img.addEventListener("load", reveal, { once: true });
      img.addEventListener("error", reveal, { once: true });
    }

    document.querySelectorAll("img").forEach((img) => prepare(img as HTMLImageElement));

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node instanceof HTMLImageElement) prepare(node);
          node.querySelectorAll?.("img").forEach((img) => prepare(img as HTMLImageElement));
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <IntroSplash siteName={siteName} roles={tagline} locale={locale} />
      <button
        type="button"
        className={`back-to-top ${showBackToTop ? "show" : ""}`}
        aria-label="Back to top"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </>
  );
}
