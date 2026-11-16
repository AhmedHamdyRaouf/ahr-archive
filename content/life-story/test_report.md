# Test report — life-story review (2026-11-16)

## Live database (Supabase `qgxagmbkgelxvzsphlrg`, schema `archive`)
| Check | Result |
|---|---|
| Life-story entities present | 63 / 63 |
| IDs / public codes identical to backup | 63 / 63 |
| `life_story.content` differences vs backup | 0 |
| `life_story.topic` differences vs backup | 0 |
| `life_story.period` differences vs backup | 5 (intended: LS-0059..0063, were NULL) |
| Entity rows (status, privacy, verification) differing from backup | 0 |
| LS-0056 / LS-0057 privacy | Restricted / Restricted |
| Translations | 816 (backup) + 10 (period ar/en for 5 stories) = 826 |
| `event_date` rows | 44 stories (19 undated: none invented) |
| Review relations | 35, no dangling endpoints |
| `date_value` rows with precision text/unknown (quality counters) | 37 before and after: unchanged |
| Stories with NULL period | 0 |
| Restore dry-run (inside a rolled-back transaction) | period diff 0, life-story dates 0, translations 816, review relations 0 — then rolled back; live state re-checked: 44 / 0 / 35 |

## Repository files
| Check | Result |
|---|---|
| chronology.csv has 63 unique codes LS-0001..0063 | pass |
| years non-decreasing along the order | pass |
| links.csv: 35 rows, every endpoint exists | pass |
| source_narratives.json drafts identical to Master v1.0 | pass |
| open_questions.csv: 322 questions, 61 stories (restricted excluded), verbatim | pass |
| LS-0056/0057 text absent from every repo file | pass |
| Word file renders (LibreOffice, 37 pages, RTL) | pass |

## Not tested
- Visual check of the dashboard timeline after the change (the new rows use the same `date_value` shape as existing ones, year range 1988–2026).
