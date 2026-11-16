-- Phase 1 tests. Leaves NO residue: everything is rolled back by a final exception that carries the report.
-- Part A (read-only, run separately): compare live counts/md5 with backup_phase1._manifest.
--   select m.tbl, m.row_count, (xpath('/row/c/text()', query_to_xml(format('select count(*) c from public.%I',m.tbl),false,true,'')))[1]::text::bigint live from backup_phase1._manifest m;
-- Part B (rolled back):
do $$
declare r text := ''; a text; b text; w1 text; w2 text; n0 bigint; n1 bigint;
begin
  select min(work_id), max(work_id) into w1, w2 from public.works;
  select count(*) into n0 from public.change_log;
  begin insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values('T1',w1,w1,'part_of'); r:=r||'FAIL self-link accepted;'; exception when check_violation then r:=r||'ok self-link rejected;'; end;
  begin insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values('T2',w1,w2,'nope'); r:=r||'FAIL bad type accepted;'; exception when foreign_key_violation then r:=r||'ok bad type rejected;'; end;
  begin insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values('T3',w1,'W-NOPE','part_of'); r:=r||'FAIL bad work accepted;'; exception when foreign_key_violation then r:=r||'ok unknown work rejected;'; end;
  insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values('T4',w1,w2,'part_of');
  begin insert into public.work_relationship(relationship_id,source_work_id,target_work_id,relationship_type) values('T5',w1,w2,'part_of'); r:=r||'FAIL duplicate accepted;'; exception when unique_violation then r:=r||'ok duplicate rejected;'; end;
  begin delete from public.works where work_id=w1; r:=r||'FAIL works delete allowed;'; exception when foreign_key_violation then r:=r||'ok restrict delete;'; end;
  select count(*) into n1 from public.change_log;
  r:=r||format('change_log +%s (expect 1);', n1-n0);
  raise exception 'PHASE1_TESTS_ROLLED_BACK: %', r;
end $$;
-- Part C (anon cannot read): set local role anon; select count(*) from public.work_relationship; -- expect 0
-- Part D: pub_* views column lists unchanged (compare information_schema.columns for the 10 pub_ views to the pre-phase snapshot).
