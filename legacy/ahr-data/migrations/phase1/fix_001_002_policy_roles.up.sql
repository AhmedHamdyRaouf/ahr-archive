-- Phase 1 / CORRECTION to 001 and 002 (policy roles). Executed on Supabase 2026-11-11 after Part A1 of tests_002 flagged A1.07.
-- Finding: the 19 pre-existing owner_all policies are "TO authenticated"; the policies created by 001 and 002 had no TO clause (= TO public).
-- Effect was nil in practice (USING / WITH CHECK require jwt email = owner), but it deviated from the established pattern.
-- ALTER POLICY changes only the role list; USING and WITH CHECK are untouched. No data is touched.
do $migration$
begin
  alter policy owner_all on public.ref_relationship_type to authenticated;
  alter policy owner_all on public.work_relationship to authenticated;
end $migration$;
