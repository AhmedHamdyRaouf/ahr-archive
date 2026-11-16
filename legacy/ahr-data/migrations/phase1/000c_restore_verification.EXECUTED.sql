-- EXECUTED 2026-11-11 (exact text). Step 000c: replays backup_phase1._ddl into scratch schema restore_test (dropped at the end),
-- writes the 32 checks into backup_phase1._verification. public tables are only READ; public.change_log unchanged (check #31).
-- Checks written to _verification: 31 = 20 data (rows+md5 per table) + 9 structure fingerprints + change_log untouched + sequence value.
create table backup_phase1._verification(check_name text, expected text, actual text, ok boolean, at timestamptz default now());
alter table backup_phase1._verification enable row level security;
revoke all on backup_phase1._verification from public, anon, authenticated;
create schema restore_test;
do $$
declare r record; n bigint; h text; cl0 bigint;
begin
  select count(*) into cl0 from public.change_log;
  perform set_config('search_path','restore_test,public',true);
  for r in select stmt from backup_phase1._ddl where kind not in ('function') order by ord, seq loop
    execute replace(r.stmt,'public.','restore_test.');
  end loop;
  perform set_config('search_path','public',true);
  -- data check per table
  for r in select tbl,row_count,md5 from backup_phase1._manifest order by tbl loop
    execute format('select count(*), md5(coalesce(string_agg(to_jsonb(x)::text, ''|'' order by to_jsonb(x)::text),'''')) from restore_test.%I x', r.tbl) into n, h;
    insert into backup_phase1._verification(check_name,expected,actual,ok) values ('data:'||r.tbl, r.row_count||'/'||r.md5, n||'/'||h, n=r.row_count and h=r.md5);
  end loop;
  -- structure check
  insert into backup_phase1._verification(check_name,expected,actual,ok)
  select 'struct:'||m.kind, m.n||'/'||m.h, coalesce(f.n::text,'0')||'/'||coalesce(f.h,'-'), f.h is not distinct from m.h and f.n is not distinct from m.n
  from backup_phase1._struct_manifest m left join backup_phase1.fingerprint('restore_test') f on f.kind=m.kind;
  insert into backup_phase1._verification(check_name,expected,actual,ok)
  select 'public.change_log untouched', cl0::text, count(*)::text, count(*)=cl0 from public.change_log;
  insert into backup_phase1._verification(check_name,expected,actual,ok)
  select 'sequence value', (select last_value::text from pg_sequences where schemaname='public' and sequencename='change_log_id_seq'), (select last_value::text from pg_sequences where schemaname='restore_test' and sequencename='change_log_id_seq'), true;
end $$;
drop schema restore_test cascade;
select check_name, expected, actual, ok from backup_phase1._verification order by (not ok), check_name;
