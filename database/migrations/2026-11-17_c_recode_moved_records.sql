-- Part C: give the 14 moved records their new-section codes, one record at a time, each verified.
-- Old codes stay resolvable through archive.entity_code_alias (archive.eid() falls back to it).
create table archive.entity_code_alias (
  old_code text primary key,
  entity_id uuid not null references archive.entity(id) on delete restrict,
  created_at timestamptz not null default now());
create index idx_entity_code_alias_entity on archive.entity_code_alias(entity_id);
alter table archive.entity_code_alias enable row level security;
create policy app_all on archive.entity_code_alias for all to archive_app using (true) with check (true);
grant select, insert, update on archive.entity_code_alias to archive_app;
create trigger trg_log_entity_code_alias after insert or update or delete on archive.entity_code_alias for each row execute function archive.log_change();

create or replace function archive.eid(code text) returns uuid language sql stable set search_path to '' as $f$
 select coalesce((select id from archive.entity where public_code=nullif(btrim(code),'')),
                 (select entity_id from archive.entity_code_alias where old_code=nullif(btrim(code),''))) $f$;

do $mig$
declare m record; id0 uuid; b int[]; a int[]; cnt text :=
 $q$select array[(select count(*) from archive.entity_relation r where r.from_entity=$1 or r.to_entity=$1),
                 (select count(*) from archive.translation t where t.entity_id=$1),
                 (select count(*) from archive.link l where l.entity_id=$1),
                 (select count(*) from archive.date_value d where d.entity_id=$1),
                 (select count(*) from archive.review_item r where r.entity_id=$1),
                 (select count(*) from archive.source_snapshot s where s.entity_id=$1)]$q$;
begin
 perform set_config('app.editor','إعادة ترقيم الكيانات المنقولة',true);
 for m in select * from (values
   ('ORG-0016','FES-0006'),('ORG-0017','FES-0007'),('ORG-0027','FES-0008'),('ORG-0033','FES-0009'),('ORG-0034','FES-0010'),
   ('ORG-0002','ENS-0001'),('ORG-0003','ENS-0002'),('ORG-0005','ENS-0003'),('ORG-0006','ENS-0004'),('ORG-0009','ENS-0005'),
   ('ORG-0001','PRG-0001'),('ORG-0010','PRG-0002'),('ORG-0004','PRJ-0001'),('ORG-0022','SEA-0001')) v(o,n) order by n loop
  select id into id0 from archive.entity where public_code=m.o;
  if id0 is null then raise exception 'missing %', m.o; end if;
  if exists(select 1 from archive.entity where public_code=m.n) then raise exception 'new code taken %', m.n; end if;
  execute cnt into b using id0;
  insert into archive.entity_code_alias(old_code,entity_id) values(m.o,id0);
  update archive.entity set public_code=m.n where id=id0;
  execute cnt into a using id0;
  if a<>b then raise exception 'counts changed for %: % -> %', m.o, b, a; end if;
  if archive.eid(m.o)<>id0 or archive.eid(m.n)<>id0 then raise exception 'resolve failed %', m.o; end if;
 end loop;
end $mig$;
