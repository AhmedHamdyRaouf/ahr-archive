# AHR Master Archive — Baseline (2026-11-16)

This is the reference state of the whole system after the full review. Any later update/upgrade starts from here.

## 1. Where things live
| Part | Location | Notes |
|---|---|---|
| Database | Supabase project `qgxagmbkgelxvzsphlrg`, schema `archive` (34 tables incl. 1 backup) | Single source of truth for data |
| Dashboard | https://ahr-archive.vercel.app (Vercel, auto-deploys from `main`) | Login page verified reachable |
| Code + docs | GitHub `AhmedHamdyRaouf/ahr-archive`, branch `main` | `app/ dash/ lib/ middleware.js database/ content/ docs/ legacy/` |
| Files | Supabase Storage bucket `archive-files` (private) | 177 photos |

## 2. Data state (live, verified)
- 1,720 entities: 1,657 non-story + 63 life stories (LS-0001..LS-0063).
- 63 life stories: Arabic text = approved narrative drafts; English = translation of that text (status `Draft`, awaiting owner review); 44 `event_date` rows; `period` filled for all.
- LS-0056 and LS-0057 are `Restricted` (must never appear in public output).
- No orphans: translations, relations, dates, links, contributions all reference existing entities. No duplicate public codes.
- Lifecycle of all entities is currently `Draft` (nothing published yet).
- Entity relations by kind: related 28, granted_by 22, role_in 16, mentions 8, continues 5, produced_by 5, associated_with 3, same_event 2, commissioned_by 1, story_of_work 1, benefits 1. Story → person/work links use `mentions`.
- Staff: 1 owner.

## 3. Security state
- RLS enabled on every `archive` table; one policy per table for role `archive_app`; no grants to `anon`.
- Dashboard server uses `archive_app` (no delete), `/api/sql` is read-only.
- Open item (owner action in Supabase dashboard → Auth): "Leaked password protection" is off.
- Repo scanned: no keys/passwords committed; `.env*` ignored.

## 4. Restore points (do not delete)
- `archive.bk_life_story_20261116` — original 63 life stories (entity row, story row, all translations, relations) before the text replacement. Restore with `content/life-story/restore.sql`.
- Schema `backup_final_20261116` — 29-table snapshot of the archive before the latest consolidation.
- Schema `backup_old_ahr_data` — old AHR Data (change_log 1,341, data_dictionary 365, review_queue 66).
- Git history on `main`.

## 5. How to change things safely (update / upgrade)
1. Data change: take a backup table/snapshot first, run the change in one statement, verify counts + md5, log it in the relevant `change_log.md`.
2. Schema change: add a migration (never edit applied ones), mirror it in `database/*.sql`, then update this file.
3. Code change: edit, `npm run build`, push to `main` (Vercel deploys).
4. Never put codes (P-/W-…) inside story text; use `entity_relation` links.
5. Titles of works are always phonetic in Arabic and English.

## 6. Known non-blocking notes
- 4 foreign keys without covering index (`entity.lifecycle/privacy/verification`, `quality_decision.entity_id_2`) — tiny tables, no impact now.
- Backup schemas have no primary keys / policies by design (snapshots).
- Names inside story paragraphs are not clickable yet; links appear in each page's "related" section.


## ملحق: مميزات الداشبورد المضافة (2026-11-16)
- تنقّل سابق/تالي داخل السجل (أسهم الكيبورد ← →)؛ القصص مرتبة زمنياً عبر `entity.sort_order` (1..63 من chronology.csv).
- حفظ تلقائي لمسودات التعديل في المتصفح (localStorage `ahr_draft_<id>`)، وضع قراءة (`ahr_read`)، أسماء قابلة للضغط داخل النص.
- بطاقة تقدّم لكل نوع في النظرة العامة + «اعتمد المحدّد» و«حدّد كل نتائج الفلتر» في الشريط الجماعي.
- فلاتر محفوظة (`ahr_filters`) وفلتر جديد «ترجمة إنجليزي مسودة».
- تصدير Excel (شيت لكل نوع) من المتصفح؛ نصوص السجلات المقيّدة لا تُصدَّر.
