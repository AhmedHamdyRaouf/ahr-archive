-- Implements: Database Architecture (Frozen v1) §2.4 — activity_log.
-- Append-only audit trail of ACTOR actions (login, logout, create, update,
-- delete, publish, archive, restore, permission changes, settings changes) —
-- distinct from entity_state_transition, which records what happened to a
-- piece of CONTENT (its Data Lifecycle stage), not what an actor did.
--
-- No updated_at: this table is never updated, only ever inserted into, same
-- as entity_state_transition (Database Architecture §2.4).

create table activity_log (
  id            uuid primary key default gen_random_uuid(),

  actor_id      uuid references platform_user (id) on delete restrict,
  entity_type   text,
  entity_id     uuid,
  action        text not null,
  metadata      jsonb,
  ip_address    inet,
  user_agent    text,

  created_at    timestamptz not null default now(),

  constraint chk_activity_log_action
    check (action in ('login', 'logout', 'create', 'update', 'delete',
                       'publish', 'archive', 'restore', 'permission_change',
                       'settings_change'))
);

create index idx_activity_log_actor_id on activity_log (actor_id);
create index idx_activity_log_entity on activity_log (entity_type, entity_id);
create index idx_activity_log_created_at on activity_log (created_at);

comment on table activity_log is
  'Implements: Database Architecture (Frozen v1) §2.4. Append-only actor-action '
  'audit trail. actor_id nullable (e.g. a failed login attempt may have no resolvable actor).';
