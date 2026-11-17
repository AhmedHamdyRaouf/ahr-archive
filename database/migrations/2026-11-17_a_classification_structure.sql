-- Entity Classification restructuring — Part A: backup + new tables + function updates (no data moved here)
-- Backups (rollback source). Never dropped by this migration.
create table archive.bk_cls_20261117_entity          as select * from archive.entity;
create table archive.bk_cls_20261117_organization    as select * from archive.organization;
create table archive.bk_cls_20261117_event           as select * from archive.event;
create table archive.bk_cls_20261117_entity_relation as select * from archive.entity_relation;
create table archive.bk_cls_20261117_translation     as select * from archive.translation;
alter table archive.bk_cls_20261117_entity          enable row level security;
alter table archive.bk_cls_20261117_organization    enable row level security;
alter table archive.bk_cls_20261117_event           enable row level security;
alter table archive.bk_cls_20261117_entity_relation enable row level security;
alter table archive.bk_cls_20261117_translation     enable row level security;

-- New type tables (one row per entity, same pattern as organization/event)
create table archive.festival (
  entity_id uuid primary key references archive.entity(id) on delete restrict,
  name_ar text, name_en text, festival_type text, legacy_type text);
create table archive.ensemble (
  entity_id uuid primary key references archive.entity(id) on delete restrict,
  name_ar text, name_en text, legacy_type text,
  ensemble_type text not null default 'Other'
    constraint chk_ensemble_type check (ensemble_type in ('Choir','Vocal Ensemble','Orchestra','Band','Other')));
create table archive.ensemble_membership (
  entity_id uuid primary key references archive.entity(id) on delete restrict,
  ensemble_id uuid not null references archive.entity(id) on delete restrict,
  person_id uuid not null references archive.entity(id) on delete restrict,
  role text, start_year integer, end_year integer,
  constraint chk_membership_years check (end_year is null or start_year is null or end_year >= start_year));
create table archive.program (
  entity_id uuid primary key references archive.entity(id) on delete restrict,
  name_ar text, name_en text, legacy_type text,
  program_kind text not null default 'Other'
    constraint chk_program_kind check (program_kind in ('Training Program','Evaluation Service','Other')));
create table archive.project (
  entity_id uuid primary key references archive.entity(id) on delete restrict,
  name_ar text, name_en text, project_type text, legacy_type text);
create table archive.season (
  entity_id uuid primary key references archive.entity(id) on delete restrict,
  name_ar text, name_en text, legacy_type text);
create index idx_ensemble_membership_ensemble on archive.ensemble_membership(ensemble_id);
create index idx_ensemble_membership_person   on archive.ensemble_membership(person_id);

do $$ declare t text; begin
 foreach t in array array['festival','ensemble','ensemble_membership','program','project','season'] loop
  execute format('alter table archive.%I enable row level security', t);
  execute format('create policy app_all on archive.%I for all to archive_app using (true) with check (true)', t);
  execute format('grant select, insert, update on archive.%I to archive_app', t);
  execute format('create trigger trg_log_%s after insert or update or delete on archive.%I for each row execute function archive.log_change()', t, t);
 end loop; end $$;

create or replace function archive.ext_table(t text) returns text language sql immutable set search_path to '' as $f$
 select case t when 'work' then 'work' when 'person' then 'person' when 'contribution' then 'contribution' when 'relationship' then 'relationship'
  when 'event' then 'event' when 'award' then 'award' when 'press_mention' then 'press_mention' when 'media_asset' then 'media_asset'
  when 'source' then 'source' when 'video' then 'video' when 'project_item' then 'project_item' when 'life_story' then 'life_story'
  when 'site_text' then 'site_text' when 'fact' then 'fact' when 'organization' then 'organization'
  when 'digital_profile' then 'digital_profile' when 'contact_info' then 'contact_info'
  when 'festival' then 'festival' when 'ensemble' then 'ensemble' when 'ensemble_membership' then 'ensemble_membership'
  when 'program' then 'program' when 'project' then 'project' when 'season' then 'season' end $f$;

-- api_create: prefixes + required names + membership branch for the new types
create or replace function archive.api_create(p jsonb) returns jsonb language plpgsql set search_path to '' as $f$
declare t text := p->>'type'; v_id uuid; code text; pre text; k text; v text; tbl text := archive.ext_table(p->>'type'); req text;
begin
 perform archive.set_editor(p->>'editor');
 if tbl is null then raise exception 'نوع غير معروف'; end if;
 pre := case t when 'work' then 'W-' when 'person' then 'P-' when 'contribution' then 'C-' when 'relationship' then 'WR-' when 'event' then 'E-' when 'award' then 'A-'
   when 'press_mention' then 'PR-' when 'media_asset' then 'MA-' when 'source' then 'SRC-' when 'video' then 'YV-' when 'project_item' then 'PI-'
   when 'life_story' then 'LS-' when 'site_text' then 'TX-' when 'organization' then 'ORG-' when 'digital_profile' then 'DP-' when 'contact_info' then 'CI-'
   when 'festival' then 'FES-' when 'ensemble' then 'ENS-' when 'ensemble_membership' then 'EM-' when 'program' then 'PRG-' when 'project' then 'PRJ-' when 'season' then 'SEA-'
   when 'fact' then case p->>'fact_kind' when 'audience_voice' then 'AV-' when 'contact' then 'CT-' when 'press_link' then 'PL-' when 'role_education' then 'RE-' when 'training_choir' then 'TC-' else 'F-' end end;
 code := archive.next_code(pre);
 insert into archive.entity(public_code,entity_type,verification,privacy,confirmation_scope)
 values(code,t,coalesce(nullif(p->>'verification',''),'Pending Review'),coalesce(nullif(p->>'privacy',''),'Internal'),
        'Entered in dashboard by '||current_setting('app.editor',true)||' '||to_char(now(),'YYYY-MM-DD')) returning id into v_id;
 req := case t when 'work' then 'title_ar' when 'person' then 'name_ar' when 'organization' then 'name_ar'
   when 'festival' then 'name_ar' when 'ensemble' then 'name_ar' when 'program' then 'name_ar' when 'project' then 'name_ar' when 'season' then 'name_ar' end;
 if req is not null and nullif(btrim(p->'fields'->>req),'') is null then raise exception 'الاسم أو العنوان مطلوب'; end if;
 if t='work' then insert into archive.work(entity_id,title_ar) values(v_id,btrim(p->'fields'->>'title_ar'));
 elsif t='person' then insert into archive.person(entity_id,name_ar) values(v_id,btrim(p->'fields'->>'name_ar'));
 elsif t='organization' then insert into archive.organization(entity_id,name_ar) values(v_id,btrim(p->'fields'->>'name_ar'));
 elsif t='contribution' then insert into archive.contribution(entity_id,work_id,person_id,role) values(v_id,(p->'ext'->>'work_id')::uuid,nullif(p->'ext'->>'person_id','')::uuid,p->'ext'->>'role');
 elsif t='ensemble_membership' then insert into archive.ensemble_membership(entity_id,ensemble_id,person_id) values(v_id,(p->'ext'->>'ensemble_id')::uuid,(p->'ext'->>'person_id')::uuid);
 elsif t='relationship' then insert into archive.relationship(entity_id,source_work,target_work,relationship_type) values(v_id,(p->'ext'->>'source_work')::uuid,(p->'ext'->>'target_work')::uuid,coalesce(p->'ext'->>'relationship_type','related'));
 elsif t='fact' then insert into archive.fact(entity_id,fact_kind) values(v_id,coalesce(p->>'fact_kind','note'));
 elsif t='digital_profile' then insert into archive.digital_profile(entity_id,section) values(v_id,coalesce(nullif(p->'ext'->>'section',''),'social'));
 elsif t='contact_info' then insert into archive.contact_info(entity_id,kind) values(v_id,coalesce(nullif(p->'ext'->>'kind',''),'phone'));
 else execute format('insert into archive.%I(entity_id) values($1)',tbl) using v_id; end if;
 for k,v in select key,value from jsonb_each_text(coalesce(p->'fields','{}')) loop perform archive.apply_field(v_id,t,k,'ar',v,null); end loop;
 for k,v in select key,value from jsonb_each_text(coalesce(p->'fields_en','{}')) loop perform archive.apply_field(v_id,t,k,'en',v,null); end loop;
 perform archive.apply_ext(v_id,t,(coalesce(p->'ext','{}')) - 'source_work' - 'target_work' - 'work_id' - 'person_id' - 'ensemble_id' - 'role' - 'title_ar' - 'name_ar');
 if t not in ('contribution','ensemble_membership') then perform archive.apply_ext(v_id,t,jsonb_strip_nulls(jsonb_build_object('work_id',p->'ext'->'work_id','person_id',p->'ext'->'person_id'))); end if;
 if t='ensemble_membership' and p->'ext' ? 'role' then perform archive.apply_ext(v_id,t,jsonb_build_object('role',p->'ext'->'role')); end if;
 insert into archive.source_snapshot(entity_id,src_table,src_pk,row_data) values(v_id,'dashboard',code,p - 'editor');
 return jsonb_build_object('ok',true,'id',v_id,'code',code);
end $f$;

-- api_merge: also re-point membership ensemble_id
create or replace function archive.api_merge(p jsonb) returns jsonb language plpgsql set search_path to '' as $f$
declare k uuid := (p->>'keep')::uuid; r uuid := (p->>'remove')::uuid; c record;
begin
 perform archive.set_editor(p->>'editor');
 if k=r or (select entity_type from archive.entity where id=k) is distinct from (select entity_type from archive.entity where id=r) then raise exception 'لازم سجلين مختلفين من نفس النوع'; end if;
 for c in select table_name t, column_name col from information_schema.columns where table_schema='archive' and data_type='uuid'
   and column_name in ('work_id','work_id_2','person_id','parent_entity_id','source_work','target_work','from_entity','to_entity','ensemble_id') loop
   execute format('update archive.%I set %I=$1 where %I=$2',c.t,c.col,c.col) using k,r;
 end loop;
 insert into archive.link(entity_id,kind,url) select k,kind,url from archive.link where entity_id=r on conflict do nothing;
 insert into archive.translation(entity_id,field,lang,body,status,author) select k,field,lang,body,status,author from archive.translation where entity_id=r on conflict do nothing;
 update archive.entity set lifecycle='Archived', publication='Unpublished' where id=r;
 insert into archive.entity_relation(from_entity,to_entity,kind,note) values(r,k,'merged_into','Merged in dashboard') on conflict do nothing;
 return jsonb_build_object('ok',true);
end $f$;
