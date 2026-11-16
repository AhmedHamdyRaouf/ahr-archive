-- Implements: Database Architecture (Frozen v1) §8 — Row Level Security
-- Strategy; Security Implementation Rules (Development Specification 14) —
-- "Row Level Security is enabled on every table with no exception in
-- application code."
--
-- FIX (Phase 2 CTO Audit — Milestone 2 / Database Foundation Verification):
-- no prior migration enabled RLS or created a single policy on any of the
-- 20 tables, despite RLS being specified as "enforced by default, no
-- exception" throughout the frozen architecture. This migration closes
-- that gap. It changes no table shape, no column, and no constraint —
-- purely additive security enforcement on the schema exactly as already
-- designed (Development Principles §4: "no silent schema/feature
-- invention" — this is the inverse case, implementing an already-approved
-- control that was missing, not inventing a new one).
--
-- Policy shape used throughout (Database Architecture §8):
--   1. "Public read"               — status = 'published' AND visibility = 'public'
--   2. "Administrator full access" — platform_user.role = 'administrator'
--      for the requesting session
--
-- A SECURITY DEFINER helper (is_administrator()) resolves #2 without
-- recursively re-applying RLS to platform_user itself — the standard,
-- Supabase-documented pattern for this exact situation. It is owned by the
-- migration role (which has BYPASSRLS in Supabase's own project setup),
-- so its internal lookup is not blocked by platform_user's own policies.

create or replace function is_administrator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from platform_user
    where platform_user.id = auth.uid()
      and platform_user.role = 'administrator'
  );
$$;

comment on function is_administrator() is
  'Implements: Database Architecture (Frozen v1) §7-8 — resolves whether the '
  'current session belongs to an administrator, for use in RLS policies. '
  'SECURITY DEFINER so this internal lookup is not itself blocked by '
  'platform_user''s own RLS policies (standard pattern, avoids recursive RLS).';

-- ---------------------------------------------------------------------------
-- 1. Standard content tables — public read (published+public) + admin full access
-- ---------------------------------------------------------------------------

do $$
declare
  content_tables text[] := array[
    'organization', 'person', 'work', 'project', 'event', 'contribution',
    'award', 'category', 'tag', 'media_asset', 'press_mention'
  ];
  t text;
begin
  foreach t in array content_tables loop
    execute format('alter table %I enable row level security', t);

    execute format(
      $f$create policy %I on %I
         for select
         using (status = 'published' and visibility = 'public')$f$,
      t || '_public_read', t
    );

    execute format(
      $f$create policy %I on %I
         for all
         using (is_administrator())
         with check (is_administrator())$f$,
      t || '_admin_all', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Taxonomy join tables — no status/visibility of their own; public
--    readability follows the owning Work/Project row's own publication
--    state (Database Architecture §8 lists join tables under "every
--    content table" without a literal status/visibility column of their
--    own — this is the direct, minimal realization of that intent).
-- ---------------------------------------------------------------------------

alter table work_category enable row level security;
alter table work_tag enable row level security;
alter table project_category enable row level security;
alter table project_tag enable row level security;

create policy work_category_public_read on work_category
  for select
  using (
    exists (
      select 1 from work
      where work.id = work_category.work_id
        and work.status = 'published'
        and work.visibility = 'public'
    )
  );

create policy work_category_admin_all on work_category
  for all
  using (is_administrator())
  with check (is_administrator());

create policy work_tag_public_read on work_tag
  for select
  using (
    exists (
      select 1 from work
      where work.id = work_tag.work_id
        and work.status = 'published'
        and work.visibility = 'public'
    )
  );

create policy work_tag_admin_all on work_tag
  for all
  using (is_administrator())
  with check (is_administrator());

create policy project_category_public_read on project_category
  for select
  using (
    exists (
      select 1 from project
      where project.id = project_category.project_id
        and project.status = 'published'
        and project.visibility = 'public'
    )
  );

create policy project_category_admin_all on project_category
  for all
  using (is_administrator())
  with check (is_administrator());

create policy project_tag_public_read on project_tag
  for select
  using (
    exists (
      select 1 from project
      where project.id = project_tag.project_id
        and project.status = 'published'
        and project.visibility = 'public'
    )
  );

create policy project_tag_admin_all on project_tag
  for all
  using (is_administrator())
  with check (is_administrator());

-- ---------------------------------------------------------------------------
-- 3. platform_user — no public read at all. A session may read its own
--    row (required for the Identity Resolution Chain, Authentication Rules
--    API Specification 13, step ③ — @ahr/auth's resolvePlatformUser reads
--    this table via the request-scoped, RLS-respecting client). Full
--    read/write beyond that is administrator-only. There is no INSERT
--    policy for 'authenticated'/'anon' at all: administrators are seeded
--    directly (Packages Specification Package 01 §16), never
--    self-registered, so ordinary request-handling code never inserts a
--    platform_user row — the one narrow provisioning case
--    (packages/auth/src/sync.ts's documented exception) uses the
--    service-role client, which bypasses RLS by design (§8) and needs no
--    policy here.
-- ---------------------------------------------------------------------------

alter table platform_user enable row level security;

create policy platform_user_self_read on platform_user
  for select
  using (id = auth.uid());

create policy platform_user_admin_all on platform_user
  for all
  using (is_administrator())
  with check (is_administrator());

-- ---------------------------------------------------------------------------
-- 4. moderation_report — first-class workflow entity (not a pure log),
--    matching Permissions Matrix's "Administrator: Read/Write" for the
--    Moderation Queue: administrators open, assign, and transition reports
--    through @ahr/workflow's request-scoped-client service functions.
--    No public read; no policy at all for non-administrator write.
-- ---------------------------------------------------------------------------

alter table moderation_report enable row level security;

create policy moderation_report_admin_all on moderation_report
  for all
  using (is_administrator())
  with check (is_administrator());

-- ---------------------------------------------------------------------------
-- 5. entity_state_transition — truly append-only. Administrators may
--    insert (writing a transition is a side effect of an authenticated
--    admin's own content action, per @ahr/cms-core's genericTransitionStatus)
--    and read (state-history-service.ts). No UPDATE or DELETE policy
--    exists for ANY role, including administrator — matching "never
--    edited, only inserted into" (Database Architecture §2/§9) at the
--    database level, not just as an application-code convention.
-- ---------------------------------------------------------------------------

alter table entity_state_transition enable row level security;

create policy entity_state_transition_admin_read on entity_state_transition
  for select
  using (is_administrator());

create policy entity_state_transition_admin_insert on entity_state_transition
  for insert
  with check (is_administrator());

-- ---------------------------------------------------------------------------
-- 6. activity_log — same append-only shape as entity_state_transition:
--    administrator read, administrator insert, no update/delete policy for
--    any role.
--
--    KNOWN LIMITATION (flagged, not silently patched — see Phase 2 CTO
--    Audit, Milestone 3 / Authentication Verification Report): a FAILED
--    login attempt has no resolvable platform_user/administrator session
--    at the moment of the write (auth never succeeded), so an insert
--    attempted under this policy via the ordinary request-scoped client
--    will be rejected by RLS for that specific case only. Successful
--    login, logout, and every other activity_log write already occur
--    after a session resolves to an administrator, and are unaffected.
--    Recommended remediation (Backlog, not applied here): move the
--    failed-login write path to a SECURITY DEFINER RPC or the service-role
--    client, verified against a live Supabase project once provisioned
--    (Blocking Issue B4) — a targeted application-code change, not a
--    schema or policy change, and out of this migration's safe scope.
-- ---------------------------------------------------------------------------

alter table activity_log enable row level security;

create policy activity_log_admin_read on activity_log
  for select
  using (is_administrator());

create policy activity_log_admin_insert on activity_log
  for insert
  with check (is_administrator());

-- ---------------------------------------------------------------------------
-- 7. platform_settings — selective public read (every key except the two
--    administrator-only operational-configuration keys), full admin
--    read/write on every key (Database Architecture §8).
-- ---------------------------------------------------------------------------

alter table platform_settings enable row level security;

create policy platform_settings_public_read on platform_settings
  for select
  using (key not in ('ai_configuration', 'email_configuration'));

create policy platform_settings_admin_all on platform_settings
  for all
  using (is_administrator())
  with check (is_administrator());
