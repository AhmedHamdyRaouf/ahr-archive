-- DOWN for fix_001_002_policy_roles: restores the as-first-executed state (TO public). Only needed to undo the correction itself.
do $migration$
begin
  alter policy owner_all on public.ref_relationship_type to public;
  alter policy owner_all on public.work_relationship to public;
end $migration$;
