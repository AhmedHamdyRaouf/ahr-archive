-- AHR Master Archive — indexes, triggers, RLS, policies, storage (exported 2026-11-16)

CREATE INDEX idx_award_work ON archive.award USING btree (work_id);
CREATE INDEX idx_change_log_row ON archive.change_log USING btree (row_id);
CREATE INDEX idx_contribution_person ON archive.contribution USING btree (person_id);
CREATE INDEX idx_contribution_work ON archive.contribution USING btree (work_id);
CREATE INDEX idx_entity_relation_from ON archive.entity_relation USING btree (from_entity);
CREATE INDEX idx_entity_relation_to ON archive.entity_relation USING btree (to_entity);
CREATE INDEX idx_entity_type ON archive.entity USING btree (entity_type);
CREATE INDEX idx_event_work ON archive.event USING btree (work_id);
CREATE INDEX idx_link_entity_id ON archive.link USING btree (entity_id);
CREATE INDEX idx_press_work ON archive.press_mention USING btree (work_id);
CREATE INDEX idx_press_work2 ON archive.press_mention USING btree (work_id_2);
CREATE INDEX idx_project_item_work ON archive.project_item USING btree (work_id);
CREATE INDEX idx_relationship_source ON archive.relationship USING btree (source_work);
CREATE INDEX idx_relationship_target ON archive.relationship USING btree (target_work);
CREATE INDEX idx_review_item_entity_id ON archive.review_item USING btree (entity_id);
CREATE INDEX idx_source_snapshot_entity_id ON archive.source_snapshot USING btree (entity_id);
CREATE INDEX idx_video_work ON archive.video USING btree (work_id);
CREATE INDEX idx_video_work2 ON archive.video USING btree (work_id_2);
CREATE INDEX idx_work_category ON archive.work USING btree (category);
CREATE INDEX idx_work_parent ON archive.work USING btree (parent_entity_id);
CREATE UNIQUE INDEX uq_review_item_identity ON archive.review_item USING btree (COALESCE(entity_id, '00000000-0000-0000-0000-000000000000'::uuid), reason, COALESCE(detail, ''::text));

-- entity: never hard-deleted, updated_at maintained
CREATE TRIGGER trg_entity_nodelete BEFORE DELETE ON archive.entity FOR EACH ROW EXECUTE FUNCTION archive.ref_reject_delete();
CREATE TRIGGER trg_entity_touch BEFORE UPDATE ON archive.entity FOR EACH ROW EXECUTE FUNCTION archive.touch();

-- change log on every content table (trg_log_<name>; review_item -> trg_log_review)
do $$ declare t text; begin
  foreach t in array array['award','contribution','date_value','entity','entity_relation','event','fact','life_story','link','media_asset','organization','person','press_mention','project_item','relationship','review_item','site_text','source','translation','video','work'] loop
    execute format('create trigger %I after insert or delete or update on archive.%I for each row execute function archive.log_change()',
      'trg_log_'||case t when 'review_item' then 'review' else t end, t);
  end loop;
end $$;

-- row level security + app role policy
do $$ declare t text; begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='archive' and c.relkind='r' loop
    execute format('alter table archive.%I enable row level security', t);
    execute format('create policy app_all on archive.%I as permissive for all to archive_app using (true) with check (true)', t);
  end loop;
end $$;

-- storage bucket for files (private); staff only
insert into storage.buckets (id, name, public) values ('archive-files','archive-files',false) on conflict do nothing;
create policy archive_files_insert on storage.objects for insert to authenticated with check (bucket_id = 'archive-files' and archive.is_staff(true));
create policy archive_files_select on storage.objects for select to authenticated using (bucket_id = 'archive-files' and archive.is_staff(false));
