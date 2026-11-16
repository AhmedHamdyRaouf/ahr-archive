# AHR Master Content Dataset — Import Readiness Report

## Status: READY FOR STAGED IMPORT, WITH FLAGGED ITEMS REQUIRING HUMAN DECISIONS BEFORE FINAL PUBLISH

This package is a **normalized dataset**, not the platform and not documentation. It is intended
to be loaded into the AHR Platform CMS's database. Below is what is solid, what needs a decision,
and what is still missing.

---

## 🆕 New Source Supplied 2026-07-21 — Now Merged
The data owner supplied the live Google Sheet powering the site's Works page directly (previously flagged as unreachable — see C-09 above). Its full content is preserved in `12-Source-Files/Live-Works-Google-Sheet-2026-07-21.md` and has since been **merged** into `work.csv`/`project.csv`/`event.csv`/`award.csv`/`organization.csv` (see `14-Reports/Merge-Report-2026-07-21.md` for exactly what was added and why). The counts below reflect the post-merge dataset.

Also this date: **PER-0024 ("Mohamed Hamdy Raouf") confirmed by the data owner as Ahmed Hamdy Raouf's brother** (also a music arranger) — `person.csv`, `person_name_variant.csv` (NV-10), `media_asset.csv` (MED-0033), and `press_mention.csv` (PRESS-36) updated to reflect this and to correctly attribute his separate ElCinema/IMDb profiles. A second, unconfirmed possible-family name ("Amal Hamdy Raouf") surfaced in the new sheet — added as PER-0072, relationship not yet confirmed.

## ✅ Ready to import as-is

- `person.csv` (72 records, +1 on 2026-07-21) — every record has a stable ID (`PER-####`), a source reference, and no unresolved duplicates except the one flagged relationship below.
- `person_name_variant.csv` (11 records) — useful for search/SEO matching in the CMS.
- `work.csv` (55 records, +3 on 2026-07-21) — stable IDs (`WORK-####`), all rows sourced to a specific row in a specific workbook or the live Works Sheet.
- `project.csv` (39 records, +4 on 2026-07-21: 18 drama/film/documentary + 21 theatre) — stable IDs (`PROJ-D-####` for drama/film, `PROJ-T-####` for theatre). PROJ-D-0018 initially flagged as a possible duplicate of PROJ-D-0012, confirmed 2026-07-21 to be a genuinely separate work — see Merge Report.
- `organization.csv` (30 records, +2 on 2026-07-21) — stable IDs (`ORG-####`).
- `event.csv` (30 records, +8 on 2026-07-21) — career timeline, stable IDs (`EVT-####`).
- `award.csv` (18 records, +2 on 2026-07-21) — stable IDs (`AWD-####`), linked to `organization.csv` where a granting body could be resolved.
- `category.csv` (8) and `tag.csv` (30) — ready for use as taxonomy/SEO reference tables.
- All relationship tables (`contribution.csv` — 243 records, +7 on 2026-07-21 — `work_category.csv`, `work_tag.csv`, `project_category.csv`, `project_tag.csv`, `person_organization.csv`, `person_award.csv` — 18 records, +2 on 2026-07-21).

## ⚠️ Needs a decision before final publish

Five of the original six items below were checked against the live official website and external databases on 2026-07-21 — see `13-Validation/External-Verification-Addendum-2026-07-21.md` for the full evidence trail. Items 4 and 6 were subsequently confirmed directly by the data owner. Only item 5 remains genuinely open from the original six. Two new items surfaced during the 2026-07-21 merge — see items 7 and 8.

1. ~~**Contact email**~~ ✅ **Resolved** — `a.h.r@msn.com` confirmed canonical (live site Home + Contact pages, English). No competing value existed in this dataset's own CSVs.
2. ~~**ElCinema profile ID**~~ ✅ **Resolved** — `elcinema.com/person/1990118/` confirmed correct (matches subject's name); `person/2024870/` confirmed to belong to a different individual entirely. Already the value used in this dataset — no change needed.
3. ~~**Spotify / SoundCloud links**~~ ✅ **Resolved** — live site matches Press_Final's corrected links already adopted in this dataset. No change needed.
4. ~~**IMDb dual-profile question**~~ (nm14146970 vs nm5770871) ✅ **Resolved 2026-07-21** — confirmed by the data owner that PER-0024 (who this IMDb profile belongs to) is a distinct person, his brother. `person_name_variant.csv` (NV-10), `media_asset.csv` (MED-0033), and `press_mention.csv` (PRESS-36) re-pointed from PER-0001 to PER-0024 accordingly.
5. **"Sotak Gameel" duplicate song question** (WORK-0026 vs WORK-0051) — confirm whether these are the same song released twice or two different songs. See Section 9 of the Validation Report. *(Not addressable from the live site's static pages — still open.)*
6. ~~**"Mohamed Hamdy Raouf" (arranger, PER-0024) vs "Ahmed Hamdy Raouf" (subject, PER-0001)**~~ ✅ **Resolved 2026-07-21** — confirmed by the data owner: PER-0024 is Ahmed Hamdy Raouf's brother, also a music arranger. See `person.csv` note on PER-0024.
7. ~~**PROJ-D-0018 "سيدة النقد المسرحي" (2017) — possible duplicate of PROJ-D-0012 "سيدة المسرح"**~~ ✅ **Resolved 2026-07-21** — confirmed by the data owner: two genuinely separate documentaries, not a duplicate.
8. ~~**"Amal Hamdy Raouf" (PER-0072) — possible family relationship to PER-0001**~~ ✅ **Resolved 2026-07-21** — confirmed by the data owner: Amal Hamdy Raouf is Ahmed Hamdy Raouf's sister.

## ❌ Missing / not obtainable from provided sources (flagged, not fabricated)

- The ~28 additional songs and ~40 additional theatre works referenced only by aggregate "headline stat" counts, with no itemized detail anywhere provided.
- 10 homepage images used by the live website (not included in the uploaded zip; site's own README asks for them to be sent separately).
- The live Google Sheet powering the website's dynamic Works page (network-restricted; could not be fetched with available tools — if this is the true source of record, it should be exported to CSV/XLSX and supplied directly).
- English titles/transliterations for the 52 songs (not present in any source).
- Specific years for 33 songs, 16 projects, and 9 awards (source genuinely does not specify a year).

## Recommended import sequence

1. Load `category.csv` and `tag.csv` first (no dependencies).
2. Load `person.csv` and `person_name_variant.csv`.
3. Load `organization.csv`.
4. Load `work.csv`, `project.csv`, `event.csv`, `award.csv` (reference person_id/organization_id where present).
5. Load `media_asset.csv` and `press_mention.csv`.
6. Load all relationship tables (`11-Relationships/`) last, since they depend on IDs from all prior tables.
7. Before going live, resolve the 6 "Needs a decision" items above, and re-run validation once corrected.

## Files delivered

```
AHR-Master-Content-Dataset/
├── 01-People/          person.csv, person_name_variant.csv
├── 02-Works/           work.csv
├── 03-Projects/        project.csv
├── 04-Organizations/   organization.csv
├── 05-Events/          event.csv
├── 06-Awards/          award.csv
├── 07-Media/           media_asset.csv
├── 08-Press/           press_mention.csv
├── 09-Categories/      category.csv
├── 10-Tags/            tag.csv
├── 11-Relationships/   contribution.csv, work_category.csv, work_tag.csv,
│                       project_category.csv, project_tag.csv,
│                       person_organization.csv, person_award.csv
├── 12-Source-Files/    Excel-Sheets/ (3 original .xlsx, untouched)
│                       Website-Archive/ (original .zip + extracted HTML build, untouched)
├── 13-Validation/      Validation_Report.md, validation_issues.csv
└── 14-Reports/         Dataset_Summary.md, Validation_Report.md, Import_Readiness_Report.md
```
