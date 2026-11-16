# AHR Master Content Dataset — Validation Report

Generated during initial import build. This report documents every issue detected while
normalizing the source workbooks and website archive. Nothing listed here has been
silently corrected — all conflicts are preserved in the data with both versions intact,
per the standing rule "if two sources conflict, preserve both versions and flag them."

---

## 1. CONFLICTING INFORMATION (both versions preserved — needs human decision)

| # | Field | Version A | Version B | Source A | Source B | Status |
|---|---|---|---|---|---|---|
| C-01 | Contact email | `a.h.r@msn.com` | `contact@ahmedhamdyraouf.com` | Complete_Archive_v2.xlsx, sheet "ملخص عام" | Website README.txt ("EMAIL UPDATE" pass note: replaced everywhere on Home/Contact, EN+AR) | The website is the more recent change per its own changelog, but the workbook was not updated to match. **Needs confirmation of the single correct current email.** |
| C-02 | ElCinema profile URL | `https://elcinema.com/person/2024870/` | `https://elcinema.com/person/1990118/` | Complete_Archive_v2.xlsx, "ملخص عام" + "الإعلام والصحافة" | Press_Archive.xlsx and Press_Final.xlsx (all references) | Two different ElCinema numeric IDs are used across the sources. Only one can be correct (or both exist and one is stale). **Needs verification against the live ElCinema page.** |
| C-03 | Spotify link | `https://tr.ee/WQgCluNeCf` (short link) | `https://open.spotify.com/artist/3z8FLVunc5rHdg8Ixx2Lch` | Complete_Archive_v2.xlsx, "ملخص عام" / "الهوية الرقمية" | Press_Final.xlsx, "الروابط الرسمية" (explicitly marked "⭐ مُصحَّح — الرابط الصحيح" / "corrected — the right link") | Press_Final self-identifies as the corrected version. Recommend treating Press_Final's link as current, but the older value is preserved in media_asset.csv notes rather than deleted. |
| C-04 | SoundCloud link | `https://on.soundcloud.com/bLe7mGj5iz1iBxCy5` (short link) | `https://soundcloud.com/ahmedhamdyraouf` | Complete_Archive_v2.xlsx | Press_Final.xlsx, "الروابط الرسمية" | Same pattern as C-03 — Press_Final appears to be the later, verified pass. |
| C-05 | Total documented songs vs. career total | "52 لحناً — تجاوزت المسيرة 80 لحناً" (52 documented, career total exceeds 80) | Only 52 individual song rows are actually itemized in any source | Complete_Archive_v2.xlsx, sheet "الألحان الغنائية", row 1 note | — | The ~28+ additional compositions referenced by the "80+" claim are **not itemized anywhere in the provided sources** and could not be built as work.csv records without inventing data. Flagged as an acknowledged gap, not fabricated. |
| C-06 | Total theatrical works vs. itemized theatrical works | "قرابة 60 عملاً مسرحياً" (approx. 60 theatrical works) | Only 20 productions are itemized with detail | Complete_Archive_v2.xlsx, sheet "الأعمال المسرحية", row 1 note | — | Same gap pattern as C-05: ~40 additional theatre works are referenced in the summary line but not listed individually anywhere provided. Not fabricated. |
| C-07 | Press-article total counts across the 3 workbooks | "47+" articles | "67+" articles/news items | Press_Archive.xlsx, "ملخص الأرشيف" (aggregate stat) | Press_Final.xlsx, "أشكال الاسم" (aggregate stat, v3.0 — labelled "مقال وخبر موثق") | Press_Final is versioned v3.0 and contains 49 itemized rows, more than either summary sheet's count claims once de-duplicated. The aggregate "headline stat" cells in both workbooks were not recalculated when new rows were added, so neither summary number matches the itemized row count exactly. Treat the itemized `press_mention.csv` (49 rows) as ground truth over either summary stat. |
| C-08 | IMDb identity | Primary profile `nm14146970` ("Ahmed Hamdy Raouf") | Secondary/separate profile `nm5770871` credited as "Mohamed hamdy Rouf" for the documentary "Dhel We Meraya" (ضل ومراية) | Press_Final.xlsx multiple sheets | Press_Final.xlsx, "أشكال الاسم" #10 and "المقالات والأخبار" #36 | Unclear whether this is the same person under a misspelled duplicate IMDb entry, or IMDb has genuinely split the filmography across two profiles. **Needs a decision on whether to merge or keep as a separate cross-reference** — currently kept as two separate media_asset rows (MED-0031-range via platforms list) plus a name_variant record (NV-10), not merged. |
| C-09 | Works page (live site) architecture vs. what could be captured here | Website `works.html` pages load data live from a published Google Sheet (5+ distinct CSV export gids), not from static HTML | The .xlsx workbooks provided appear to be an earlier/parallel export of similar data, referred to in the site's own README as "Ahmed_Hamdy_Raouf_COMPLETE_DATABASE_MERGED.xlsx" (a filename that does not exactly match any of the 3 files actually uploaded) | ahmedhamdyraouf_site_v1.zip, build/README.txt | Ahmed_Hamdy_Raouf_Complete_Archive_v2.xlsx (closest match, but different filename) | The live Google Sheet could not be fetched by this tooling (fetch access is restricted to previously-searched/returned URLs). **If the Google Sheet is the true current source of record for the Works page, it should be exported and supplied directly** — this dataset is built from the 3 uploaded workbooks, which may not be byte-identical to it. |

## 2. MISSING DATES

- 33 of 52 songs (`work.csv`) have year = "—" (blank) in the source — no date was ever recorded for those individual compositions (e.g. "إنت المدد", "الميدان", "خالد سعيد", most "Heritage"-tagged and "Single"-tagged tracks performed by Ali El Haggar).
- 16 of 35 projects (`project.csv`) have year = "—" — mostly theatre works (14 of 20) and 3 of 15 drama/film/documentary entries ("زتونه وشقته المسكونة", "سيدة المسرح", "المسرح القومي المصري" documentaries, "بديعة مصابني", "ضل ومراية").
- 9 of 16 awards (`award.csv`) have no year at all — only the 5 jury-membership rows and the syndicate membership row carry a year.
- No exact birth date is missing (15 August 1984 is fully documented), but no exact date is given for "أول تلحين" (first composition) or "أول مشروع مسرحي" (first theatrical project) beyond vague life-stage labels ("طفولة مبكرة" / early childhood, "سنوات الابتدائي" / primary-school years) — these are preserved verbatim as periods, not converted to false precise years.

## 3. MISSING MEDIA

- **No media_asset exists for 37 of the 52 songs** — only songs that happen to also appear in a press/video listing (e.g. "تِعب", "أنا منك اتعلمت", "الساعة 12 ودقيقة", "ست الكل", "داري جمالك", "فجر بلادي", "بنحبك يا دراما", "وش الخير", "إنت قادر", "صوتك جميل") have an associated `media_asset.csv` row. Most heritage/single tracks by Ali El Haggar, all five "Dandana" tracks except tone/description, and several others have no linked audio/video reference anywhere in the provided sources.
- **10 homepage images referenced by the live website are not included** in the uploaded zip. The site's own README states they are hot-linked to the live WordPress media library and could not be downloaded in this environment; it explicitly asks for the image files to be sent directly. Logged as `MED-0038` with `alt_text = MISSING` and `original_filename = NOT PROVIDED`.
- No audio/video files of any kind were included as binary uploads — every `media_asset.csv` row is a **reference to an external URL**, per the instruction not to embed media. No local media files exist under `12-Source-Files/` beyond the workbooks and the website's own text/HTML.
- The Partners pages (`partners-en` / `partners-ar`) are explicitly unfinished/unlinked per the site's own README, and contain no extractable content.

## 4. MISSING RELATIONSHIPS / UNRESOLVED CONTRIBUTIONS

`contribution.csv` contains 236 rows; 19 could not be resolved to a `person_id`:

- **6 rows** are group/ensemble performer credits, not individuals (e.g. "كورال أطفال بانثر آرت" / Panther Art Children's Choir, "فرقة إبهار مصر" / Ebhar Masr Band, "أبطال تياترو" / Teatro cast ensemble). These are legitimately organizational/ensemble credits rather than missing person records — cross-referenced to `organization.csv` where an organization record already exists (e.g. ORG-0005, ORG-0009), otherwise left as `person_id` blank with the raw name preserved.
- **13 rows** are supporting cast members named in the drama/film sheet ("أبرز النجوم" column) who are not otherwise profiled in any source beyond their name (e.g. جميل راتب, صالح رشوان, توفيق عبد الحميد, أشرف طلبة, إيناس مكي, آثار الحكيم, عمرو سعد, ممدوح عبد العليم, جومانا مراد, صالح السعدني, سماح أنور, فردوس عبد الحميد, سلوم حداد). No birth data, role history, or other confirming detail exists for these names anywhere in the provided sources, so **no person.csv record was invented for them** — they remain as `person_name_raw` only in `contribution.csv`, flagged `resolved = NO`.

## 5. DUPLICATE / OVERLAPPING RECORDS (clear duplicates only — not deleted, consolidated per rule)

- **Press articles**: `Press_Archive.xlsx` (37 rows, "مقالات عربية") is superseded by `Press_Final.xlsx` (49 rows, "المقالات والأخبار", explicitly versioned v3.0). Cross-checking by URL confirms Press_Final is a proper superset — every article link in Press_Archive also appears in Press_Final, plus 12 additional entries (streaming-platform bios, additional social links, an additional UAE press interview). `press_mention.csv` is built from Press_Final only, to avoid 37 duplicate rows. Both source workbooks are fully preserved in `12-Source-Files/`.
- **Videos**: `Press_Archive.xlsx` ("فيديوهات وتلفزيون", 12 rows) and `Press_Final.xlsx` ("فيديوهات ومقابلات", 15 rows) describe the same set of videos; Press_Final's set was used as authoritative (it explicitly labels itself "روابط مؤكدة" / confirmed links). No unique video-only rows were found in Press_Archive that are absent from Press_Final.
- **Digital platform / official link listings** appear in three places: Complete_Archive_v2.xlsx ("ملخص عام" + "الهوية الرقمية"), Press_Archive.xlsx ("المنصات الرسمية"), and Press_Final.xlsx ("الروابط الرسمية", explicitly the most recently verified — "مايو 2026 — مصدر التحقق: الفيسبوك الرسمي + البحث المباشر"). `media_asset.csv`'s "Official Platform Link" rows use Press_Final as authoritative; the two disagreements found (Spotify, SoundCloud — see C-03/C-04) are noted in each row's caption field rather than silently overwritten.

## 6. INCOMPLETE RECORDS

- Several `award.csv` rows have no specific year and no specific "related work" (e.g. the Ministry of Culture honor, the Heritage Council shield, the Smouha Club shield, the Fayoum Governorate shield, the Ministry of Youth and Sports honor) — the source data itself does not specify dates for these.
- `work.csv` has no `title_english_transliteration` populated for any of the 52 songs — no English titles were provided in any source for the individual songs (only for a handful that separately have English Wikipedia articles, e.g. "Qalb Wahed", "Te3b" — captured in `press_mention.csv`, not backfilled onto `work.csv` to avoid inventing a canonical transliteration that wasn't given).
- `organization.csv` entries for production companies of some theatre works are blank ("—" in source) for 12 of the 20 theatre productions — no producing body was named in the source for those.

## 7. BROKEN / SUSPECT REFERENCES

- Several YouTube "video" rows in the source video sheets are actually **search-results URLs** (`youtube.com/results?search_query=...`), not direct links to a specific video (e.g. rows for "أنا منك اتعلمت", "الساعة 12 ودقيقة", "ست الكل", "داري جمالك", "فجر بلادي", "بنحبك يا دراما", "وش الخير", "إنت قادر / كلنا بنحب المسرح"). These have been imported as-is into `media_asset.csv` with an explicit `[NOTE: search-results URL, not a direct video link]` in the caption field, since inventing a specific video ID would not be honest to the source.
- One row (Press_Final "فيديوهات ومقابلات" #04, "تِعب — محمد منير (شارة حد أقصى)") lists a channel of "روتانا / يوتيوب" but a URL pointing to a Spotify track, not YouTube — preserved as-is with a note, not corrected, since the correct YouTube link was not present in any source.
- "Amazon Music" and Anghami icon issues on the live website (icon library did not have exact assets) are documented in the site's own README as known, already-explained cosmetic issues — not treated as content errors, just noted here for completeness since they appear in source material.

## 8. DUPLICATE PEOPLE CHECK

No duplicate `person.csv` entries were found — each of the 71 people was checked by name across all appearances in all three workbooks before being assigned a single ID. The one item requiring judgment is **"محمد حمدي رؤوف" (Mohamed Hamdy Raouf)**, a recurring arranger credit distinct from the subject "أحمد حمدي رؤوف" (Ahmed Hamdy Raouf) — the near-identical name is preserved as a separate person (PER-0024) with a note flagging the similarity for human review (likely a family member, per the "نجل حمدي رؤوف" / "son of Hamdy Raouf" references elsewhere in the press sheets, but this is not confirmed by any source and is not asserted as fact).

## 9. DUPLICATE WORKS CHECK

"صوتك جميل" ("Sotak Gameel") appears **twice** in the songs sheet: once as a composition performed by Ali El Haggar (row #26, no year) and once as an "Original" independent digital release performed by Ahmed Hamdy Raouf himself (row #51). These are kept as two separate `work.csv` records (WORK-0026 and WORK-0051) because the source explicitly lists them as separate rows with different performers and different "type" tags — this may represent the same song in two different renditions/releases, or two different songs with an identical title. **Flagged for human confirmation, not merged.**
