-- NOTE (2026-11-11): the version first EXECUTED on Supabase created owner_all WITHOUT "to authenticated" (= TO public). The "to authenticated" below was
-- added afterwards to match the 19 existing policies; production was corrected by fix_001_002_policy_roles.up.sql (executed). Fresh installs: use this file as is.
-- Phase 1 / Migration 001: relationship type code list. Additive only. NOT YET EXECUTED.
-- The whole migration is ONE statement (a DO block) so it is atomic regardless of how the runner wraps it:
-- any error rolls back the table, the seed rows, RLS, the policy and the trigger together.
do $migration$
begin
  create table public.ref_relationship_type(
    code text primary key,
    label_ar text not null,
    label_en text not null,
    direction_note text,
    sort_order int not null default 0,
    active boolean not null default true,
    -- label must contain something other than whitespace (space, tab, newline, NBSP, zero-width/bidi marks, BOM)
    constraint chk_ref_relationship_type_label_ar check (label_ar !~ '^[[:space:] ​‎‏ ﻿]*$'),
    constraint chk_ref_relationship_type_label_en check (label_en !~ '^[[:space:] ​‎‏ ﻿]*$')
  );
  -- seed first, trigger after: the 6 seed rows are intentionally NOT written to change_log
  insert into public.ref_relationship_type(code,label_ar,label_en,direction_note,sort_order) values
   ('part_of','جزء من','Part of','source is part of target',1),
   ('soundtrack_for','موسيقى/أغنية تتر لـ','Soundtrack for','source is the soundtrack of target',2),
   ('theme_song_for','أغنية رئيسية لـ','Theme song for','source is the theme song of target',3),
   ('featured_in','ضمن','Featured in','source appears within target',4),
   ('version_of','نسخة من','Version of','source is a version of target',5),
   ('updates','تحديث لـ','Updates','source updates/replaces target',6);
  alter table public.ref_relationship_type enable row level security;
  create policy owner_all on public.ref_relationship_type for all to authenticated
   using (((auth.jwt() ->> 'email') = 'ahrvision@gmail.com') and coalesce((auth.jwt() ->> 'email_verified')::boolean,true))
   with check (((auth.jwt() ->> 'email') = 'ahrvision@gmail.com') and coalesce((auth.jwt() ->> 'email_verified')::boolean,true));
  create trigger trg_log_ref_relationship_type after insert or update or delete on public.ref_relationship_type
   for each row execute function public.log_change('code');
end
$migration$;
