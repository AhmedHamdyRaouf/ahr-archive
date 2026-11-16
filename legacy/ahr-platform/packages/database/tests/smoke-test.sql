-- Implements: Testing Architecture (Phase 9) — "تحقق التكامل البنيوي" /
-- structural integrity verification layer, for the Archive schema created
-- in migrations 20260717180000–20260717181300.
--
-- This script is self-contained and self-rolling-back: it wraps every
-- check in a transaction and ROLLBACKs at the end, so it can be run
-- against any environment (including production) without leaving test
-- data behind. Run with:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f packages/database/tests/smoke-test.sql

begin;

do $$
declare
  test_person_id  uuid;
  test_work_id    uuid;
  before_ts       timestamptz;
  after_ts        timestamptz;
begin
  -- Fixtures -----------------------------------------------------------
  insert into person (public_id, name_ar, name_en, created_by, updated_by)
  values ('smoke-test-person', 'شخص اختبار', 'Smoke Test Person', gen_random_uuid(), gen_random_uuid())
  returning id into test_person_id;

  insert into work (public_id, title_ar, title_en, work_type, created_by, updated_by)
  values ('smoke-test-work', 'عمل اختبار', 'Smoke Test Work', 'song', gen_random_uuid(), gen_random_uuid())
  returning id into test_work_id;

  -- 1. Contribution requires at least one of work/project/event --------
  begin
    insert into contribution (person_id, role, created_by, updated_by)
    values (test_person_id, 'composer', gen_random_uuid(), gen_random_uuid());
    raise exception 'SMOKE TEST FAILED: contribution with no target was allowed';
  exception when check_violation then
    raise notice 'PASS: contribution without work/project/event rejected';
  end;

  -- Contribution with a target succeeds
  insert into contribution (person_id, work_id, role, created_by, updated_by)
  values (test_person_id, test_work_id, 'composer', gen_random_uuid(), gen_random_uuid());
  raise notice 'PASS: contribution with a valid target accepted';

  -- 2. media_asset requires exactly one owner ---------------------------
  begin
    insert into media_asset (media_type, storage_path, created_by, updated_by)
    values ('image', '/x.jpg', gen_random_uuid(), gen_random_uuid());
    raise exception 'SMOKE TEST FAILED: media_asset with zero owners was allowed';
  exception when check_violation then
    raise notice 'PASS: media_asset with zero owners rejected';
  end;

  begin
    insert into media_asset (media_type, storage_path, person_id, work_id, created_by, updated_by)
    values ('image', '/x.jpg', test_person_id, test_work_id, gen_random_uuid(), gen_random_uuid());
    raise exception 'SMOKE TEST FAILED: media_asset with two owners was allowed';
  exception when check_violation then
    raise notice 'PASS: media_asset with two owners rejected';
  end;

  insert into media_asset (media_type, storage_path, person_id, created_by, updated_by)
  values ('image', '/x.jpg', test_person_id, gen_random_uuid(), gen_random_uuid());
  raise notice 'PASS: media_asset with exactly one owner accepted';

  -- 3. ON DELETE RESTRICT protects referenced rows ----------------------
  begin
    delete from person where id = test_person_id;
    raise exception 'SMOKE TEST FAILED: referenced person row was deleted';
  exception when foreign_key_violation then
    raise notice 'PASS: ON DELETE RESTRICT blocked deletion of a referenced person';
  end;

  -- 4. Shared updated_at trigger ----------------------------------------
  select updated_at into before_ts from person where id = test_person_id;
  perform pg_sleep(1);
  update person set bio_en = 'smoke test update' where id = test_person_id;
  select updated_at into after_ts from person where id = test_person_id;

  if after_ts > before_ts then
    raise notice 'PASS: updated_at trigger bumped the timestamp';
  else
    raise exception 'SMOKE TEST FAILED: updated_at did not change after update';
  end if;

  -- 5. status CHECK constraint --------------------------------------------
  begin
    update person set status = 'nonsense_status' where id = test_person_id;
    raise exception 'SMOKE TEST FAILED: invalid status value was accepted';
  exception when check_violation then
    raise notice 'PASS: invalid status value rejected';
  end;

  -- 6. platform_user: 1:1 Person<->User, role constrained ------------------
  declare
    test_admin_id uuid := gen_random_uuid();
  begin
    insert into platform_user (id, person_id, created_by, updated_by)
    values (test_admin_id, test_person_id, test_admin_id, test_admin_id);

    begin
      insert into platform_user (id, person_id, created_by, updated_by)
      values (gen_random_uuid(), test_person_id, test_admin_id, test_admin_id);
      raise exception 'SMOKE TEST FAILED: second platform_user for same person was allowed';
    exception when unique_violation then
      raise notice 'PASS: platform_user enforces 1:1 Person<->User';
    end;

    begin
      update platform_user set role = 'trainer' where id = test_admin_id;
      raise exception 'SMOKE TEST FAILED: invalid platform_user role was accepted';
    exception when check_violation then
      raise notice 'PASS: platform_user role check constraint rejects non-V1 roles';
    end;

    -- 7. moderation_report: valid insert + status check --------------------
    declare
      test_report_id uuid;
    begin
      insert into moderation_report (entity_table, entity_id, reason, reported_by, created_by, updated_by)
      values ('work', test_work_id, 'Smoke test report', test_admin_id, test_admin_id, test_admin_id)
      returning id into test_report_id;

      begin
        update moderation_report set status = 'closed_forever' where id = test_report_id;
        raise exception 'SMOKE TEST FAILED: invalid moderation_report status was accepted';
      exception when check_violation then
        raise notice 'PASS: moderation_report status check constraint works';
      end;
    end;

    -- 8. activity_log: nullable actor, action check -------------------------
    insert into activity_log (actor_id, action) values (null, 'login');
    raise notice 'PASS: activity_log accepts null actor_id';

    begin
      insert into activity_log (actor_id, action) values (test_admin_id, 'teleport');
      raise exception 'SMOKE TEST FAILED: invalid activity_log action was accepted';
    exception when check_violation then
      raise notice 'PASS: activity_log action check constraint works';
    end;
  end;

  -- 9. platform_settings: seeded key-value read ----------------------------
  if (select value from platform_settings where key = 'default_language') = '"ar"'::jsonb then
    raise notice 'PASS: platform_settings seeded correctly';
  else
    raise exception 'SMOKE TEST FAILED: platform_settings seed data incorrect';
  end if;

  raise notice 'ALL SMOKE TESTS PASSED';
end $$;

rollback;
