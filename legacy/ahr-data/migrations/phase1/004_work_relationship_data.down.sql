-- Reverts 004: restores parent_work_id for the 7 original rows, removes the 9 relations, removes the W-0072 tag.
do $migration$
begin
  update public.works w set parent_work_id = r.target_work_id from public.work_relationship r where r.source_work_id = w.work_id and r.relationship_id in ('WR-0001','WR-0002','WR-0003','WR-0004','WR-0005','WR-0006','WR-0007');
  delete from public.work_relationship where relationship_id in ('WR-0001','WR-0002','WR-0003','WR-0004','WR-0005','WR-0006','WR-0007','WR-0008','WR-0009');
  update public.works set source = replace(source, ' | تأكيد أحمد 2026-11-11: السنة 2017', ''), source_en = replace(source_en, ' | Ahmed confirmation 2026-11-11: year 2017', '') where work_id = 'W-0072';
end $migration$;
