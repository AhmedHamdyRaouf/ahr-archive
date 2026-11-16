-- EXECUTED 2026-11-11 on project qgxagmbkgelxvzsphlrg via execute_sql (exact text). Step 000a: data copies + manifest.
-- Fails if schema backup_phase1 already exists (no overwrite). backup_20261110 untouched.
create schema backup_phase1;
create table backup_phase1._manifest(tbl text primary key, row_count bigint, md5 text, backup_rows bigint, backup_md5 text, taken_at timestamptz default now());
do $$
declare t text; n bigint; h text; n2 bigint; h2 text;
begin
  for t in select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1 loop
    execute format('create table backup_phase1.%I as select * from public.%I', t, t);
    execute format('select count(*), md5(coalesce(string_agg(to_jsonb(x)::text, ''|'' order by to_jsonb(x)::text),'''')) from public.%I x', t) into n, h;
    execute format('select count(*), md5(coalesce(string_agg(to_jsonb(x)::text, ''|'' order by to_jsonb(x)::text),'''')) from backup_phase1.%I x', t) into n2, h2;
    insert into backup_phase1._manifest(tbl,row_count,md5,backup_rows,backup_md5) values (t,n,h,n2,h2);
    execute format('alter table backup_phase1.%I enable row level security', t);
  end loop;
end $$;
alter table backup_phase1._manifest enable row level security;
revoke all on schema backup_phase1 from public, anon, authenticated;
revoke all on all tables in schema backup_phase1 from public, anon, authenticated;
select tbl,row_count,md5,backup_rows,backup_md5,(row_count=backup_rows and md5=backup_md5) ok from backup_phase1._manifest order by tbl;
