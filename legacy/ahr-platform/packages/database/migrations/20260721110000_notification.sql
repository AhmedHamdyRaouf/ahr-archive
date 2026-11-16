-- Implements: Database Architecture Review Round item E4 (Gap Analysis &
-- Remaining Work Report) — activation decision approved by the data owner
-- 2026-07-21 (docs/Program-Status/Decision-Log.md). Previously documented
-- as a deliberate, not-worked-around gap in
-- packages/notifications/docs/blocked-notifications.md §1: "no
-- `notification` table exists in the Frozen v1 Database Architecture."
-- This migration adds exactly the shape that document itself already
-- proposed ("Path to unblocking"): recipient, type, entity reference,
-- message, read_at.
--
-- This does NOT change how in-app awareness worked before
-- (in-app-indicator.ts's live, derived counts — e.g. the Moderation
-- Badge's open-report count) — that stays exactly as-is, since it answers
-- a different question ("how many reports are currently open") than this
-- table answers ("what have I personally been told about, and have I read
-- it"). Nor does this add per-user notification preferences (§2 of the
-- same blocked-notifications.md) — that is a separate, still-open item,
-- not part of this activation.
--
-- Added after the single consolidated RLS migration
-- (20260719120000_row_level_security.sql) already ran — see
-- 20260721100000_ai_recommendation_log.sql's header comment for why this
-- table defines its own RLS inline rather than appending to that file.

create table notification (
  id            uuid primary key default gen_random_uuid(),

  recipient_id  uuid not null references platform_user (id) on delete cascade,
  type          text not null,
  entity_table  text,
  entity_id     uuid,
  message       text not null,

  read_at       timestamptz,
  created_at    timestamptz not null default now(),

  constraint chk_notification_type
    check (type in ('moderation_report_opened', 'moderation_report_escalated',
                     'moderation_report_resolved', 'content_published'))
);

create index idx_notification_recipient on notification (recipient_id);
create index idx_notification_recipient_unread on notification (recipient_id) where read_at is null;
create index idx_notification_created_at on notification (created_at);

comment on table notification is
  'Implements: Database Architecture Review Round item E4 (activated 2026-07-21). '
  'Per-recipient notification inbox -- distinct from activity_log (actor audit trail) '
  'and from the live-derived in-app indicators (e.g. Moderation Badge), which remain unchanged.';

-- RLS: a recipient may only ever read/update their OWN notifications
-- (recipient_id = auth.uid(), the same identity equality
-- platform_user.id already uses elsewhere in this file). Insert is
-- Administrator-only but NOT restricted to inserting rows for oneself --
-- the actor who triggers an event (e.g. resolving a report) is very often
-- a different Administrator than the notification's recipient
-- (report.assigned_to / report.reported_by), matching the existing
-- notifyEvent() call sites in apps/web (notification-dispatch.ts).

alter table notification enable row level security;

create policy notification_recipient_read on notification
  for select
  using (recipient_id = auth.uid());

create policy notification_admin_insert on notification
  for insert
  with check (is_administrator());

-- Update is intentionally narrow in practice (the application only ever
-- sets `read_at`), enforced here at the row level (own notifications
-- only) rather than at the column level, matching the same reasoning
-- already used for ai_recommendation_log_admin_update.
create policy notification_recipient_update on notification
  for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());
