import { Image as ImageIcon } from "lucide-react";
import type { PlaceholderContent } from "./voice-training-content";

/**
 * Elegant image placeholder for slots with no real asset yet — mirrors
 * components/about/image-placeholder.tsx's convention (border, dark
 * surface, centered icon, naming label) so a real photo can be dropped in
 * later without touching layout.
 */
export function MediaPlaceholder({
  content,
  locale,
  className = "",
}: {
  content: PlaceholderContent;
  locale: "ar" | "en";
  className?: string;
}) {
  return (
    <div className={`vt-media-frame ${className}`}>
      <ImageIcon className="h-8 w-8 text-white/30" strokeWidth={1.25} aria-hidden />
      <div>
        <p className="text-sm tracking-wide text-white/70">{content.label[locale]}</p>
        <p className="mt-1 text-xs text-white/40">{content.sublabel[locale]}</p>
      </div>
    </div>
  );
}
