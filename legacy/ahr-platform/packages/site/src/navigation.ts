/**
 * Implements: Sitemap, Navigation System (Phase 3); UI/UX Specification,
 * Navigation (doc 03) — public primary navigation. Search (Package 09,
 * Milestone 9) is intentionally NOT a primary nav item — Sitemap never
 * listed it as a page in the navigation tree; it is a SearchBar in
 * SiteHeader (UI/UX Specification, Design System doc 02) that submits to
 * the Search results page.
 *
 * Updated 2026-07-26 (data owner request): "Projects" removed from the
 * primary nav — the `project` entity, its CMS screens, and its public
 * `/projects`, `/projects/[slug]` routes are unchanged and still reachable
 * directly, just no longer linked from the nav. "Voice Training" takes its
 * slot, backed by a new static editorial page (see
 * apps/web/app/[locale]/(site)/voice-training/page.tsx) — see
 * docs/Architecture/Information-Architecture/02 - Sitemap.md and
 * 03 - Navigation System.md for the updated rationale.
 */

import type { Locale } from "./locale";

export interface NavItem {
  route: string; // path segment, "" for Home
  labelAr: string;
  labelEn: string;
}

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { route: "", labelAr: "الرئيسية", labelEn: "Home" },
  { route: "about", labelAr: "نبذة", labelEn: "About" },
  { route: "works", labelAr: "الأعمال", labelEn: "Works" },
  { route: "voice-training", labelAr: "تدريب صوتي", labelEn: "Voice Training" },
  { route: "media", labelAr: "الوسائط", labelEn: "Media" },
  { route: "recognition", labelAr: "التكريمات", labelEn: "Recognition" },
  { route: "contact", labelAr: "تواصل", labelEn: "Contact" },
];

export function getNavLabel(item: NavItem, locale: Locale): string {
  return locale === "ar" ? item.labelAr : item.labelEn;
}

export function getNavHref(item: NavItem, locale: Locale): string {
  return item.route ? `/${locale}/${item.route}` : `/${locale}`;
}
