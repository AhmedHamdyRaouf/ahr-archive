-- Implements: Content Taxonomy (Phase 3), Relationship Model (Phase 4) —
-- many-to-many application of Category and Tag to Work and Project, the
-- only two content types Content Taxonomy (Phase 3) documents categories/
-- tags for. Extending tagging to other entity types is a Content Taxonomy
-- change first, not a silent addition of more join tables here.

create table work_category (
  work_id       uuid not null references work (id) on delete restrict,
  category_id   uuid not null references category (id) on delete restrict,
  primary key (work_id, category_id)
);

create index idx_work_category_category_id on work_category (category_id);

create table work_tag (
  work_id       uuid not null references work (id) on delete restrict,
  tag_id        uuid not null references tag (id) on delete restrict,
  primary key (work_id, tag_id)
);

create index idx_work_tag_tag_id on work_tag (tag_id);

create table project_category (
  project_id    uuid not null references project (id) on delete restrict,
  category_id   uuid not null references category (id) on delete restrict,
  primary key (project_id, category_id)
);

create index idx_project_category_category_id on project_category (category_id);

create table project_tag (
  project_id    uuid not null references project (id) on delete restrict,
  tag_id        uuid not null references tag (id) on delete restrict,
  primary key (project_id, tag_id)
);

create index idx_project_tag_tag_id on project_tag (tag_id);

comment on table work_category is 'Implements: Content Taxonomy (Phase 3) — Work ↔ Category.';
comment on table work_tag is 'Implements: Content Taxonomy (Phase 3) — Work ↔ Tag.';
comment on table project_category is 'Implements: Content Taxonomy (Phase 3) — Project ↔ Category.';
comment on table project_tag is 'Implements: Content Taxonomy (Phase 3) — Project ↔ Tag.';
