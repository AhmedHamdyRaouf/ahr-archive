# Change log — Life-story archive review (LS-0001..LS-0063)

Date: 2026-11-16 · Sources: Full_Life_Stories_Master_v1.0, Claude_Execution_Instructions_v1.0, Life_Archive_Chronological_Review_Claude_Handoff_v1.2
Decision recorded: direct replacement after a restorable backup (Ahmed, chat 2026-11-16).

## Before anything changed
- Backup table `archive.bk_life_story_20261116` (entity row, life_story row, all translations and relations of the 63 stories as JSON). 63 rows / 816 translations.
- Restore script: `content/life-story/restore.sql`.

## Live changes (data only; no schema, grant or RLS change)
| # | Change | Count | Reversible by |
|---|---|---|---|
| W1 | `life_story.period` filled for LS-0059..LS-0063 (were NULL), marked «تقديري»/«غير مؤرخ» + ar/en `period` translations (status Draft) | 5 stories, 10 translations | restore.sql |
| W2 | `date_value` rows, field `event_date`, precision year/month/day/range, qualifier says stated vs estimated, `original_text` keeps the wording | 44 stories (19 undated stories deliberately get no row) | restore.sql |
| W3 | `entity_relation` rows kinds `same_event` / `continues` / `related` | 35 | restore.sql |

## Deliberately NOT changed
- `life_story.content`, `topic` and all existing translations of the 63 stories (0 differences against the backup).
- Entity rows (status, privacy, verification): LS-0056 and LS-0057 remain Restricted.
- The narrative drafts in the Master are not written over the stories: they are unapproved, they drop embedded codes (P-0086, P-0217, P-0091, W-0024, W-0064, W-0056/57/53) and place/people detail, and the English translations would diverge. They are kept verbatim in `source_narratives.json` (LS-0056/57 text excluded) pending Ahmed's approval.
- Conflicts are not resolved: both sides kept in `conflicts.csv` (C01..C20; C17 is the only resolved one).

## Files
`chronology.csv` (order by event date, thread, certainty) · `links.csv` · `conflicts.csv` · `open_questions.csv` (322 questions, verbatim) · `source_narratives.json` · `apply_live_updates.sql` · `restore.sql` · `test_report.md`
