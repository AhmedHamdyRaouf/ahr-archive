"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Implements: Global Experience & Intro Screen (Final Direction, data
 * owner spec, 2026-07-24) §6 "Page Transition" — a simple 300-400ms fade
 * on internal navigation (never replaying the intro splash, which lives
 * separately in SiteEffects and doesn't depend on `pathname`), plus
 * §8 "Scroll to Top" on every *new* navigation after the first.
 *
 * Updated 2026-07-24 (Works Page rebuild) — skips the scroll-to-top for
 * browser back/forward navigation, so returning from a Work detail page
 * to /works via the back button keeps the browser's own native scroll
 * restoration (or a page's own explicit restore logic, e.g. WorksArchive)
 * instead of fighting it back to the top — required by the Works page's
 * "preserve scroll position" requirement, and the objectively correct
 * behavior for any page, not just this one.
 *
 * Detected via `window.history.length` rather than a `popstate` listener
 * — a `popstate` flag set from a separate event listener isn't reliably
 * ordered relative to Next's own internal router listener (which is
 * registered earlier and can flush its `pathname` update, and this
 * component's effect along with it, before this component's own
 * `popstate` callback runs), so the flag was frequently still `false` by
 * the time this effect read it. `history.length` doesn't need any event
 * ordering: a `pushState` (new Link navigation) always increases it; a
 * back/forward traversal never does — reading it synchronously inside
 * the pathname effect, after the navigation has already landed, is
 * unambiguous.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const previousHistoryLength = useRef(typeof window === "undefined" ? 0 : window.history.length);

  useEffect(() => {
    const currentLength = window.history.length;
    const isBackOrForward = currentLength <= previousHistoryLength.current;
    previousHistoryLength.current = currentLength;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isBackOrForward) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div key={pathname} className="site-page-fade">
      {children}
    </div>
  );
}
