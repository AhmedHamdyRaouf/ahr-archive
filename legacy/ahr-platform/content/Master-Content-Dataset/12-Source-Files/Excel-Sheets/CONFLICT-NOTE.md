# Note on the Three Source Spreadsheets

**Correction (see verification pass, follow-up review):** the note originally written here overstated the conflict. On closer inspection of `13-Validation/Validation_Report.md` and `14-Reports/Dataset_Summary.md`, the dataset curation already resolved most of this at the row level — it was not left as an open "pick one file" decision.

## What was actually done

- `Ahmed_Hamdy_Raouf_Press_Archive.xlsx` (37 press rows, 12 video rows) is superseded by `Ahmed_Hamdy_Raouf_Press_Final.xlsx` (49 press rows, versioned v3.0; 15 video rows) — confirmed by URL cross-check to be a proper superset plus 12 additional entries. `press_mention.csv` and the "Official Platform Link" rows in `media_asset.csv` were built from Press_Final only, specifically to avoid re-introducing 37 duplicate rows.
- `Ahmed_Hamdy_Raouf_Complete_Archive_v2.xlsx` is the primary source for biography, songs, drama/film, theatre, training, and awards data (`work.csv`, `project.csv`, `award.csv`, `person.csv`) — it covers ground the two press-focused workbooks don't.
- All three files are kept in this folder because each contributed unique, non-overlapping rows to the final dataset — this is a legitimate multi-source merge, not an unresolved duplicate.

## What is genuinely still unresolved (human decision needed)

Nine specific, itemized conflicts remain — see `13-Validation/Validation_Report.md` §1 (C-01 through C-09) for full detail on each:

- Which contact email is current (workbook vs. live website).
- Two different ElCinema profile IDs in use.
- Corrected vs. legacy Spotify/SoundCloud links (Press_Final's is marked self-corrected, but the old value wasn't deleted, just deprioritized).
- Two aggregate "total songs/theatre works" claims (~80 songs, ~60 plays) that exceed what's actually itemized in any source (52 songs, 20 plays) — the gap was **not** filled with invented data.
- A possible duplicate IMDb profile under a misspelled name for one documentary.
- A live Google Sheet referenced by the website's own README that could not be fetched by this tooling and may be a more current source than any of these three static exports.

These nine items are the real open questions — not "which of the three files is canonical," which was the wrong framing. Renamed filenames only (no data changed): `Press-Archive-Candidate-Original.xlsx`, `Press-Archive-Candidate-Revised.xlsx`, `Press-Archive-Candidate-Complete.xlsx`.
