# External Verification Addendum — 2026-07-21

**Performed by:** Claude, at the data owner's explicit request to resolve the open items in `Import_Readiness_Report.md` / `Validation_Report.md` against the live official website (`https://ahmedhamdyraouf.com`) and public external databases (ElCinema, IMDb).
**Method:** Direct fetch of the live site's Home, About, Works, and Contact pages (English), plus targeted web searches of the two disputed ElCinema profile IDs and the disputed IMDb profile ID. All findings below are traceable to a live, public URL fetched or searched on this date.

---

## Resolved

### C-01 — Contact email
**Finding:** The live site's Home and Contact pages (English) both show only `a.h.r@msn.com` (`mailto:a.h.r@msn.com`), labelled "For official collaborations." `contact@ahmedhamdyraouf.com` does not appear anywhere on the current live site.
**Resolution:** `a.h.r@msn.com` is confirmed as the current canonical contact email. No file changes needed — `person.csv`/`media_asset.csv` did not hold a competing email value; this closes the open question in the Import Readiness Report.

### C-02 — ElCinema profile ID
**Finding:** Searched both disputed IDs directly:
- `elcinema.com/person/2024870/` → title "محمد حمدي رؤوف" (**Mohamed** Hamdy Raouf), a musician whose bio states he was born in Alexandria's Mahram Bek quarter, studied violin at the Higher Institute of Arabic Music, played piano, and was a member of a children's choir in 1994 under conductor "Hamdy Raouf." **This is a different, real individual — not the platform's subject.**
- `elcinema.com/person/1990118/` → title "أحمد حمدي رؤوف" (**Ahmed** Hamdy Raouf) — matches the subject's name exactly.
**Resolution:** `https://elcinema.com/person/1990118/` is confirmed correct for PER-0001. The dataset's `media_asset.csv` (MED-0031) and `press_mention.csv` (PRESS-34, PRESS-48) already use this value — confirmed correct, no change needed. `2024870` is not a stale duplicate to reconcile; it is someone else's profile and should not be referenced for PER-0001 anywhere.

### C-03 / C-04 — Spotify / SoundCloud links
**Finding:** The live site's Home and Contact pages link to `open.spotify.com/intl-ar/artist/3z8FLVunc5rHdg8Ixx2Lch` (Spotify) and `soundcloud.com/AhmedHamdyRaouf` (SoundCloud) — the `/intl-ar/` segment is a locale prefix on the same artist ID already adopted as canonical (MED-0025, MED-0027).
**Resolution:** Confirmed — the dataset's existing choice (Press_Final's "corrected" links) matches the live site. No change needed.

### C3 (Gap Analysis / Decision Log) — Contact page mechanism
**Finding:** The live Contact page has no form-submission backend at all — it is a direct-channels page (WhatsApp ×2 numbers, Telegram, email, social platforms, streaming platforms, professional profiles).
**Resolution:** The public Contact page requires no `POST`-handling backend; it needs only static/CMS-managed link content. Recorded in `Decision-Log.md`.

## Partially Resolved — Recommend Data-Owner Confirmation Before Final Merge

### C-08 — IMDb dual profile (`nm14146970` vs `nm5770871`)
**Finding:** `imdb.com/name/nm5770871` credits "Mohamed hamdy Rouf," Music Department, known for "Shadow and Mirror" (2012) — the English title of "ضل ومراية" (Dhel We Meraya). Combined with the C-02 finding above (a real, separate "Mohamed Hamdy Raouf" with his own filmography and an Alexandria childhood-choir connection to a conductor named "Hamdy Raouf"), this profile most plausibly belongs to that same separate individual — not to Ahmed Hamdy Raouf (PER-0001) under a misspelling.
**Not unilaterally changed:** `person_name_variant.csv` (NV-10) currently files this under PER-0001 as a "Common error" name variant. Given the new evidence this may actually be **PER-0024's** IMDb credit rather than a misspelled duplicate of PER-0001, this record should be re-pointed from PER-0001 to PER-0024 — **but only once the data owner confirms** whether PER-0024 ("Mohamed Hamdy Raouf," arranger) is indeed a separate person (possibly a relative) from PER-0001, per the still-open question already flagged in `Import_Readiness_Report.md` item 6. No CSV row was altered by this addendum; this is a recommendation, not an applied fix.

## Still Open (not addressable from the sources available)
- The ~28 additional songs and ~40 additional theatre works referenced only by aggregate counts (no itemized source found on the live site's static pages — the Works page loads data from a separate Google Sheet not reachable by this tool).
- The 10 homepage images (hot-linked to the live WordPress media library) — image *files* still need to be supplied directly; their URLs are visible (see live site `wp-content/uploads/2026/05/...`) but the platform's Media Library requires the actual files, not hot-linked URLs, for permanent storage.
