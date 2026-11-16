-- Applied to the Supabase project (migration "owner_only_policies").
-- RLS stays on; the only policy lets the owner's verified login read and edit every table.
do $$
declare t text;
begin
  foreach t in array array['works','credits','person','events','awards','press','sources','media_assets','life_story','training_choir','roles_education','press_links','review_queue','audience_voices','youtube_videos','data_dictionary']
  loop
    execute format('drop policy if exists owner_all on public.%I', t);
    execute format($p$create policy owner_all on public.%I for all to authenticated using ((auth.jwt() ->> 'email') = 'ahrvision@gmail.com' and coalesce((auth.jwt() ->> 'email_verified')::boolean, true)) with check ((auth.jwt() ->> 'email') = 'ahrvision@gmail.com' and coalesce((auth.jwt() ->> 'email_verified')::boolean, true))$p$, t);
  end loop;
end $$;

-- contact_channels (migration "contact_channels"): same owner_all policy, change_log trigger, and public view pub_contact_channels (privacy = 'عام' and publish = 'نعم').

-- NOTE (2026-11-10): pub_works deliberately also exposes works whose privacy is
-- 'عام (تفاصيل الحقوق: داخلي)' (currently W-0019). Every other pub_* view requires privacy = 'عام'.
-- Restore point of the whole database before the 2026-11-10 upgrade: schema backup_20261110.
