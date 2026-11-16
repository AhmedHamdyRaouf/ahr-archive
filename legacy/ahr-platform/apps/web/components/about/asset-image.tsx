import Image from "next/image";
import type { PlaceholderContent } from "./about-content";
import { ImagePlaceholder } from "./image-placeholder";
import type { ResolvedAsset } from "@/lib/asset-library";

/**
 * Renders a real, published Asset Library image when one exists for this
 * slot, falling back to the original `ImagePlaceholder` otherwise — so
 * uploading/publishing an asset under the matching `image_key` swaps the
 * image in with no further code change, and an unpublished slot keeps
 * degrading exactly the way it already did before the Asset Library
 * existed. Safe to use `next/image` unconditionally here: `asset` is only
 * ever resolved from a published+public row (lib/asset-library.ts), so
 * its URL is always a permanent public Storage URL, never a short-lived
 * signed one.
 */
export function AssetImage({
  asset,
  content,
  locale,
  aspectClassName = "aspect-[4/5]",
  className = "",
  gallery = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
}: {
  asset: ResolvedAsset | undefined;
  content: PlaceholderContent;
  locale: "ar" | "en";
  aspectClassName?: string;
  className?: string;
  gallery?: boolean;
  sizes?: string;
}) {
  if (!asset) {
    return (
      <ImagePlaceholder
        content={content}
        locale={locale}
        aspectClassName={aspectClassName}
        className={className}
        gallery={gallery}
      />
    );
  }

  const alt = (locale === "ar" ? asset.altTextAr : asset.altTextEn) || content.label[locale];

  return (
    <div
      data-cursor={gallery ? "view" : undefined}
      className={`relative flex ${aspectClassName} w-full overflow-hidden border border-[var(--about-gold)] ${className}`}
    >
      <Image
        src={asset.url}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: `${asset.focalX}% ${asset.focalY}%` }}
      />
    </div>
  );
}
