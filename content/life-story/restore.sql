-- Restore the life-story layer to its state before the 2026-11-16 review.
-- Source of truth for the restore: archive.bk_life_story_20261116 (63 entities, 816 translations).
-- Scope: removes what the review added (event_date rows, the 35 review relations, the 10 period translations),
-- puts life_story.period back, and (step 2, after Ahmed's approval on 2026-11-16) puts the ORIGINAL life_story.content
-- and the ar/en `content` translations back. topic and every entity row were never touched.
-- Note: archive_app has no DELETE grant; run this as the project owner (e.g. Supabase SQL editor / MCP execute_sql).
begin;
delete from archive.date_value d using archive.entity e
 where e.id=d.entity_id and e.entity_type='life_story' and d.field='event_date';
delete from archive.entity_relation r using archive.entity a, archive.entity b
 where a.id=r.from_entity and b.id=r.to_entity and a.entity_type='life_story' and b.entity_type='life_story'
   and r.kind in ('same_event','continues','related');
delete from archive.translation t using archive.entity e
 where e.id=t.entity_id and e.entity_type='life_story' and t.field='period'
   and t.author='Claude draft (life-story review)';
update archive.life_story l
   set period = b.life_story_row->>'period'
  from archive.bk_life_story_20261116 b
 where b.entity_id=l.entity_id and l.period is distinct from (b.life_story_row->>'period');
update archive.life_story l
   set content = b.life_story_row->>'content'
  from archive.bk_life_story_20261116 b
 where b.entity_id=l.entity_id;
update archive.translation t
   set body=x->>'body', status=x->>'status', author=x->>'author', updated_at=(x->>'updated_at')::timestamptz
  from archive.bk_life_story_20261116 b, jsonb_array_elements(b.translations) x
 where t.entity_id=b.entity_id and t.field='content' and t.lang in ('ar','en')
   and x->>'field'='content' and x->>'lang'=t.lang;
commit;
-- Verify after restore:
-- select count(*) from archive.life_story l join archive.bk_life_story_20261116 b on b.entity_id=l.entity_id
--  where (b.life_story_row->>'period') is distinct from l.period;   -- expect 0
