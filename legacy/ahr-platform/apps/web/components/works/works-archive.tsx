"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ARCHIVE_CONTENT, SORT_OPTIONS, WORK_TYPE_FILTERS } from "./works-content";
import { WorkCard, type WorkCardData } from "./work-card";
import { SiteEmptyState } from "@/components/site";

const PAGE_SIZE = 12;

interface ApiResponse {
  data: WorkCardData[];
  meta: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

/**
 * Implements: Works Page editorial rebuild (data owner spec, 2026-07-24) —
 * the interactive archive: search/filter/sort/view-toggle + infinite
 * scroll, all synced to URL search params (`q`, `type`, `sort`, `view`,
 * `page`) so filters/sort/view/scroll survive a visit to a Work detail
 * page and back via the browser's own history — see PageTransition's
 * popstate guard, which skips the scroll-to-top it applies on *new*
 * navigations so back/forward restoration isn't fought.
 */
export function WorksArchive({
  initialItems,
  initialMeta,
  locale,
}: {
  initialItems: WorkCardData[];
  initialMeta: ApiResponse["meta"];
  locale: "ar" | "en";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";
  const sort = searchParams.get("sort") ?? "year_desc";
  const view = searchParams.get("view") === "grid" ? "grid" : "editorial";

  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta);
  const [searchInput, setSearchInput] = useState(q);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Captured once, synchronously, during this component's very first
  // render — i.e. before any effect (including the scroll-save listener
  // below) has a chance to run. Reading sessionStorage from inside an
  // effect instead was racing that same listener: on the remount after
  // coming back from a Work detail page, an incidental scroll/layout
  // event could fire and overwrite the saved entry with 0 before the
  // restore effect got to read it — a `useState` initializer is the one
  // place guaranteed to run before every effect.
  const [pendingScrollRestore] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("works-archive-scroll");
      sessionStorage.removeItem("works-archive-scroll");
      if (!raw) return null;
      const saved = JSON.parse(raw) as { url: string; y: number };
      return saved.url === window.location.pathname + window.location.search ? saved.y : null;
    } catch {
      return null;
    }
  });

  const paramsKey = `${q}|${type}|${sort}`;
  const paramsKeyRef = useRef(paramsKey);
  const loadedPagesRef = useRef(initialMeta.page);

  const updateUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "" || value === "all" || (key === "page" && value === "1")) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      // `router.replace` re-renders the Server Component tree (WorksListPage
      // reads these same params for its own SSR fetch), which in dev mode
      // can lag ~600-1000ms behind the client-side content update above.
      // If the visitor clicks into a Work before that resolves, the
      // browser history entry for /works is still missing `page=`, so
      // going back restores fewer items than were actually loaded. Committing
      // the visible URL/history entry synchronously first (native API,
      // no server round-trip) closes that race; `router.replace` right
      // after keeps Next's own router state consistent.
      window.history.replaceState(window.history.state, "", url);
      router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const fetchPage = useCallback(
    async (pageToLoad: number, pageSize: number, signal?: AbortSignal): Promise<ApiResponse> => {
      const qp = new URLSearchParams();
      qp.set("page", String(pageToLoad));
      qp.set("pageSize", String(pageSize));
      if (q) qp.set("q", q);
      if (type !== "all") qp.set("type", type);
      qp.set("sort", sort);
      const res = await fetch(`/api/works?${qp.toString()}`, { signal });
      return res.json();
    },
    [q, sort, type],
  );

  // Filters/sort/search changed — reload from scratch (page 1).
  useEffect(() => {
    if (paramsKeyRef.current === paramsKey) return;
    paramsKeyRef.current = paramsKey;
    loadedPagesRef.current = 1;

    const controller = new AbortController();
    setRefreshing(true);
    fetchPage(1, PAGE_SIZE, controller.signal)
      .then((json) => {
        setItems(json.data);
        setMeta(json.meta);
      })
      .catch(() => {})
      .finally(() => setRefreshing(false));

    return () => controller.abort();
  }, [paramsKey, fetchPage]);

  // Explicit save/restore of scroll position across a visit to a Work
  // detail page and back, keyed to sessionStorage rather than relying
  // solely on the browser's native back/forward restoration — that native
  // restoration fires against whatever content height exists the instant
  // this component mounts, which can be too short while the reconciliation
  // fetch below is still topping items back up, landing the scroll short.
  // Keeps sessionStorage continuously up to date with the live scroll
  // position rather than saving on a "leaving" event — Next.js client-side
  // route transitions never unload the document, so `pagehide`/
  // `beforeunload` never fire for a plain `<Link>` navigation.
  // Once the visitor has clicked a link out of the archive, the snapshot
  // is final — ignore any further scroll events. Without this, the
  // *destination* page's own "scroll to top on a new navigation"
  // (PageTransition) fires a scroll event that this component's own
  // listener can still catch in the brief window before it unmounts,
  // overwriting the correct saved position with 0.
  const navigatingAwayRef = useRef(false);

  const saveScrollSnapshot = useCallback(() => {
    if (navigatingAwayRef.current) return;
    sessionStorage.setItem(
      "works-archive-scroll",
      JSON.stringify({ url: window.location.pathname + window.location.search, y: window.scrollY }),
    );
  }, []);

  useEffect(() => {
    // The browser's own automatic back/forward scroll restoration races
    // the manual `restoreScroll` below and — since it isn't tied to the
    // reconciliation fetch — tends to win, snapping back to whatever it
    // computed against the shorter, not-yet-topped-up content. Handing
    // restoration entirely to our own sessionStorage-driven logic while
    // this component is mounted avoids that fight; restored on unmount so
    // the rest of the site keeps native restoration.
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        saveScrollSnapshot();
      });
    }
    // Deliberately no initial saveScrollSnapshot() call here — a freshly
    // mounted instance always starts at scrollY 0, and saving that
    // immediately would overwrite the entry restoreScroll below is about
    // to read (written by the *previous* instance right before this one
    // mounted, e.g. via the click-capture handler).
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      window.history.scrollRestoration = previous;
    };
  }, [saveScrollSnapshot]);

  // Fires on the mousedown/click capture phase — before Next's `<Link>`
  // navigation logic and before the destination page mounts — so this is
  // always the true, final pre-navigation scroll position.
  const handleArchiveClickCapture = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if ((event.target as HTMLElement).closest("a")) {
        // Order matters: `saveScrollSnapshot` itself checks
        // `navigatingAwayRef` and no-ops once it's set, so this final,
        // authoritative save has to happen *before* the flag flips —
        // only later (scroll-listener-triggered) saves should be blocked.
        saveScrollSnapshot();
        navigatingAwayRef.current = true;
      }
    },
    [saveScrollSnapshot],
  );

  // `loadMore`'s URL update (via `history.replaceState`) happens
  // asynchronously, after the fetch it follows resolves — a scroll can
  // finish (and get saved above) well before that URL update lands,
  // leaving the saved snapshot's `url` stale even though its `y` is
  // already correct. Re-saving whenever `meta.page` changes re-captures
  // the snapshot once the URL has actually caught up. Skips the mount
  // render deliberately — firing there (including React Strict Mode's
  // double-invoke in dev) would unconditionally save scrollY 0 before
  // restoreScroll below gets a chance to read whatever the *previous*
  // instance actually left behind, the same clobbering bug as the
  // scroll-listener effect above, through a different path.
  const isFirstPageEffectRef = useRef(true);
  useEffect(() => {
    if (isFirstPageEffectRef.current) {
      isFirstPageEffectRef.current = false;
      return;
    }
    saveScrollSnapshot();
  }, [meta.page, saveScrollSnapshot]);

  // Next.js's client-side back-navigation can serve a stale RSC-cached
  // payload for this same pathname — a direct server request for the
  // identical URL (confirmed via curl) returns the correct item count,
  // but the cached client navigation sometimes doesn't. Reconcile once on
  // mount by re-reading `page` straight from the address bar and topping
  // up if the props we were mounted with came in short — this is what
  // actually makes "return from a Work page keeps everything I'd loaded"
  // reliable, independent of that caching behavior. Scroll is restored
  // only after that top-up (if any) has actually landed in the DOM.
  useEffect(() => {
    function restoreScroll() {
      if (pendingScrollRestore === null) return;
      // Next.js's own App Router scroll handling can still run after this
      // point and reset to (0,0) — re-applying a few times over the next
      // ~300ms lets ours win regardless of exactly when that happens,
      // without needing to hook into Next's internals directly.
      for (const delay of [0, 50, 150, 300]) {
        window.setTimeout(() => window.scrollTo({ top: pendingScrollRestore, behavior: "instant" as ScrollBehavior }), delay);
      }
    }

    const urlPage = Math.max(1, Number(new URLSearchParams(window.location.search).get("page") ?? "1") || 1);
    const expectedCount = urlPage * PAGE_SIZE;

    if (urlPage > 1 && initialItems.length < expectedCount) {
      setRefreshing(true);
      fetchPage(1, expectedCount)
        .then((json) => {
          setItems(json.data);
          setMeta(json.meta);
          loadedPagesRef.current = urlPage;
        })
        .finally(() => {
          setRefreshing(false);
          requestAnimationFrame(() => requestAnimationFrame(restoreScroll));
        });
    } else {
      requestAnimationFrame(() => requestAnimationFrame(restoreScroll));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingScrollRestore]);

  // Debounce the search input into the `q` URL param.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== q) updateUrl({ q: searchInput || null, page: null });
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Ref-based re-entrancy guard, not just the `loadingMore` state — the
  // IntersectionObserver can fire again before React re-renders with the
  // updated state, which was letting a large `rootMargin` cascade through
  // several pages in one uninterrupted burst instead of one page at a time.
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current || loadedPagesRef.current >= meta.totalPages) return;
    loadingRef.current = true;
    setLoadingMore(true);
    const nextPage = loadedPagesRef.current + 1;
    fetchPage(nextPage, PAGE_SIZE)
      .then((json) => {
        loadedPagesRef.current = nextPage;
        setItems((prev) => [...prev, ...json.data]);
        setMeta(json.meta);
        updateUrl({ page: String(nextPage) });
      })
      .finally(() => {
        loadingRef.current = false;
        setLoadingMore(false);
      });
  }, [fetchPage, meta.totalPages, updateUrl]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const hasMore = loadedPagesRef.current < meta.totalPages;

  return (
    <section className="works-section" onClickCapture={handleArchiveClickCapture}>
      <div className="container">
        <div className="section-header">
          <p className="section-count">{ARCHIVE_CONTENT.eyebrow[locale]}</p>
          <h2>{ARCHIVE_CONTENT.heading[locale]}</h2>
          <div className="section-line" />
        </div>

        <div className="filters-section works-filters-section">
          <div className="filters">
            {WORK_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`filter-btn ${type === f.value || (f.value === "all" && type === "all") ? "active" : ""}`}
                onClick={() => updateUrl({ type: f.value, page: null })}
              >
                {f.label[locale]}
              </button>
            ))}
          </div>

          <div className="works-toolbar">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={ARCHIVE_CONTENT.searchPlaceholder[locale]}
              className="works-search-input"
              aria-label={ARCHIVE_CONTENT.searchPlaceholder[locale]}
            />

            <select
              value={sort}
              onChange={(e) => updateUrl({ sort: e.target.value, page: null })}
              className="works-sort-select"
              aria-label={ARCHIVE_CONTENT.sortLabel[locale]}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label[locale]}
                </option>
              ))}
            </select>

            <div className="works-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={view === "editorial" ? "active" : ""}
                onClick={() => updateUrl({ view: null })}
              >
                {ARCHIVE_CONTENT.editorialView[locale]}
              </button>
              <button
                type="button"
                className={view === "grid" ? "active" : ""}
                onClick={() => updateUrl({ view: "grid" })}
              >
                {ARCHIVE_CONTENT.gridView[locale]}
              </button>
            </div>
          </div>
        </div>

        {items.length === 0 && !refreshing ? (
          <SiteEmptyState message={ARCHIVE_CONTENT.noResults[locale]} />
        ) : (
          <div className={view === "grid" ? "work-tile-grid" : "work-tile-masonry"}>
            {refreshing
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="work-tile-skeleton work-tile-medium" />)
              : items.map((work) => (
                  <WorkCard key={work.id} work={work} locale={locale} forceUniform={view === "grid"} />
                ))}
          </div>
        )}

        <div ref={sentinelRef} aria-hidden className="h-1 w-full" />

        {loadingMore ? (
          <div className="work-tile-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="work-tile-skeleton work-tile-medium" />
            ))}
          </div>
        ) : null}

        {!hasMore && items.length > 0 ? (
          <p className="works-end-message">{ARCHIVE_CONTENT.endOfArchive[locale]}</p>
        ) : null}
      </div>
    </section>
  );
}
