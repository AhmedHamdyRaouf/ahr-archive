-- Implements: Data Foundation Conventions (Milestone 2 sub-stage) §3, §4, §5.
-- Enables UUID generation and defines the one shared updated_at trigger
-- function every table attaches to (never duplicated per table, per
-- Data Foundation Conventions §5 recommendation).

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- clock_timestamp(), not now(): now() is fixed for the whole transaction
  -- in Postgres, so a trigger using now() would not advance updated_at for
  -- a second update issued later in the same multi-statement transaction.
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

comment on function set_updated_at() is
  'Shared trigger function maintaining updated_at on every table. '
  'Implements: Data Foundation Conventions §5. Do not duplicate this logic per table.';
