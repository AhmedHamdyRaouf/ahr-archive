# Merge Report — Live Works Google Sheet → Normalized Dataset (2026-07-21)

**Source merged:** `12-Source-Files/Live-Works-Google-Sheet-2026-07-21.md` (the live Google Sheet powering `ahmedhamdyraouf.com`'s Works page, supplied directly by the data owner).
**Method:** Every title in the sheet's 6 tabs was checked by name against the existing `work.csv`/`project.csv` before adding anything — most of the sheet's ~90 entries were already present (same real discography, different source). Only genuinely new or ambiguous items are listed below; nothing already on file was duplicated.

## Added

| File | New ID(s) | What | Why new |
|---|---|---|---|
| `02-Works/work.csv` | WORK-0053 | كنور (Kanour, 2014) | Not present under this or any similar title |
| `02-Works/work.csv` | WORK-0054 | لاڤيل (Lavil, 2020) | Not present under this or any similar title |
| `02-Works/work.csv` | WORK-0055 | شكراً يا إمارات (Shukran Ya Emarat, 2026) | 2026 release, postdates the original workbooks |
| `03-Projects/project.csv` | PROJ-T-0021 | الخطوبة (El Khotuba/The Engagement, 2005) | Not present in the 20 existing theatre rows |
| `03-Projects/project.csv` | PROJ-D-0016 | أرض النسانيس (Ard El Nasanis, 2007) | Not present in the 15 existing drama/film rows |
| `03-Projects/project.csv` | PROJ-D-0017 | حكاية الفرقة (Hekayet El Ferqa, 2020) | Not present under this title |
| `03-Projects/project.csv` | PROJ-D-0018 | سيدة النقد المسرحي (2017) | See "Flagged, Not Merged as Duplicate" below — added as its own row rather than merged |
| `04-Organizations/organization.csv` | ORG-0029, ORG-0030 | Alexandria Creativity Center (Training Branch); National Center for Child Culture | Referenced as venue/granting body by new events/awards below, not previously on file |
| `06-Awards/award.csv` | AWD-0017, AWD-0018 | National Center for Child Culture honor; Alexandria Creativity Center honor | Not present among the existing 16 awards |
| `05-Events/event.csv` | EVT-0023 – EVT-0030 (8 rows) | El Nasr Boys College (1999–2000); Ministry of Youth – El Anfushi Center (2004); Ministry of Youth – El Nasr Center (2004); National Youth & Sports Troupe (2004–2005); "Watan El Ghena" tribute project (2013/14/15); Ali El-Haggar Ensemble direction (2009–present); "Musalsalat: Romance and More"; "Ramadan Zaman" (2024) | Career-timeline items not present in the existing 22 events |
| `11-Relationships/contribution.csv` | CTB-20061 – CTB-20067 (7 rows) | Composer/Arranger/Music contribution links for every new work/project above | Required so the new works/projects aren't orphaned per this dataset's own "no entity without a contribution" quality rule |
| `11-Relationships/person_award.csv` | 2 rows | PER-0001 ↔ AWD-0017, AWD-0018 | Links the 2 new awards to the subject |

## Confirmed by the Data Owner (2026-07-21, after this report was first written)

**PROJ-D-0018 "سيدة النقد المسرحي" (2017) vs. the existing PROJ-D-0012 "سيدة المسرح"** — ✅ confirmed to be **two separate documentaries**, not a duplicate. Both rows kept as independent works.

**"Choirs & Training" organizations vs. existing `organization.csv` rows** — three of the sheet's five training engagements (Ministry of Youth centers, National Youth & Sports Troupe) plausibly overlap with existing broader organization records (e.g. ORG-0003), but the sheet frames them as *specific, dated engagements* rather than standing organizational relationships. These were added as **career-timeline events** (`05-Events/event.csv`), not new organizations, to avoid creating near-duplicate organization rows — this is a modeling judgment call, not a hard fact, and can be revisited.

## Untouched
`person.csv`, `person_name_variant.csv`, `media_asset.csv`, `press_mention.csv` were already updated in the prior pass (2026-07-21, brother confirmation + image cataloging) and were not touched again in this merge.

## Suggested Next Validation Step
Re-run whatever process originally produced `13-Validation/Validation_Report.md` and `validation_issues.csv` against the now-larger dataset, so the duplicate-check and completeness stats in those two files reflect the merge (they currently still describe the pre-merge row counts).
