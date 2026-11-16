-- NOTE (2026-11-11): the version first EXECUTED on Supabase created owner_all WITHOUT "to authenticated" (= TO public). The "to authenticated" below was
-- added afterwards to match the 19 existing policies; production was corrected by fix_001_002_policy_roles.up.sql (executed). Fresh installs: use this file as is.
-- Phase 1 / Migration 002: work_relationship. Additive only; zero rows; no public view.
-- Wrapped in ONE DO block so the whole migration is atomic (same pattern as 001).
do $migration$
begin
  create table public.work_relationship(
    relationship_id text primary key,
    source_work_id text not null,
    target_work_id text not null,
    relationship_type text not null,
    qualifier text not null default '',
    qualifier_en text not null default '',
    notes text not null default '',
    notes_en text not null default '',
    evidence_status text not null default '',
    confidence text not null default '',
    privacy text not null default 'داخلي',
    publish text not null default 'لا',
    sort_order int not null default 0,
    constraint fk_work_relationship_source foreign key (source_work_id) references public.works(work_id) on delete restrict,
    constraint fk_work_relationship_target foreign key (target_work_id) references public.works(work_id) on delete restrict,
    constraint fk_work_relationship_type foreign key (relationship_type) references public.ref_relationship_type(code) on delete restrict,
    constraint chk_work_relationship_no_self check (source_work_id <> target_work_id),
    constraint uq_work_relationship_triple unique (source_work_id, target_work_id, relationship_type)
  );
  create index idx_work_relationship_source on public.work_relationship(source_work_id);
  create index idx_work_relationship_target on public.work_relationship(target_work_id);
  create index idx_work_relationship_type on public.work_relationship(relationship_type);
  alter table public.work_relationship enable row level security;
  create policy owner_all on public.work_relationship for all to authenticated
   using (((auth.jwt() ->> 'email') = 'ahrvision@gmail.com') and coalesce((auth.jwt() ->> 'email_verified')::boolean,true))
   with check (((auth.jwt() ->> 'email') = 'ahrvision@gmail.com') and coalesce((auth.jwt() ->> 'email_verified')::boolean,true));
  create trigger trg_log_work_relationship after insert or update or delete on public.work_relationship
   for each row execute function public.log_change('relationship_id');
end $migration$;
