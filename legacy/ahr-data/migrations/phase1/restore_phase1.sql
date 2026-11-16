-- FULL RESTORE of public schema from backup_phase1 (structure + data). RUN ONLY ON AHMED'S EXPLICIT ORDER.
-- Rebuild order comes from backup_phase1._ddl (function, sequences, tables, data, setval, constraints, FKs,
-- indexes, triggers, RLS, policies, views, grants, comments). The same statement list was verified
-- on 2026-11-11 by replaying it into a scratch schema (restore_test, since dropped): data md5 + structure fingerprints matched.
begin;
do $$ declare r record; begin
  for r in select relname from pg_class where relnamespace='public'::regnamespace and relkind='v' loop execute format('drop view public.%I', r.relname); end loop;
  for r in select relname from pg_class where relnamespace='public'::regnamespace and relkind='r' loop execute format('drop table public.%I cascade', r.relname); end loop;
  for r in select relname from pg_class where relnamespace='public'::regnamespace and relkind='S' loop execute format('drop sequence if exists public.%I cascade', r.relname); end loop;
end $$;
do $$ declare r record; begin
  for r in select stmt from backup_phase1._ddl order by ord, seq loop execute r.stmt; end loop;
end $$;
-- verification: must return zero rows
select m.tbl from backup_phase1._manifest m
 where (xpath('/row/c/text()', query_to_xml(format('select count(*) c from public.%I',m.tbl),false,true,'')))[1]::text::bigint <> m.row_count;
commit;
