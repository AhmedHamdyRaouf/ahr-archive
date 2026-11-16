Ahmed Hamdy Raouf — Website Source Archive
===========================================
Organized: /en (English pages) | /ar (Arabic pages) | /assets/css

Files (same name in en/ and ar/):
  home.html, about.html, works.html, dandana.html,
  training.html, contact.html, voice-test.html

What changed in this pass:
- Unified navigation menu (identical links, order, and labels) across ALL 14 pages.
  Previously there were 4 different nav designs (nav-links / vt-nav / ct-nav / pt-nav)
  with missing links (Gallery, About) and broken anchor links on several pages.
- voice-test-ar.html had NO navigation menu at all — added.
- contact-en.html: "السينما.كوم" -> "Elcinema.com" (was showing Arabic on the English page).
- voice-test-en.html: "Voice Over محترف" -> "Professional Voice Over".

FIX ADDED (regression found while testing): each page previously used a DIFFERENT mobile-menu
toggle script (different ids like #menuBtn/#navLinks, #vtMobEN, #ctMobEN, #dnMobEN...).
Unifying the nav HTML alone would have silently broken the mobile hamburger button on
About/Works/Training/Contact/Dandana/Voice-Test. Added one small universal toggle script
(class-based, matches nav-links everywhere) at the end of every page so it works consistently.
The old per-page toggle scripts still exist as dead code (harmless, ignored).

NOT included in this pass (left untouched, on purpose):
- Partners pages (partners-en / partners-ar) — per Ahmed's instruction, left unlinked, will be
  finished and connected later.
- Images are still linked to the live site (https://ahmedhamdyraouf.com/wp-content/uploads/...)
  — could not be downloaded automatically in this environment due to network restrictions.
  Send the 10 image files directly and they'll be embedded locally in the next pass.
- Old page-specific nav CSS (.vt-nav-en, .ct-nav-en, .pt-nav-en, etc.) still exists inside each
  page's <style> block as dead/unused code — harmless, but can be cleaned up on request.
- The AI-recommendation direct-browser API call in voice-test (known issue, tracked separately
  to be routed through the GAS deployment).


=== PASS 2 (this update) ===
- WhatsApp floating button added to Training/Contact/Dandana/Voice-Test (was only on Home/About/Works).
- Alt text added to all static <img> tags (11 images on the homepage had none).
- hreflang tags added to every page's <head>, linking each EN page to its AR counterpart
  and vice versa (helps Google treat them as language versions of the same content, not
  duplicate/unrelated pages).


=== PASS 3 (icons) ===
- Contact page: replaced emoji placeholders (was showing generic emoji like a green circle,
  a musical note, an apple emoji instead of real logos) with real brand icons for Streaming
  Platforms and Professional Profiles sections.
  Source: cdn.simpleicons.org for Spotify/Apple Music/YouTube Music/SoundCloud/Deezer/
  IMDb/Discogs/Wikipedia/Clubhouse. cdn.jsdelivr.net (dashboard-icons project) for
  Anghami/Amazon Music/Odysee, which are not in Simple Icons.
- Elcinema (السينما.كوم) kept its film-reel emoji - no real brand icon is available for
  this platform in either icon library. Can be swapped for a downloaded logo if you have one.
- If any single icon does not load correctly in your browser, tell me which one and I will
  swap its source (a couple of the smaller-platform slugs were not 100% verifiable from here).
- The Social Media section (YouTube/Facebook/Instagram/etc.) already had real icons - untouched.


=== PASS 4 (effects unified across all 14 pages) ===
- Splash/welcome screen (logo zoom-in): now on every page, not just Home. Shortened from
  ~8.5 seconds total to exactly 4 seconds.
- Scroll-reveal fade-in: unified into one shared script (IntersectionObserver-based, more
  modern/efficient than the old scroll-listener approach). Same timing and behavior on
  every single page now, including Training/Contact/Dandana which had no reveal effect
  before at all.
- Animated number counters: stat numbers (e.g. 25+, 1,200, 1,400) now count up from 0 when
  scrolled into view, on About/Training/Works. Note: on the Works page specifically, numbers
  load dynamically from Google Sheets - the count-up should work in most cases but depends
  on the data having already loaded by the time the element is scrolled into view.
- Back-to-top button: added bottom-left on every page (WhatsApp button stays bottom-right),
  appears after scrolling down 400px.
- Reading progress bar: thin gold bar at the very top of every page that fills as you scroll.
- All of the above is progressive enhancement - if JavaScript fails to load for any reason,
  content remains visible (never hidden by default), just without the animation.


=== BUGFIX (found from your report) ===
- The scroll-reveal effect was hiding content (opacity:0) on large sections/paragraphs
  (like the About text block on the Home page) and never revealing it. Cause: the
  visibility threshold (15% of the element's own area must be on-screen) was too strict
  for tall elements - a tall block needs a LOT of scrolling before 15% of its huge area
  is visible, so it stayed invisible far longer than expected, looking broken.
  Fixed: now triggers as soon as any part of the element enters the view. Applied to all
  14 pages.


=== FULL FILE REVIEW (deep structural audit of all 14 pages) ===
Checked: DOCTYPE/html/head/body structure, div/section/script tag balance, nav consistency
(9 links incl. language switch on every page), image alt text, WhatsApp button, loader,
back-to-top, progress bar, hreflang tags, CSS brace balance, JS brace/parenthesis balance,
leftover emoji icons, Arabic text integrity.

Found and fixed ONE real bug (pre-existing in your live site, not something we introduced):
- About page (EN and AR) had a <div dir="ltr"...> (or rtl for AR) wrapping the ENTIRE
  page content that was NEVER closed anywhere in the original source. Browsers usually
  auto-close stray unclosed divs at the end of the page, so it may not have caused a
  visible problem for you, but it is invalid HTML and could affect layout/CSS inheritance
  unpredictably. Fixed by adding the missing closing </div> at the end of the page content
  in both languages.

Everything else (all 14 pages): fully balanced, no missing tags, no duplicate scripts,
no leftover emoji icons, no broken nav links, no missing alt text. Confirmed clean.


=== WORKS PAGE CODE UPDATE (this update) ===
Adding (EN) columns to the Google Sheet alone does NOT make the English Works page use them -
the site's JavaScript reads specific hardcoded column names, and most descriptive fields
(Type, Notes, Details, Cast, Director, Venue, Producer, Writer, Category, Location, Description)
were being read from a single Arabic-only column shared by both language versions.

Fixed: updated en/works.html so every one of those fields now prefers the new (EN) column and
automatically falls back to the original Arabic column if the English one is ever empty for a
specific row - so nothing breaks even before you finish reviewing every translation.

ar/works.html was left completely untouched - the Arabic page keeps reading the original
columns exactly as before.

NEXT STEP: once you finish reviewing Ahmed_Hamdy_Raouf_COMPLETE_DATABASE_MERGED.xlsx and publish
it as the new Google Sheet source (replacing the old CSV publish links in works-en.html /
works-ar.html with the new ones), the English Works page will start showing real English
descriptions instead of Arabic text.


=== SECOND CODE FIX (found while double-checking your report of remaining Arabic) ===
You were right — first pass missed several fields that ALSO had no English fallback:
Artist, Lyricist, Composer, Arranger (Singles + Drama & Film), Soundtrack (Drama & Film),
Role (Concerts tab specifically - different column key than Theatre/Drama), and Type
(Awards tab specifically - different column key than the generic Type used elsewhere).

Added Artist/Lyricist/Composer/Arranger (EN) name transliterations to Singles and Drama & Film,
Soundtrack (EN) to Drama & Film, and Type (EN) to Awards & Recognition - all merged into the
same COMPLETE_DATABASE file. Updated en/works.html again with the same EN-preferred-with-
Arabic-fallback pattern for every one of these.

Every r[...] column reference in en/works.html has now been checked - the only Arabic-only
references left are proper award/festival names, source links, years, and streaming links,
none of which need translation.


=== LIVE SITE REVIEW FIXES (found by checking ahmedhamdyraouf.com directly) ===
1. Voice Test AR conditional fields ("have you trained before?" / "do you play an instrument?"):
   root cause was a CSS rule: #vt-app-ar .vt-cond { display:none !important; } - the !important
   permanently blocked the JavaScript from ever revealing the textarea, no matter what the user
   selected. Removed !important from the hide rule (kept it on margin-top). Fixed in ar/voice-test.html.

2. Anghami icon broken on Contact page: the icon was requested as .svg, but Anghami's icon is only
   available in PNG/WEBP format at the source I used - the .svg simply does not exist, causing a
   broken image. Switched to the correct .png path.

3. Amazon Music icon broken on Contact page: the exact slug "amazon-music" does not exist in the
   icon library I used - only a generic "amazon" icon exists. Switched to that as the closest
   available substitute. If you have an official Amazon Music logo file, send it and I will use
   that instead for better brand accuracy.

4. Training page said "9 assessment phases" (stat number, subtitle, and checklist item) in both
   languages, but the actual Voice Test only has 7 phases - a previously known mismatch that
   was still live. Corrected all three mentions in both en/training.html and ar/training.html to 7.

Also noted (not something to fix in these files): the live works-en page currently shows Arabic
stat-bar labels ("song and collaboration", etc.) with placeholder dashes. This text was not found
anywhere in the version exported on July 11, so it looks like a change made directly on the live
site since then, outside of what is in this zip - worth double-checking after your next deploy.


=== EMAIL UPDATE ===
Replaced a.h.r@msn.com with contact@ahmedhamdyraouf.com everywhere it appeared
(both the mailto link and the visible displayed text): Home and Contact pages,
English and Arabic.
