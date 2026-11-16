import Link from "next/link";
import { PRIMARY_NAV_ITEMS, getNavLabel, getNavHref, type Locale } from "@ahr/site";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchBar } from "./search-bar";

/**
 * Implements: UI/UX Specification, Navigation (doc 03) — public primary
 * navigation, matching the frozen Sitemap exactly. SearchBar (Milestone 9)
 * is a search box, not a nav link — Sitemap never listed "Search" as a
 * page in the navigation tree.
 *
 * Updated 2026-07-21: markup/classes now match the live site's own nav
 * exactly (`.logo`, `.nav-links`, `.menu-toggle` — see site-legacy.css),
 * so the ratified brand identity actually renders as designed. The nav
 * *items* themselves are unchanged (still the frozen Sitemap's Home/
 * About/Works/Projects/Media/Recognition/Contact) — the live site's own
 * Dandana/Training/Voice Test/Gallery items have no equivalent page in
 * this platform yet and are intentionally not added here without a real
 * page behind them.
 *
 * Updated 2026-07-25 (data owner request): the "Sign In" link (moved here
 * from the footer on 2026-07-21) is removed entirely — the dashboard is
 * no longer linked from the public site at all. `/{locale}/login` still
 * exists and still works; it's just no longer discoverable from the nav.
 *
 * Updated 2026-07-25 (data owner: "شكل ايقونة تغيير اللغه مش لطيف") — first
 * pass replaced the unstyled 🌐 emoji with an icon+pill (`.lang-btn-new`),
 * but the data owner wanted to compare real options; shown six live
 * previews and picked the two-segment sliding toggle ("Option B") — see
 * `locale-switcher.tsx`, which now renders its own self-contained
 * `.lang-toggle` pill, so the old icon + wrapper span here is gone.
 */
export function SiteHeader({ locale, siteName }: { locale: Locale; siteName: string }) {
  const [firstWord, ...rest] = siteName.split(" ");

  return (
    <nav>
      <Link href={`/${locale}`} className="logo">
        {firstWord} <span>{rest.join(" ")}</span>
      </Link>
      <div className="menu-toggle">
        <span />
        <span />
        <span />
      </div>
      <div className="nav-links">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <Link key={item.route || "home"} href={getNavHref(item, locale)}>
            {getNavLabel(item, locale)}
          </Link>
        ))}
        <SearchBar locale={locale} />
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </nav>
  );
}
