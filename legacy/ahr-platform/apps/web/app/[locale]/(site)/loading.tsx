import { CardGridSkeleton } from "@/components/site";

/**
 * Implements: Milestone 8 §"Loading states." Overrides the generic
 * `app/[locale]/loading.tsx` (Milestone 3) specifically for the public
 * Website route group — a card-grid skeleton fits Website's card-heavy
 * listings better than the Dashboard's row-skeleton.
 */
export default function SiteLoading() {
  return <CardGridSkeleton />;
}
