-- ROLLBACK for 2026-11-17 Entity Classification. Source of truth: archive.bk_cls_20261117_* (full copies taken before the move).
-- Run as postgres, in one transaction. Nothing here drops the backups.
begin;
set local app.editor = 'rollback classification';
-- 1) put organization rows back (14 moved ones)
insert into archive.organization select b.* from archive.bk_cls_20261117_organization b
 where not exists (select 1 from archive.organization o where o.entity_id=b.entity_id);
-- 2) restore entity types of the 14 moved records
update archive.entity e set entity_type='organization'
 from archive.bk_cls_20261117_entity b where b.id=e.id and b.entity_type='organization' and e.entity_type<>'organization';
-- 3) restore event types
update archive.event e set event_type=b.event_type from archive.bk_cls_20261117_event b where b.entity_id=e.entity_id and e.event_type is distinct from b.event_type;
-- 4) remove relations added by the migration (part_of / concerns)
delete from archive.entity_relation r where (r.kind='part_of' and r.note like '%إعادة التصنيف%') or (r.kind='concerns' and r.note like 'حدث تأسيس الفرقة%');
-- 5) the 5 new festivals (FES-xxxx) are kept as Draft unless removed by hand: they never left Draft, so physical removal is allowed by the archive rules.
-- 6) after verifying, the empty new tables can be left in place (harmless) or dropped manually.
commit;
