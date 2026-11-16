-- Phase 1 pre-backup: full copy of every public base table + checksum manifest.
-- Restorable with restore_phase1.sql. Safe to run once; fails if backup_phase1 exists (no overwrite).
create schema backup_phase1;
create table backup_phase1._manifest(tbl text primary key, row_count bigint, md5 text, taken_at timestamptz default now());
do $$
declare t text; n bigint; h text;
begin
  for t in select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1 loop
    execute format('create table backup_phase1.%I as select * from public.%I', t, t);
    execute format('select count(*), md5(coalesce(string_agg(to_jsonb(x)::text, ''|'' order by to_jsonb(x)::text),'''')) from public.%I x', t) into n, h;
    insert into backup_phase1._manifest(tbl,row_count,md5) values (t,n,h);
  end loop;
end $$;
revoke all on schema backup_phase1 from anon, authenticated;
select tbl,row_count,md5 from backup_phase1._manifest order by 1;
