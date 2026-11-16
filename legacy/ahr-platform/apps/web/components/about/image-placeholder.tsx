import { Image as ImageIcon } from "lucide-react";
import type { PlaceholderContent } from "./about-content";

/**
 * Spec: "Do NOT use final images ... create elegant image placeholders."
 * Every placeholder keeps the final aspect ratio, a subtle border, a dark
 * gray background, a centered icon, and a label naming the eventual asset
 * — swapped for a real image later without touching layout.
 */
export function ImagePlaceholder({
  content,
  locale,
  aspectClassName = "aspect-[4/5]",
  className = "",
  gallery = false,
}: {
  content: PlaceholderContent;
  locale: "ar" | "en";
  aspectClassName?: string;
  className?: string;
  /** Marks this placeholder for the site-wide custom "View" cursor (Global Experience spec §9). */
  gallery?: boolean;
}) {
  return (
    <div
      data-cursor={gallery ? "view" : undefined}
      className={`relative flex ${aspectClassName} w-full flex-col items-center justify-center gap-3 border border-white/15 bg-[#141414] px-6 text-center ${className}`}
    >
      <ImageIcon className="h-8 w-8 text-white/30" strokeWidth={1.25} aria-hidden />
      <div>
        <p className="about-heading text-sm tracking-wide text-white/70">{content.label[locale]}</p>
        <p className="mt-1 text-xs text-white/40">{content.sublabel[locale]}</p>
      </div>
    </div>
  );
}
